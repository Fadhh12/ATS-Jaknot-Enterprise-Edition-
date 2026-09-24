import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Folder(Base):
    """User-created folder for manually organizing candidates, separate from
    the automated position/stage grouping computed on the frontend."""

    __tablename__ = "folders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
