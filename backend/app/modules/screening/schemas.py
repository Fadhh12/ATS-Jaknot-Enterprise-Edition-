import uuid
from datetime import datetime

from pydantic import BaseModel


class Criterion(BaseModel):
    name: str
    weight: int
    description: str = ""


class ScorecardTemplateCreate(BaseModel):
    name: str
    position_title: str | None = None
    criteria: list[Criterion]
    pass_threshold: int = 70
    hold_threshold: int = 50
    is_default: bool = False


class ScorecardTemplateOut(BaseModel):
    id: uuid.UUID
    name: str
    position_title: str | None
    criteria: list[dict]
    pass_threshold: int
    hold_threshold: int
    is_default: bool
    created_by: uuid.UUID
    created_by_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ScreeningEvaluationCreate(BaseModel):
    candidate_id: uuid.UUID
    template_id: uuid.UUID
    # {"<criterion name>": score 1-5}
    scores: dict[str, int]
    notes: dict[str, str] = {}
    overall_notes: str | None = None


class ScreeningEvaluationOut(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    candidate_name: str
    candidate_position: str
    candidate_stage: str
    template_id: uuid.UUID
    template_name: str
    reviewer_id: uuid.UUID
    reviewer_name: str
    scores: dict[str, int]
    notes: dict[str, str]
    overall_notes: str | None
    weighted_score: float
    recommendation: str
    status: str
    created_at: datetime
    submitted_at: datetime

    model_config = {"from_attributes": True}


class ScreeningSummary(BaseModel):
    total_in_screening: int
    total_scored: int
    advance: int
    hold: int
    reject: int
    average_score: float
