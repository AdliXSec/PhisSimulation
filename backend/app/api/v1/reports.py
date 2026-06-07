from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db, async_session
from app.api.deps import get_current_user, get_language
from app.models.user import User
from app.models.campaign import Campaign
from app.models.campaign_target import CampaignTarget
from app.models.campaign_log import CampaignLog
from app.models.employee import Employee
from app.models.employee_risk import EmployeeRiskProfile
from app.models.department import Department
from app.models.campaign_template import CampaignTemplate
from app.services.ai_service import generate_campaign_analysis


async def process_ai_analysis_bg(campaign_id: str, stats_summary: str, lang: str):
    """Background task to generate AI analysis for a campaign."""
    async with async_session() as db:
        campaign = None
        try:
            result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
            campaign = result.scalar_one_or_none()
            if not campaign:
                print(f"Background task failed: Campaign {campaign_id} not found")
                return

            print(f"Starting AI analysis generation for campaign {campaign_id}")
            analysis = await generate_campaign_analysis(stats_summary, lang)
            print(f"AI analysis generation complete for campaign {campaign_id}")
            
            # Save to database for persistence
            campaign.ai_analysis = analysis
            await db.commit()
        except Exception as e:
            print(f"Error in background AI analysis: {e}")
            # If we fail, write a failure marker
            if campaign:
                campaign.ai_analysis = "_FAILED_"
                await db.commit()


