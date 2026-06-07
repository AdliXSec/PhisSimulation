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
    ui_position_x: float | None = None
    ui_position_y: float | None = None
    emp_ui_position_x: float | None = None
    emp_ui_position_y: float | None = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    employee_count: int = 0
    ui_position_x: float | None = None
    ui_position_y: float | None = None
    emp_ui_position_x: float | None = None
    emp_ui_position_y: float | None = None
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
            ui_position_x=dept.ui_position_x,
            ui_position_y=dept.ui_position_y,
            emp_ui_position_x=dept.emp_ui_position_x,
            emp_ui_position_y=dept.emp_ui_position_y,
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
        ui_position_x=dept.ui_position_x,
        ui_position_y=dept.ui_position_y,
        emp_ui_position_x=dept.emp_ui_position_x,
        emp_ui_position_y=dept.emp_ui_position_y,
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
    if data.ui_position_x is not None:
        dept.ui_position_x = data.ui_position_x
    if data.ui_position_y is not None:
        dept.ui_position_y = data.ui_position_y
    if data.emp_ui_position_x is not None:
        dept.emp_ui_position_x = data.emp_ui_position_x
    if data.emp_ui_position_y is not None:
        dept.emp_ui_position_y = data.emp_ui_position_y
        
    # special case for resetting position to null
    if data.ui_position_x == -9999.0 and data.ui_position_y == -9999.0:
        dept.ui_position_x = None
        dept.ui_position_y = None
    if data.emp_ui_position_x == -9999.0 and data.emp_ui_position_y == -9999.0:
        dept.emp_ui_position_x = None
        dept.emp_ui_position_y = None

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
