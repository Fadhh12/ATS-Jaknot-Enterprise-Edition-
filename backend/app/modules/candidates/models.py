import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str] = mapped_column(String(50), index=True)
    cv_file_url: Mapped[str] = mapped_column(String(500))
    # FR-01.2: virtual folder path, e.g. "warehouse-staff/screening/2026-09"
    folder_path: Mapped[str] = mapped_column(String(500))
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
