import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ScorecardTemplate(Base):
    """FR-05: reusable scoring rubric. Criteria carry a weight so the final
    score is a weighted average, not a plain mean."""

    __tablename__ = "scorecard_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    # None means the template applies to every position.
    position_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # [{"name": str, "weight": int, "description": str}]
    criteria: Mapped[list] = mapped_column(JSON, default=list)
    # Weighted percentage at or above which the recommendation is "Advance".
    pass_threshold: Mapped[int] = mapped_column(Integer, default=70)
    # Lowest weighted percentage that still counts as "Hold" instead of "Reject".
    hold_threshold: Mapped[int] = mapped_column(Integer, default=50)
    is_default: Mapped[bool] = mapped_column(default=False)
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ScreeningEvaluation(Base):
    """FR-05: one reviewer's scorecard for one candidate."""

    __tablename__ = "screening_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    candidate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("candidates.id"))
    template_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scorecard_templates.id"))
    reviewer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    # {"<criterion name>": score 1-5}
    scores: Mapped[dict] = mapped_column(JSON, default=dict)
    # {"<criterion name>": str}
    notes: Mapped[dict] = mapped_column(JSON, default=dict)
    overall_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Weighted percentage 0-100, computed server-side.
    weighted_score: Mapped[float] = mapped_column(default=0.0)
    # Advance | Hold | Reject
    recommendation: Mapped[str] = mapped_column(String(20), default="Hold")
    # Draft | Submitted
    status: Mapped[str] = mapped_column(String(20), default="Submitted")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
