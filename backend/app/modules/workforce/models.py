import uuid
from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ManpowerPlan(Base):
    __tablename__ = "manpower_plans"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    department_id: Mapped[str] = mapped_column(String(100))
    department_name: Mapped[str] = mapped_column(String(255))
    position_title: Mapped[str] = mapped_column(String(255))
    current_headcount: Mapped[int] = mapped_column(Integer, default=0)
    target_headcount: Mapped[int] = mapped_column(Integer)
    budget_headcount: Mapped[int] = mapped_column(Integer)
    justification: Mapped[str | None] = mapped_column(Text, nullable=True)
    period_year: Mapped[int] = mapped_column(Integer)
    period_month: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(50), default="Draft")
    created_by: Mapped[uuid.UUID] = mapped_column(String(36))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
