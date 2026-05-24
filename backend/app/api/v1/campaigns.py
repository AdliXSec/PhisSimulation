import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.campaign import Campaign
from app.models.campaign_template import CampaignTemplate
from app.models.campaign_target import CampaignTarget
from app.models.campaign_log import CampaignLog
from app.models.employee import Employee
from app.services.ai_service import generate_phishing_template, generate_landing_page_config
from app.services.email_service import send_campaign_emails


router = APIRouter()


# ---- Schemas ----

class CampaignCreate(BaseModel):
    name: str
    description: str | None = None
    difficulty: str = "MEDIUM"
    theme: str | None = None
    target_departments: list[int] = []
    
    # Landing Page Options
    landing_page_mode: str = "ai"  # 'ai', 'custom', 'template', 'raw'
    landing_page_config: dict | None = None  # For custom/raw mode
    landing_page_template_id: str | None = None  # For template mode
    
    # Email Options
    email_mode: str = "ai" # 'ai' or 'custom'
    email_subject: str | None = None
    email_sender: str | None = None
    email_body: str | None = None


class CampaignUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    difficulty: str | None = None
    theme: str | None = None
    external_url: str | None = None


# ---- Endpoints ----

@router.get("")
async def list_campaigns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all campaigns with target counts."""
    result = await db.execute(
        select(
            Campaign,
            func.count(CampaignTarget.id).label("target_count"),
        )
        .outerjoin(CampaignTarget, CampaignTarget.campaign_id == Campaign.id)
        .where(Campaign.created_by == current_user.id)
        .group_by(Campaign.id)
        .order_by(Campaign.created_at.desc())
    )
    rows = result.all()

    return [
        {
            "id": str(c.id),
            "name": c.name,
            "status": c.status,
            "difficulty": c.difficulty,
            "theme": c.theme,
            "target_count": count,
            "created_at": c.created_at.isoformat(),
            "started_at": c.started_at.isoformat() if c.started_at else None,
            "ended_at": c.ended_at.isoformat() if c.ended_at else None,
        }
        for c, count in rows
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_campaign(
    data: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new phishing campaign."""
    campaign = Campaign(
        name=data.name,
        description=data.description,
        difficulty=data.difficulty,
        theme=data.theme,
        target_departments=data.target_departments,
        created_by=current_user.id,
    )
    db.add(campaign)
    await db.flush()

    # Auto-create targets for employees in selected departments
    if data.target_departments:
        result = await db.execute(
            select(Employee).where(
                Employee.department_id.in_(data.target_departments),
                Employee.created_by == current_user.id,
                Employee.is_active == True,
            )
        )
        employees = result.scalars().all()

        for emp in employees:
            target = CampaignTarget(
                campaign_id=campaign.id,
                employee_id=emp.id,
                token=str(uuid.uuid4()).replace("-", ""),
            )
            db.add(target)

    # Immediately create CampaignTemplate
    template = CampaignTemplate(
        campaign_id=campaign.id,
        landing_page_mode=data.landing_page_mode,
        landing_page_config=data.landing_page_config if data.landing_page_mode != "ai" else None,
        subject=data.email_subject if data.email_mode == "custom" else "[AI DRAFT]",
        body_html=data.email_body if data.email_mode == "custom" else "[AI DRAFT]",
        sender_name=data.email_sender if data.email_mode == "custom" else "IT Support",
    )
    db.add(template)

    # If both modes are custom, the campaign is ready immediately
    if data.email_mode == "custom" and data.landing_page_mode != "ai":
        campaign.status = "READY"

    await db.flush()

    return {"id": str(campaign.id), "name": campaign.name, "status": campaign.status}


