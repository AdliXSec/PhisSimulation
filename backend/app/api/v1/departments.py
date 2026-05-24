from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.department import Department
from app.models.employee import Employee


router = APIRouter()


# ---- Schemas ----

class DepartmentCreate(BaseModel):
    name: str
    description: str | None = None


class DepartmentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    employee_count: int = 0
    created_at: str


# ---- Endpoints ----

@router.get("")
async def list_departments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all departments with employee count for the current user."""
    result = await db.execute(
        select(
            Department,
            func.count(Employee.id).label("employee_count"),
        )
        .outerjoin(Employee, Employee.department_id == Department.id)
        .where(Department.created_by == current_user.id)
        .group_by(Department.id)
        .order_by(Department.name)
    )
    rows = result.all()

    return [
        DepartmentResponse(
            id=dept.id,
            name=dept.name,
            description=dept.description,
            employee_count=count,
            created_at=dept.created_at.isoformat(),
        )
        for dept, count in rows
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_department(
    data: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new department."""
    existing = await db.execute(select(Department).where(Department.name == data.name, Department.created_by == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Nama departemen sudah ada di akun Anda")

    dept = Department(name=data.name, description=data.description, created_by=current_user.id)
    db.add(dept)
    await db.flush()

    return {"id": dept.id, "name": dept.name, "description": dept.description}


@router.get("/{dept_id}")
async def get_department(
    dept_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single department by ID."""
    result = await db.execute(select(Department).where(Department.id == dept_id, Department.created_by == current_user.id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Departemen tidak ditemukan")

    # Count employees
    count_result = await db.execute(
        select(func.count(Employee.id)).where(Employee.department_id == dept_id, Employee.created_by == current_user.id)
    )
    employee_count = count_result.scalar() or 0

    return DepartmentResponse(
        id=dept.id,
        name=dept.name,
        description=dept.description,
        employee_count=employee_count,
        created_at=dept.created_at.isoformat(),
    )


@router.put("/{dept_id}")
async def update_department(
    dept_id: int,
    data: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a department."""
    result = await db.execute(select(Department).where(Department.id == dept_id, Department.created_by == current_user.id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Departemen tidak ditemukan")

    if data.name is not None:
        # Check duplicate
        if data.name != dept.name:
            existing = await db.execute(select(Department).where(Department.name == data.name, Department.created_by == current_user.id))
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Nama departemen sudah ada di akun Anda")
        dept.name = data.name
    if data.description is not None:
        dept.description = data.description

    await db.flush()
    return {"id": dept.id, "name": dept.name, "description": dept.description}


@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(
    dept_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a department."""
    result = await db.execute(select(Department).where(Department.id == dept_id, Department.created_by == current_user.id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Departemen tidak ditemukan")

    await db.delete(dept)
    await db.flush()
