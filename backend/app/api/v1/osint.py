from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.osint import OsintProfile
from app.services.ai_service import analyze_osint_profile
from app.core.limiter import limiter

router = APIRouter()

class OsintAnalyzeRequest(BaseModel):
    target_name: str
    target_role: str
    public_data: str

class OsintScrapeRequest(BaseModel):
    url: str

@router.post("/analyze")
async def analyze_osint(
    request: OsintAnalyzeRequest, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await analyze_osint_profile(
            target_name=request.target_name,
            target_role=request.target_role,
            public_data=request.public_data
        )
        
        # Save to DB
        new_profile = OsintProfile(
            target_name=request.target_name,
            target_role=request.target_role,
            public_data=request.public_data,
            risk_level=result.get("risk_level", "UNKNOWN"),
            vulnerability_summary=result.get("vulnerability_summary", ""),
            attack_vectors=result.get("attack_vectors", []),
            example_phishing_email=result.get("example_phishing_email", {}),
            created_by_id=current_user.id
        )
        db.add(new_profile)
        await db.commit()
        await db.refresh(new_profile)
        
        # Return saved object data along with result
        return {
            "id": str(new_profile.id),
            "target_name": new_profile.target_name,
            "target_role": new_profile.target_role,
            **result
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal melakukan analisis OSINT: {str(e)}"
        )

@router.get("")
async def get_osint_profiles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(OsintProfile).where(OsintProfile.created_by_id == current_user.id).order_by(OsintProfile.created_at.desc())
    )
    profiles = result.scalars().all()
    return profiles

@router.get("/{profile_id}")
async def get_osint_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(OsintProfile).where(OsintProfile.id == profile_id, OsintProfile.created_by_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil OSINT tidak ditemukan")
    return profile

@router.delete("/{profile_id}")
async def delete_osint_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(OsintProfile).where(OsintProfile.id == profile_id, OsintProfile.created_by_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil OSINT tidak ditemukan")
        
    await db.delete(profile)
    await db.commit()
    return {"status": "success"}

from app.services.scraper_service import scrape_target_url

@router.post("/scrape")
@limiter.limit("10/minute")
async def scrape_url(
    request: Request,
    scrape_data: OsintScrapeRequest, 
    current_user: User = Depends(get_current_user)
):
    url = scrape_data.url
    try:
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
            
        text = await scrape_target_url(url)
        
        if not text or len(text.strip()) < 50:
            raise ValueError("Tidak dapat menemukan teks yang cukup pada URL tersebut. Halaman mungkin kosong atau diproteksi dengan ketat.")
            
        if len(text) > 8000:
            text = text[:8000] + "... [TRUNCATED]"
            
        return {"text": text}
            
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal melakukan scraping pada URL tersebut: {str(e)}"
        )