@router.get("/{campaign_id}")
async def get_campaign(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get campaign detail with targets and template."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.created_by == current_user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    # Get templates
    templates_result = await db.execute(
        select(CampaignTemplate).where(CampaignTemplate.campaign_id == campaign.id)
    )
    templates = templates_result.scalars().all()

    # Get target stats
    targets_result = await db.execute(
        select(
            CampaignTarget.status,
            func.count(CampaignTarget.id),
        )
        .where(CampaignTarget.campaign_id == campaign.id)
        .group_by(CampaignTarget.status)
    )
    status_counts = {s: c for s, c in targets_result.all()}

    return {
        "id": str(campaign.id),
        "name": campaign.name,
        "description": campaign.description,
        "status": campaign.status,
        "difficulty": campaign.difficulty,
        "theme": campaign.theme,
        "target_departments": campaign.target_departments,
        "templates": [
            {
                "id": str(t.id),
                "subject": t.subject,
                "body_html": t.body_html,
                "sender_name": t.sender_name,
                "department_target": t.department_target,
                "landing_page_mode": t.landing_page_mode,
                "landing_page_config": t.landing_page_config,
            }
            for t in templates
        ],
        "target_stats": status_counts,
        "created_at": campaign.created_at.isoformat(),
        "started_at": campaign.started_at.isoformat() if campaign.started_at else None,
        "ended_at": campaign.ended_at.isoformat() if campaign.ended_at else None,
    }


@router.post("/{campaign_id}/generate")
async def generate_template(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Use AI to generate phishing email template for the campaign."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.created_by == current_user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    if campaign.status not in ("DRAFT", "READY"):
        raise HTTPException(status_code=400, detail="Kampanye tidak dalam status DRAFT/READY")

    campaign.status = "GENERATING"
    await db.flush()

    try:
        # Get existing template
        result_tmpl = await db.execute(select(CampaignTemplate).where(CampaignTemplate.campaign_id == campaign.id))
        template = result_tmpl.scalar_one_or_none()

        if not template:
            # Fallback if somehow it wasn't created
            template = CampaignTemplate(campaign_id=campaign.id, landing_page_mode="ai", subject="[AI DRAFT]", body_html="[AI DRAFT]", sender_name="IT Support")
            db.add(template)

        # Generate Email if it's in AI mode
        if template.subject == "[AI DRAFT]":
            external_url = None
            if template.landing_page_mode == "external" and template.landing_page_config:
                external_url = template.landing_page_config.get("url")

            ai_result = await generate_phishing_template(
                theme=campaign.theme or "Peringatan Keamanan",
                difficulty=campaign.difficulty,
                target_departments=campaign.target_departments,
                external_url=external_url,
            )
            template.subject = ai_result["subject"]
            template.body_html = ai_result["body_html"]
            template.sender_name = ai_result["sender_name"]
            template.sender_email = ai_result.get("sender_email")
            template.department_target = ai_result.get("department_target")
            template.ai_metadata = ai_result.get("metadata", {})

        # Generate Landing Page if it's in AI mode
        if template.landing_page_mode == "ai" and not template.landing_page_config:
            landing_config = await generate_landing_page_config(
                theme=campaign.theme or "Peringatan Keamanan",
                difficulty=campaign.difficulty,
            )
            template.landing_page_config = landing_config

        campaign.status = "READY"
        await db.flush()

        return {
            "message": "Template berhasil diproses",
            "template": {
                "id": str(template.id),
                "subject": template.subject,
                "body_html": template.body_html,
                "sender_name": template.sender_name,
                "landing_page_config": template.landing_page_config,
                "landing_page_mode": template.landing_page_mode,
            },
        }
    except Exception as e:
        campaign.status = "DRAFT"
        await db.flush()
        raise HTTPException(status_code=500, detail=f"Gagal generate template: {str(e)}")


@router.post("/{campaign_id}/launch")
async def launch_campaign(
    campaign_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Launch the campaign — send phishing emails to all targets."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.created_by == current_user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    if campaign.status != "READY":
        raise HTTPException(status_code=400, detail="Kampanye harus dalam status READY untuk diluncurkan")

    campaign.status = "LAUNCHING"
    campaign.started_at = datetime.now(timezone.utc)
    await db.flush()

    # Schedule background email sending
    background_tasks.add_task(send_campaign_emails, str(campaign.id))

    return {"message": "Kampanye sedang diluncurkan", "status": "LAUNCHING"}


@router.patch("/{campaign_id}/stop")
async def stop_campaign(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stop an active campaign."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.created_by == current_user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    campaign.status = "STOPPED"
    campaign.ended_at = datetime.now(timezone.utc)
    await db.flush()

    return {"message": "Kampanye dihentikan", "status": "STOPPED"}


@router.put("/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    data: CampaignUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a campaign."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.created_by == current_user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    if data.name is not None:
        campaign.name = data.name
    if data.description is not None:
        campaign.description = data.description
    if data.difficulty is not None:
        campaign.difficulty = data.difficulty
    if data.theme is not None:
        campaign.theme = data.theme

    if data.external_url is not None:
        template_result = await db.execute(select(CampaignTemplate).where(CampaignTemplate.campaign_id == campaign.id))
        template = template_result.scalar_one_or_none()
        if template:
            # Pastikan mode-nya external
            template.landing_page_mode = "external"
            # Update config (jsonb field)
            # Karena jsonb di sqlalchemy, kadang butuh flag modified atau assignment baru
            config = template.landing_page_config or {}
            # Copy to avoid dict mutation issues with SQLAlchemy
            new_config = dict(config)
            new_config["url"] = data.external_url
            template.landing_page_config = new_config

    await db.flush()
    return {"message": "Kampanye diperbarui"}


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a campaign."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.created_by == current_user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    # For strict DBs, might need to manually delete targets, templates, and logs if CASCADE is not set.
    # Since SQLAlchemy relationships might not have cascade="all, delete" configured on the Python side,
    # and to be safe, we can just delete the campaign and let DB ON DELETE CASCADE handle it, or manually delete.
    
    # We will assume DB handles cascade. If it fails, we will need to add manual deletions.
    await db.delete(campaign)
    # SQLAlchemy async delete flush
    await db.flush()