router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get overall dashboard statistics."""
    # Total counts
    total_employees = (await db.execute(select(func.count(Employee.id)).where(Employee.created_by == current_user.id))).scalar() or 0
    total_campaigns = (await db.execute(select(func.count(Campaign.id)).where(Campaign.created_by == current_user.id))).scalar() or 0
    active_campaigns = (await db.execute(
        select(func.count(Campaign.id)).where(Campaign.status == "ACTIVE", Campaign.created_by == current_user.id)
    )).scalar() or 0

    # Risk distribution
    risk_result = await db.execute(
        select(
            EmployeeRiskProfile.risk_level,
            func.count(EmployeeRiskProfile.id),
        )
        .join(Employee, EmployeeRiskProfile.employee_id == Employee.id)
        .where(Employee.created_by == current_user.id)
        .group_by(EmployeeRiskProfile.risk_level)
    )
    risk_distribution = {level: count for level, count in risk_result.all()}

    # Event stats
    event_result = await db.execute(
        select(
            CampaignLog.event_type,
            func.count(CampaignLog.id),
        )
        .join(CampaignTarget, CampaignLog.target_id == CampaignTarget.id)
        .join(Campaign, CampaignTarget.campaign_id == Campaign.id)
        .where(Campaign.created_by == current_user.id)
        .group_by(CampaignLog.event_type)
    )
    event_stats = {event: count for event, count in event_result.all()}

    # Total targets
    total_targets = (await db.execute(
        select(func.count(CampaignTarget.id))
        .join(Campaign, CampaignTarget.campaign_id == Campaign.id)
        .where(Campaign.created_by == current_user.id)
    )).scalar() or 0

    # Click rate
    total_clicked = event_stats.get("LINK_CLICKED", 0)
    click_rate = round((total_clicked / total_targets * 100), 1) if total_targets > 0 else 0

    return {
        "total_employees": total_employees,
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "total_targets": total_targets,
        "click_rate": click_rate,
        "risk_distribution": risk_distribution,
        "event_stats": event_stats,
    }


@router.get("/campaigns/{campaign_id}")
async def get_campaign_report(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed campaign report with per-target breakdown and captured data."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.created_by == current_user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    # Get all targets with employee info
    targets_result = await db.execute(
        select(CampaignTarget, Employee.name, Employee.email, Department.name.label("dept_name"))
        .join(Employee, CampaignTarget.employee_id == Employee.id)
        .outerjoin(Department, Employee.department_id == Department.id)
        .where(CampaignTarget.campaign_id == campaign.id)
    )
    targets = targets_result.all()

    # Get all logs for this campaign's targets to extract submitted data
    target_ids = [target.id for target, _, _, _ in targets]
    logs_result = await db.execute(
        select(CampaignLog)
        .where(
            CampaignLog.target_id.in_(target_ids),
            CampaignLog.event_type.in_(["DATA_SUBMITTED", "EXTERNAL_SUBMITTED", "DEVICE_FINGERPRINTED"]),
        )
        .order_by(CampaignLog.created_at.desc())
    )
    logs = logs_result.scalars().all()

    # Get templates for the campaign so they can be saved
    tmpl_result = await db.execute(select(CampaignTemplate).where(CampaignTemplate.campaign_id == campaign.id))
    templates = tmpl_result.scalars().all()

    # Map target_id -> list of internal submissions
    submissions_by_target = {}
    external_submissions = []

    # Map target ids to employee names for external submissions reference
    target_to_employee = {str(t.id): (name, email) for t, name, email, _ in targets}

    for log in logs:
        tid = str(log.target_id)
        source = log.metadata_.get("source", "landing_page")
        
        sub_info = {
            "event_type": log.event_type,
            "submitted_data": log.metadata_.get("submitted_data", {}),
            "fingerprint": log.metadata_.get("fingerprint", {}),
            "source": source,
            "api_key_name": log.metadata_.get("api_key_name"),
            "ip": log.metadata_.get("ip", "unknown"),
            "user_agent": log.metadata_.get("user_agent", "unknown"),
            "created_at": log.created_at.isoformat(),
        }

        if log.event_type == "EXTERNAL_SUBMITTED" or source == "external":
            # Add target info if we know it
            emp_name, emp_email = target_to_employee.get(tid, ("Unknown", "Unknown"))
            sub_info["matched_employee"] = emp_name
            sub_info["matched_email"] = log.metadata_.get("matched_email", emp_email)
            external_submissions.append(sub_info)
        elif log.event_type == "DEVICE_FINGERPRINTED":
            if tid not in submissions_by_target:
                submissions_by_target[tid] = []
            submissions_by_target[tid].append(sub_info)
        else:
            if tid not in submissions_by_target:
                submissions_by_target[tid] = []
            submissions_by_target[tid].append(sub_info)

    # Event counts per status
    status_counts = {}
    for target, _, _, _ in targets:
        status_counts[target.status] = status_counts.get(target.status, 0) + 1

    total = len(targets)

    return {
        "campaign": {
            "id": str(campaign.id),
            "name": campaign.name,
            "status": campaign.status,
            "difficulty": campaign.difficulty,
            "theme": campaign.theme,
            "started_at": campaign.started_at.isoformat() if campaign.started_at else None,
            "ended_at": campaign.ended_at.isoformat() if campaign.ended_at else None,
        },
        "summary": {
            "total_targets": total,
            "sent": status_counts.get("SENT", 0),
            "opened": status_counts.get("OPENED", 0),
            "clicked": status_counts.get("CLICKED", 0),
            "submitted": status_counts.get("SUBMITTED", 0),
            "open_rate": round(status_counts.get("OPENED", 0) / total * 100, 1) if total > 0 else 0,
            "click_rate": round(status_counts.get("CLICKED", 0) / total * 100, 1) if total > 0 else 0,
            "submit_rate": round(status_counts.get("SUBMITTED", 0) / total * 100, 1) if total > 0 else 0,
        },
        "targets": [
            {
                "id": str(target.id),
                "employee_name": name,
                "employee_email": email,
                "department": dept_name,
                "status": target.status,
                "email_sent_at": target.email_sent_at.isoformat() if target.email_sent_at else None,
                "submissions": submissions_by_target.get(str(target.id), []),
            }
            for target, name, email, dept_name in targets
        ],
        "external_submissions": external_submissions,
        "ai_analysis": campaign.ai_analysis,
        "templates": [
            {
                "id": str(t.id),
                "subject": t.subject,
                "body_html": t.body_html,
                "sender_name": t.sender_name,
            }
            for t in templates
        ] if 'templates' in locals() else []
    }


@router.post("/campaigns/{campaign_id}/ai-analysis")
async def get_ai_analysis(
    campaign_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    lang: str = Depends(get_language),
):
    """Generate AI-powered analysis and recommendations for a campaign."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.created_by == current_user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampanye tidak ditemukan")

    # Gather statistics
    targets_result = await db.execute(
        select(CampaignTarget.status, func.count(CampaignTarget.id))
        .where(CampaignTarget.campaign_id == campaign.id)
        .group_by(CampaignTarget.status)
    )
    stats = {s: c for s, c in targets_result.all()}

    total = sum(stats.values())
    stats_summary = (
        f"Kampanye: {campaign.name}\n"
        f"Tema: {campaign.theme}\n"
        f"Tingkat Kesulitan: {campaign.difficulty}\n"
        f"Total Target: {total}\n"
        f"Email Terkirim: {stats.get('SENT', 0)}\n"
        f"Email Dibuka: {stats.get('OPENED', 0)}\n"
        f"Link Diklik: {stats.get('CLICKED', 0)}\n"
        f"Data Diserahkan: {stats.get('SUBMITTED', 0)}"
    )

    # Set magic string so frontend knows it's generating
    campaign.ai_analysis = "_GENERATING_AI_"
    await db.commit()

    # Schedule background task
    background_tasks.add_task(process_ai_analysis_bg, str(campaign.id), stats_summary, lang)

    return {"message": "Analisis AI sedang diproses di latar belakang", "status": "GENERATING"}
