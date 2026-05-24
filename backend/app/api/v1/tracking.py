import base64
from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.models.campaign_target import CampaignTarget
from app.models.campaign_template import CampaignTemplate
from app.models.campaign_log import CampaignLog


router = APIRouter()

# 1x1 transparent GIF pixel
TRACKING_PIXEL = base64.b64decode(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
)

# Default landing page config fallback
_DEFAULT_LANDING_CONFIG = {
    "title": "Verifikasi Keamanan Akun",
    "subtitle": "Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.",
    "logo_emoji": "🔒",
    "brand_name": "Secure Portal",
    "primary_color": "#0066cc",
    "bg_color": "#f5f5f5",
    "text_color": "#1a1a1a",
    "button_text": "Masuk",
    "button_color": "#0066cc",
    "form_fields": [
        {"name": "email", "label": "Email atau Username", "type": "text", "placeholder": "nama@perusahaan.com"},
        {"name": "password", "label": "Password", "type": "password", "placeholder": "Masukkan password Anda"},
    ],
    "footer_text": "Dengan masuk, Anda menyetujui kebijakan keamanan perusahaan.",
    "theme_style": "corporate",
}


def _extract_metadata(request: Request) -> dict:
    """Extract tracking metadata from HTTP request."""
    return {
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown"),
        "referer": request.headers.get("referer"),
        "accept_language": request.headers.get("accept-language"),
    }


@router.get("/pixel/{token}")
async def track_pixel(
    token: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Tracking pixel endpoint — logs EMAIL_OPENED event.
    Embedded as 1x1 transparent image in phishing email.
    """
    result = await db.execute(
        select(CampaignTarget).where(CampaignTarget.token == token)
    )
    target = result.scalar_one_or_none()

    if target:
        log = CampaignLog(
            target_id=target.id,
            event_type="EMAIL_OPENED",
            metadata_=_extract_metadata(request),
        )
        db.add(log)

    return Response(content=TRACKING_PIXEL, media_type="image/gif")


@router.get("/click/{token}")
async def track_click(
    token: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Link click tracker — logs LINK_CLICKED and redirects to landing page."""
    result = await db.execute(
        select(CampaignTarget).where(CampaignTarget.token == token)
    )
    target = result.scalar_one_or_none()

    if target:
        log = CampaignLog(
            target_id=target.id,
            event_type="LINK_CLICKED",
            metadata_=_extract_metadata(request),
        )
        db.add(log)

    # Check if campaign uses external link
    template_result = await db.execute(
        select(CampaignTemplate)
        .join(CampaignTarget, CampaignTarget.campaign_id == CampaignTemplate.campaign_id)
        .where(CampaignTarget.token == token)
    )
    template = template_result.scalar_one_or_none()
    
    if template and template.landing_page_mode == "external" and template.landing_page_config:
        external_url = template.landing_page_config.get("url")
        if external_url:
            return RedirectResponse(url=external_url)

    # Redirect to the fake landing page on the frontend
    landing_url = f"{settings.FRONTEND_URL}/landing/{token}"
    return RedirectResponse(url=landing_url)


@router.get("/landing-config/{token}")
async def get_landing_config(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Return the landing page configuration for a given target token.
    Called by the frontend to dynamically render the decoy landing page.
    No auth required — this is a public endpoint accessed by targets.
    """
    result = await db.execute(
        select(CampaignTarget).where(CampaignTarget.token == token)
    )
    target = result.scalar_one_or_none()

    if not target:
        # Return default config even for invalid tokens (don't reveal info)
        return {"config": _DEFAULT_LANDING_CONFIG}

    # Get the template associated with this target
    if target.template_id:
        tmpl_result = await db.execute(
            select(CampaignTemplate).where(CampaignTemplate.id == target.template_id)
        )
        template = tmpl_result.scalar_one_or_none()
    else:
        # Fallback: get the latest template for the campaign
        tmpl_result = await db.execute(
            select(CampaignTemplate)
            .where(CampaignTemplate.campaign_id == target.campaign_id)
            .order_by(CampaignTemplate.created_at.desc())
            .limit(1)
        )
        template = tmpl_result.scalar_one_or_none()

    if template and template.landing_page_config:
        return {"config": template.landing_page_config}

    return {"config": _DEFAULT_LANDING_CONFIG}


@router.post("/submit/{token}")
async def track_submit(
    token: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Form submission tracker — logs DATA_SUBMITTED with captured form data."""
    result = await db.execute(
        select(CampaignTarget).where(CampaignTarget.token == token)
    )
    target = result.scalar_one_or_none()

    # Try to read submitted form data from request body
    submitted_data = {}
    try:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            submitted_data = await request.json()
        elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
            form = await request.form()
            submitted_data = dict(form)
        else:
            # Try JSON first, fallback to empty
            try:
                submitted_data = await request.json()
            except Exception:
                submitted_data = {}
    except Exception:
        submitted_data = {}

    if target:
        meta = _extract_metadata(request)
        meta["data_submitted"] = True
        meta["submitted_data"] = submitted_data  # Store actual form field values
        log = CampaignLog(
            target_id=target.id,
            event_type="DATA_SUBMITTED",
            metadata_=meta,
        )
        db.add(log)

    # Redirect to education page
    education_url = f"{settings.FRONTEND_URL}/education/{token}"
    return RedirectResponse(url=education_url, status_code=303)
