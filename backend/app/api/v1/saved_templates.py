from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.saved_template import SavedTemplate
from app.models.campaign_template import CampaignTemplate

router = APIRouter()

class SavedTemplateCreate(BaseModel):
    name: str
    description: str | None = None
    email_subject: str
    email_body_html: str
    email_sender_name: str
    landing_page_config: dict | None = None

class SavedTemplateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

@router.get("")
async def list_saved_templates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all saved templates."""
    result = await db.execute(
        select(SavedTemplate)
        .where(SavedTemplate.created_by == current_user.id)
        .order_by(SavedTemplate.created_at.desc())
    )
    templates = result.scalars().all()
    return templates

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_saved_template(
    data: SavedTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new saved template."""
    template = SavedTemplate(
        name=data.name,
        description=data.description,
        email_subject=data.email_subject,
        email_body_html=data.email_body_html,
        email_sender_name=data.email_sender_name,
        landing_page_config=data.landing_page_config or {},
        created_by=current_user.id
    )
    db.add(template)
    await db.flush()
    return {"id": str(template.id), "name": template.name}

@router.post("/from-campaign/{campaign_template_id}", status_code=status.HTTP_201_CREATED)
async def save_template_from_campaign(
    campaign_template_id: str,
    name: str,
    description: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save an existing campaign template to the library."""
    result = await db.execute(select(CampaignTemplate).where(CampaignTemplate.id == campaign_template_id))
    camp_tmpl = result.scalar_one_or_none()
    
    if not camp_tmpl:
        raise HTTPException(status_code=404, detail="Campaign template not found")
        
    saved = SavedTemplate(
        name=name,
        description=description,
        email_subject=camp_tmpl.subject,
        email_body_html=camp_tmpl.body_html,
        email_sender_name=camp_tmpl.sender_name,
        landing_page_config=camp_tmpl.landing_page_config,
        created_by=current_user.id
    )
    db.add(saved)
    await db.flush()
    return {"id": str(saved.id), "name": saved.name}

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(SavedTemplate).where(SavedTemplate.id == template_id, SavedTemplate.created_by == current_user.id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    await db.delete(template)
    await db.flush()
