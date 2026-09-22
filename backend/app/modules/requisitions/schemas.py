import uuid
from datetime import datetime

from pydantic import BaseModel


class RequisitionCreate(BaseModel):
    position_title: str
    department_id: str
    quantity: int
    justification: str
    budget_range: str


class RequisitionOut(BaseModel):
    id: uuid.UUID
    position_title: str
    department_id: str
    quantity: int
    justification: str
    budget_range: str
    status: str
    created_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class ApprovalDecision(BaseModel):
    decision: str  # "Approved" | "Rejected"
    reason: str | None = None
