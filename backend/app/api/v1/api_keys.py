"""
API Keys CRUD — manage API keys for external phishing site integration.
"""
import uuid
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.api_key import ApiKey
from app.models.campaign import Campaign


router = APIRouter()


# ---- Schemas ----

class ApiKeyCreate(BaseModel):
    name: str
    campaign_id: str


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    campaign_id: str
    campaign_name: str | None = None
    key: str
    is_active: bool
    created_at: str
    last_used_at: str | None = None


# ---- Helpers ----

def _generate_api_key() -> str:
    """Generate a secure random API key (48 chars hex)."""
    return secrets.token_hex(24)


def _serialize_api_key(ak: ApiKey, campaign_name: str | None = None) -> dict:
    return {
        "id": str(ak.id),
        "name": ak.name,
        "campaign_id": str(ak.campaign_id),
        "campaign_name": campaign_name,
        "key": ak.key,
        "is_active": ak.is_active,
        "created_at": ak.created_at.isoformat(),
        "last_used_at": ak.last_used_at.isoformat() if ak.last_used_at else None,
        "receive_url": f"{settings.BACKEND_URL}/api/v1/receive?key={ak.key}",
    }


# ---- Endpoints ----

@router.get("")
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all API keys with their associated campaign names."""
    result = await db.execute(
        select(ApiKey, Campaign.name.label("campaign_name"))
        .outerjoin(Campaign, ApiKey.campaign_id == Campaign.id)
        .where(ApiKey.created_by == current_user.id)
        .order_by(ApiKey.created_at.desc())
    )
    rows = result.all()
    return [_serialize_api_key(ak, campaign_name) for ak, campaign_name in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: ApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new API key for external phishing site integration."""
    # Verify campaign exists
    campaign_result = await db.execute(
        select(Campaign).where(Campaign.id == data.campaign_id, Campaign.created_by == current_user.id)
    )
    campaign = campaign_result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    api_key = ApiKey(
        campaign_id=uuid.UUID(data.campaign_id),
        key=_generate_api_key(),
        name=data.name,
        is_active=True,
        created_by=current_user.id,
    )
    db.add(api_key)
    await db.flush()

    return _serialize_api_key(api_key, campaign.name)


@router.patch("/{key_id}/toggle")
async def toggle_api_key(
    key_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle API key active/inactive status."""
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.created_by == current_user.id)
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="API Key tidak ditemukan")

    api_key.is_active = not api_key.is_active
    await db.flush()

    return {"id": str(api_key.id), "is_active": api_key.is_active}


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    key_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an API key permanently."""
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.created_by == current_user.id)
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="API Key tidak ditemukan")

    await db.delete(api_key)
    await db.flush()
