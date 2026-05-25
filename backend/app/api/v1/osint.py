from fastapi import APIRouter, Depends, HTTPException, status
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

@router.post("/scrape")
async def scrape_url(request: OsintScrapeRequest, current_user: User = Depends(get_current_user)):
    url = request.url
    try:
        jina_url = f"https://r.jina.ai/{url}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "text/event-stream"
        }
        
        async with httpx.AsyncClient(follow_redirects=True, verify=False, timeout=20.0) as client:
            resp = await client.get(jina_url, headers=headers)
            if resp.status_code == 451:
                raise ValueError("LinkedIn dan beberapa situs sosial secara hukum melarang scraping. Silakan copy-paste manual dari situs tersebut.")
            if resp.status_code == 200:
                text = resp.text
                if len(text) > 8000:
                    text = text[:8000] + "... [TRUNCATED]"
                return {"text": text}
            
            resp = await client.get(url, headers=headers, timeout=10.0)
            if resp.status_code != 200:
                raise ValueError(f"HTTP Status {resp.status_code}")
                
            soup = BeautifulSoup(resp.text, "html.parser")
            for script in soup(["script", "style"]):
                script.extract()
                
            text = soup.get_text(separator=" ", strip=True)
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
