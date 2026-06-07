from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.employee import Employee
from app.models.department import Department
from app.models.employee_risk import EmployeeRiskProfile


router = APIRouter()


# ---- Schemas ----

class EmployeeCreate(BaseModel):
    name: str
    email: str
    department_id: int | None = None
    position: str | None = None


class EmployeeUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    department_id: int | None = None
    position: str | None = None
    is_active: bool | None = None


# ---- Endpoints ----

@router.get("")
async def list_employees(
    department_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List employees with optional filtering and pagination."""
    query = (
        select(Employee, Department.name.label("department_name"))
        .outerjoin(Department, Employee.department_id == Department.id)
        .where(Employee.created_by == current_user.id)
    )

    if department_id:
        query = query.where(Employee.department_id == department_id)
    if search:
        query = query.where(
            Employee.name.ilike(f"%{search}%") | Employee.email.ilike(f"%{search}%")
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    offset = (page - 1) * limit
    query = query.order_by(Employee.name).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    return {
        "data": [
            {
                "id": str(emp.id),
                "name": emp.name,
                "email": emp.email,
                "department_id": emp.department_id,
                "department_name": dept_name,
                "position": emp.position,
                "is_active": emp.is_active,
                "created_at": emp.created_at.isoformat(),
            }
            for emp, dept_name in rows
        ],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_employee(
    data: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new employee."""
    existing = await db.execute(select(Employee).where(Employee.email == data.email, Employee.created_by == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email karyawan sudah terdaftar di akun Anda")

    if data.department_id:
        # Verify department belongs to user
        dept = await db.execute(select(Department).where(Department.id == data.department_id, Department.created_by == current_user.id))
        if not dept.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Departemen tidak valid")

    emp = Employee(
        name=data.name,
        email=data.email,
        department_id=data.department_id,
        position=data.position,
        created_by=current_user.id,
    )
    db.add(emp)
    await db.flush()

    # Create initial risk profile
    risk = EmployeeRiskProfile(employee_id=emp.id)
    db.add(risk)

    return {"id": str(emp.id), "name": emp.name, "email": emp.email}


@router.get("/{employee_id}")
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get employee details with risk profile."""
    result = await db.execute(
        select(Employee, Department.name.label("department_name"))
        .outerjoin(Department, Employee.department_id == Department.id)
        .where(Employee.id == employee_id, Employee.created_by == current_user.id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")

    emp, dept_name = row

    # Get risk profile
    risk_result = await db.execute(
        select(EmployeeRiskProfile).where(EmployeeRiskProfile.employee_id == emp.id)
    )
    risk = risk_result.scalar_one_or_none()

    return {
        "id": str(emp.id),
        "name": emp.name,
        "email": emp.email,
        "department_id": emp.department_id,
        "department_name": dept_name,
        "position": emp.position,
        "is_active": emp.is_active,
        "risk_profile": {
            "total_score": risk.total_score if risk else 0,
            "risk_level": risk.risk_level if risk else "LOW",
            "times_opened": risk.times_opened if risk else 0,
            "times_clicked": risk.times_clicked if risk else 0,
            "times_submitted": risk.times_submitted if risk else 0,
        } if risk else None,
        "created_at": emp.created_at.isoformat(),
    }


@router.put("/{employee_id}")
async def update_employee(
    employee_id: str,
    data: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an employee."""
    result = await db.execute(select(Employee).where(Employee.id == employee_id, Employee.created_by == current_user.id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")

    if data.department_id is not None:
        # Verify department belongs to user
        dept = await db.execute(select(Department).where(Department.id == data.department_id, Department.created_by == current_user.id))
        if not dept.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Departemen tidak valid")

    if data.email is not None and data.email != emp.email:
        existing = await db.execute(select(Employee).where(Employee.email == data.email, Employee.created_by == current_user.id))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email karyawan sudah terdaftar di akun Anda")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(emp, field, value)

    await db.flush()
    return {"id": str(emp.id), "name": emp.name, "email": emp.email}


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an employee."""
    result = await db.execute(select(Employee).where(Employee.id == employee_id, Employee.created_by == current_user.id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")

    await db.delete(emp)
    await db.flush()
