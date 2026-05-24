"""
External Phishing Data Receiver
Public endpoint that accepts POST data from external phishing sites.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.api_key import ApiKey
from app.models.campaign import Campaign
from app.models.campaign_target import CampaignTarget
from app.models.campaign_log import CampaignLog
from app.models.employee import Employee


router = APIRouter()


def _extract_metadata(request: Request) -> dict:
    """Extract tracking metadata from HTTP request."""
    return {
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown"),
        "referer": request.headers.get("referer"),
        "origin": request.headers.get("origin"),
    }


@router.post("")
async def receive_external_data(
    request: Request,
    key: str = Query(..., description="API Key for authentication"),
    db: AsyncSession = Depends(get_db),
):
    """
    Receive submitted data from external phishing sites.
    
    External phishing sites POST form data to this endpoint with their API key.
    The data is logged as EXTERNAL_SUBMITTED under the campaign linked to the API key.
    
    Example usage:
        POST /api/v1/receive?key=abc123
        Content-Type: application/json
        {"email": "target@company.com", "password": "secret123"}
    
    If the posted data includes an 'email' field that matches a campaign target,
    the submission will be linked to that specific target. Otherwise, a generic
    log entry is created under the first available target of the campaign.
    """
    # 1. Validate API key
    result = await db.execute(
        select(ApiKey).where(ApiKey.key == key, ApiKey.is_active == True)
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(status_code=403, detail="Invalid or inactive API key")

    # 2. Verify campaign exists and is active
    campaign_result = await db.execute(
        select(Campaign).where(Campaign.id == api_key.campaign_id)
    )
    campaign = campaign_result.scalar_one_or_none()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # 3. Read submitted data from request body
    submitted_data = {}
    try:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            submitted_data = await request.json()
        elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
            form = await request.form()
            submitted_data = dict(form)
        else:
            try:
                submitted_data = await request.json()
            except Exception:
                submitted_data = {}
    except Exception:
        submitted_data = {}

    if not submitted_data:
        raise HTTPException(status_code=400, detail="No data received in request body")

    # 4. Try to match to a specific campaign target by email
    target_id = None
    target_email = submitted_data.get("email") or submitted_data.get("username") or submitted_data.get("user")

    if target_email:
        # Try to find an employee with this email who is a target of this campaign
        target_result = await db.execute(
            select(CampaignTarget)
            .join(Employee, CampaignTarget.employee_id == Employee.id)
            .where(
                CampaignTarget.campaign_id == api_key.campaign_id,
                Employee.email == target_email,
            )
        )
        matched_target = target_result.scalar_one_or_none()
        if matched_target:
            target_id = matched_target.id

    # 5. If no match, use the first target of the campaign as fallback
    if not target_id:
        fallback_result = await db.execute(
            select(CampaignTarget)
            .where(CampaignTarget.campaign_id == api_key.campaign_id)
            .limit(1)
        )
        fallback_target = fallback_result.scalar_one_or_none()
        if fallback_target:
            target_id = fallback_target.id

    if not target_id:
        raise HTTPException(
            status_code=400,
            detail="No targets found for this campaign. Please add targets first."
        )

    # 6. Create campaign log entry
    meta = _extract_metadata(request)
    meta["data_submitted"] = True
    meta["submitted_data"] = submitted_data
    meta["source"] = "external"
    meta["api_key_name"] = api_key.name
    meta["api_key_id"] = str(api_key.id)
    meta["matched_email"] = target_email if target_email else None

    log = CampaignLog(
        target_id=target_id,
        event_type="EXTERNAL_SUBMITTED",
        metadata_=meta,
    )
    db.add(log)

    # 7. Update API key last_used_at
    api_key.last_used_at = datetime.now(timezone.utc)

    await db.flush()

    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "message": "Data received successfully",
            "campaign": campaign.name,
            "matched_target": bool(target_email and target_id),
        }
    )
