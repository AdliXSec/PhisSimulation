import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.core.database import Base

class OsintProfile(Base):
    __tablename__ = "osint_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    target_name = Column(String(255), nullable=False)
    target_role = Column(String(255), nullable=True)
    public_data = Column(Text, nullable=False)
    
    # Analysis Results
    risk_level = Column(String(50), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    vulnerability_summary = Column(Text, nullable=False)
    attack_vectors = Column(JSONB, nullable=False) # List of strings
    example_phishing_email = Column(JSONB, nullable=False) # Dict {subject, sender, body}
    
    # Audit
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    created_by = relationship("User")
