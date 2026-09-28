import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class JobRequisition(Base):
    __tablename__ = "job_requisitions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    position_title: Mapped[str] = mapped_column(String(255))
    department_id: Mapped[str] = mapped_column(String(100))
    quantity: Mapped[int] = mapped_column(Integer)
    justification: Mapped[str] = mapped_column(Text)
    budget_range: Mapped[str] = mapped_column(String(100))
    # BR-01: Draft, Pending Approval, Approved, Rejected, Closed
    status: Mapped[str] = mapped_column(String(50), default="Draft")
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RequisitionApproval(Base):
    """Tracks the requisition's approval step — Hiring Manager decides, with
    Recruiting Administrator able to override (FR-03.2, BR-03)."""

    __tablename__ = "requisition_approvals"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    requisition_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("job_requisitions.id"))
    approver_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    sequence: Mapped[int] = mapped_column(Integer)
    decision: Mapped[str] = mapped_column(String(50), default="Pending")  # Pending, Approved, Rejected
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
