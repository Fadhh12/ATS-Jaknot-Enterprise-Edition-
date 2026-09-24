import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
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
    # FR-01.3: set when this person (matched by name/email/phone) has an earlier
    # application on file — "same_position" or "different_position", else None.
    duplicate_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    # FR-01.2: virtual folder path, e.g. "warehouse-staff/screening/2026-09"
    folder_path: Mapped[str] = mapped_column(String(500))
    # Optional manually-created folder (see modules/folders) on top of the
    # automated position/stage grouping above.
    folder_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("folders.id"), nullable=True)
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
