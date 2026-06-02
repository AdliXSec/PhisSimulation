import uuid
from datetime import datetime, timezone
from sqlalchemy import text, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class EmployeeRiskProfile(Base):
    __tablename__ = "employee_risk_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, server_default=text('gen_random_uuid()'))
    employee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    total_score: Mapped[int] = mapped_column(Integer, default=0)
    risk_level: Mapped[str] = mapped_column(String(20), default="LOW")
    campaigns_participated: Mapped[int] = mapped_column(Integer, default=0)
    times_opened: Mapped[int] = mapped_column(Integer, default=0)
    times_clicked: Mapped[int] = mapped_column(Integer, default=0)
    times_submitted: Mapped[int] = mapped_column(Integer, default=0)
    last_assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
