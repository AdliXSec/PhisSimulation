import uuid
from datetime import datetime, timezone
from sqlalchemy import text, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class SavedTemplate(Base):
    __tablename__ = "saved_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, server_default=text('gen_random_uuid()'))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    
    # Email config
    email_subject: Mapped[str] = mapped_column(String(500), nullable=False)
    email_body_html: Mapped[str] = mapped_column(Text, nullable=False)
    email_sender_name: Mapped[str] = mapped_column(String(200), nullable=False)
    
    # Landing page config
    landing_page_config: Mapped[dict] = mapped_column(JSONB, default=dict)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
