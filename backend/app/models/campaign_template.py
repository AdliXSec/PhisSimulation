import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class CampaignTemplate(Base):
    __tablename__ = "campaign_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    campaign_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    body_html: Mapped[str] = mapped_column(Text, nullable=False)
    sender_name: Mapped[str] = mapped_column(String(200), nullable=False)
    sender_email: Mapped[str | None] = mapped_column(String(255))
    department_target: Mapped[str | None] = mapped_column(String(200))
    ai_metadata: Mapped[dict] = mapped_column(JSONB, default=dict)
    landing_page_config: Mapped[dict] = mapped_column(JSONB, default=dict)
    landing_page_mode: Mapped[str | None] = mapped_column(String(20), default="ai")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
