import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str] = mapped_column(String(50), index=True)
    cv_file_url: Mapped[str] = mapped_column(String(500))
    position_title: Mapped[str] = mapped_column(String(255))
    stage: Mapped[str] = mapped_column(String(50), default="Applied")
    applicant_type: Mapped[str] = mapped_column(String(50), default="Full-time")
    # FR-01.3: flagged (not blocked) when email/phone matches an existing candidate
    possible_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    # FR-01.2: virtual folder path, e.g. "warehouse-staff/screening/2026-09"
    folder_path: Mapped[str] = mapped_column(String(500))
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
