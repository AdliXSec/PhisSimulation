import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import async_session
from app.models.campaign import Campaign
from app.models.campaign_target import CampaignTarget
from app.models.campaign_template import CampaignTemplate
from app.models.campaign_log import CampaignLog
from app.models.employee import Employee

logger = logging.getLogger(__name__)


try:
    from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

    mail_config = ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=True,
    )
    fast_mail = FastMail(mail_config)
except Exception as e:
    logger.warning(f"Email config error (will use mock mode): {e}")
    fast_mail = None

try:
    import resend
    if settings.RESEND:
        resend.api_key = settings.RESEND_API_KEY
except ImportError:
    resend = None
    if settings.RESEND:
        logger.error("Resend is enabled but 'resend' package is not installed.")

import qrcode
import io
import base64

def _inject_tracking(body_html: str, token: str, use_qr_code: bool = False) -> str:
    """Inject tracking pixel, link, and optionally a QR code."""
    backend_url = settings.BACKEND_URL
    api_prefix = settings.API_V1_PREFIX

    # Tracking link
    tracking_link = f"{backend_url}{api_prefix}/track/click/{token}"
    body_html = body_html.replace("{{tracking_link}}", tracking_link)

    # Optional QR Code Generation (Quishing)
    if use_qr_code:
        qr_url = f"{backend_url}{api_prefix}/track/qr/{token}"
        qr_img_tag = f'<div style="text-align: center; margin: 20px 0;"><img src="{qr_url}" alt="Scan QR Code" style="max-width: 200px; border-radius: 8px; border: 1px solid #ccc; padding: 10px; background: #fff;" /><p style="font-size: 12px; color: #666; margin-top: 8px;">Scan QR Code ini dengan HP Anda</p></div>'
        
        # Inject QR code before the button or at the end of content
        if "<!-- QR_CODE_PLACEHOLDER -->" in body_html:
            body_html = body_html.replace("<!-- QR_CODE_PLACEHOLDER -->", qr_img_tag)
        elif "</a>" in body_html:
             # Try to place it near the first link/button
             body_html = body_html.replace("</a>", f"</a><br/>{qr_img_tag}", 1)
        else:
             body_html += qr_img_tag

    # Inject tracking pixel before </body> or at the end
    pixel_tag = f'<img src="{backend_url}{api_prefix}/track/pixel/{token}" width="1" height="1" style="display:none" />'
    if "</body>" in body_html:
        body_html = body_html.replace("</body>", f"{pixel_tag}</body>")
    else:
        body_html += pixel_tag

    return body_html


async def send_campaign_emails(campaign_id: str):
    """Background task: send phishing emails to all campaign targets with retry logic."""
    async with async_session() as db:
        try:
            # Get campaign
            result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
            campaign = result.scalar_one_or_none()
            if not campaign:
                logger.error(f"Campaign {campaign_id} not found")
                return

            # Reset counts for new launch
            campaign.processed_count = 0
            campaign.error_count = 0
            await db.commit()

            # Get template
            tmpl_result = await db.execute(
                select(CampaignTemplate)
                .where(CampaignTemplate.campaign_id == campaign.id)
                .order_by(CampaignTemplate.created_at.desc())
                .limit(1)
            )
            template = tmpl_result.scalar_one_or_none()
            if not template:
                logger.error(f"No template found for campaign {campaign_id}")
                campaign.status = "DRAFT"
                await db.commit()
                return

            # Get all pending targets
            targets_result = await db.execute(
                select(CampaignTarget, Employee)
                .join(Employee, CampaignTarget.employee_id == Employee.id)
                .where(
                    CampaignTarget.campaign_id == campaign.id,
                    CampaignTarget.status == "PENDING",
                )
            )
            targets = targets_result.all()
            total_targets = len(targets)

            sent_count = 0
            error_count = 0
            
            for target, employee in targets:
                # Per-target retry logic
                max_retries = 3
                retry_count = 0
                success = False
                
                while retry_count < max_retries and not success:
                    try:
                        # Inject tracking into email body
                        personalized_html = _inject_tracking(
                            template.body_html, 
                            target.token,
                            use_qr_code=getattr(campaign, 'use_qr_code', False)
                        )

                        if settings.RESEND and resend:
                            params = {
                                "from": f"{template.sender_name} <{settings.MAIL_FROM}>",
                                "to": [employee.email],
                                "subject": template.subject,
                                "html": personalized_html,
                            }
                            # The Resend Python SDK is synchronous for this call
                            resend.Emails.send(params)
                        elif fast_mail:
                            # Re-initialize FastMail config to inject dynamic sender name
                            custom_config = ConnectionConfig(
                                MAIL_USERNAME=settings.MAIL_USERNAME,
                                MAIL_PASSWORD=settings.MAIL_PASSWORD,
                                MAIL_FROM=settings.MAIL_FROM,
                                MAIL_FROM_NAME=template.sender_name,
                                MAIL_PORT=settings.MAIL_PORT,
                                MAIL_SERVER=settings.MAIL_SERVER,
                                MAIL_STARTTLS=settings.MAIL_STARTTLS,
                                MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
                                USE_CREDENTIALS=True,
                            )
                            custom_fast_mail = FastMail(custom_config)
                            
                            message = MessageSchema(
                                subject=template.subject,
                                recipients=[employee.email],
                                body=personalized_html,
                                subtype=MessageType.html,
                            )
                            await custom_fast_mail.send_message(message)
                        else:
                            # Mock mode
                            logger.info(f"[MOCK EMAIL] To: {employee.email} | Subject: {template.subject}")

                        # Update target status
                        target.status = "SENT"
                        target.email_sent_at = datetime.now(timezone.utc)
                        target.template_id = template.id
                        success = True
                        sent_count += 1

                    except Exception as e:
                        retry_count += 1
                        logger.warning(f"Attempt {retry_count} failed for {employee.email}: {e}")
                        if retry_count < max_retries:
                            import asyncio
                            await asyncio.sleep(2 * retry_count) # Exponential backoff
                        else:
                            logger.error(f"Final failure for {employee.email}")
                            target.status = "FAILED"
                            error_count += 1

                # Update progress in DB every email (for real-time dashboard)
                campaign.processed_count = sent_count
                campaign.error_count = error_count
                
                # Log the event only on success (DB constraint does not allow EMAIL_FAILED)
                if success:
                    log = CampaignLog(
                        target_id=target.id,
                        event_type="EMAIL_SENT",
                        metadata_={"recipient": employee.email, "retries": retry_count},
                    )
                    db.add(log)
                
                await db.commit()
                
                # Prevent SMTP rate limiting
                import asyncio
                await asyncio.sleep(1.2)

            # Update campaign status
            campaign.status = "ACTIVE" if sent_count > 0 else "FAILED"
            await db.commit()

            logger.info(f"Campaign {campaign_id}: sent {sent_count}, failed {error_count} of {total_targets}")

        except Exception as e:
            logger.error(f"Campaign email sending system failure: {e}")
            await db.rollback()
