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


def _inject_tracking(body_html: str, token: str) -> str:
    """Inject tracking pixel and replace tracking link placeholder."""
    backend_url = settings.BACKEND_URL
    api_prefix = settings.API_V1_PREFIX

    # Replace tracking link placeholder
    tracking_link = f"{backend_url}{api_prefix}/track/click/{token}"
    body_html = body_html.replace("{{tracking_link}}", tracking_link)

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
                        personalized_html = _inject_tracking(template.body_html, target.token)

                        if fast_mail:
                            message = MessageSchema(
                                subject=template.subject,
                                recipients=[employee.email],
                                body=personalized_html,
                                subtype=MessageType.html,
                            )
                            await fast_mail.send_message(message)
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
                
                # Log the event
                log = CampaignLog(
                    target_id=target.id,
                    event_type="EMAIL_SENT" if success else "EMAIL_FAILED",
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
