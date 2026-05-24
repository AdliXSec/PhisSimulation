import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.landing_page_template import LandingPageTemplate


router = APIRouter()


# ---- Schemas ----

class LandingPageConfigField(BaseModel):
    name: str
    label: str
    type: str = "text"
    placeholder: str = ""


class LandingPageConfig(BaseModel):
    title: str = "Account Verification"
    subtitle: str = "Please sign in to continue"
    logo_emoji: str = "🔒"
    logo_image: str | None = None
    brand_name: str = "Secure Portal"
    primary_color: str = "#0066cc"
    bg_color: str = "#f5f5f5"
    bg_image: str | None = None
    text_color: str = "#1a1a1a"
    button_text: str = "Sign In"
    button_color: str = "#0066cc"
    form_fields: list[LandingPageConfigField] = []
    footer_text: str = ""
    theme_style: str = "generic"
    raw_html: str | None = None
    custom_css: str | None = None


class LandingPageTemplateCreate(BaseModel):
    name: str
    description: str | None = None
    config: dict


class LandingPageTemplateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    config: dict | None = None


# ---- Helpers ----

def _serialize_template(t: LandingPageTemplate) -> dict:
    return {
        "id": str(t.id),
        "name": t.name,
        "description": t.description,
        "config": t.config,
        "is_default": t.is_default,
        "created_at": t.created_at.isoformat(),
        "updated_at": t.updated_at.isoformat(),
    }


# ---- Endpoints ----

@router.get("")
async def list_landing_page_templates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all landing page templates (defaults + user-created)."""
    result = await db.execute(
        select(LandingPageTemplate).order_by(
            LandingPageTemplate.is_default.desc(),
            LandingPageTemplate.created_at.desc(),
        )
    )
    templates = result.scalars().all()
    return [_serialize_template(t) for t in templates]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_landing_page_template(
    data: LandingPageTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new custom landing page template."""
    template = LandingPageTemplate(
        name=data.name,
        description=data.description,
        config=data.config,
        created_by=current_user.id,
        is_default=False,
    )
    db.add(template)
    await db.flush()
    return _serialize_template(template)


@router.get("/{template_id}")
async def get_landing_page_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific landing page template."""
    result = await db.execute(
        select(LandingPageTemplate).where(LandingPageTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template tidak ditemukan")
    return _serialize_template(template)


@router.put("/{template_id}")
async def update_landing_page_template(
    template_id: str,
    data: LandingPageTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a landing page template (cannot update defaults)."""
    result = await db.execute(
        select(LandingPageTemplate).where(LandingPageTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template tidak ditemukan")
    if template.is_default:
        raise HTTPException(status_code=400, detail="Template default tidak bisa diubah")

    if data.name is not None:
        template.name = data.name
    if data.description is not None:
        template.description = data.description
    if data.config is not None:
        template.config = data.config

    await db.flush()
    return _serialize_template(template)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_landing_page_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a landing page template (cannot delete defaults)."""
    result = await db.execute(
        select(LandingPageTemplate).where(LandingPageTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template tidak ditemukan")
    if template.is_default:
        raise HTTPException(status_code=400, detail="Template default tidak bisa dihapus")

    await db.delete(template)
    await db.flush()
