import uuid
from datetime import datetime

from pydantic import BaseModel


class CandidateIntake(BaseModel):
    full_name: str
    email: str
    phone: str
    cv_file_url: str
    position_title: str  # used to derive folder_path
    stage: str = "Applied"
    applicant_type: str = "Full-time"


class CandidateOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: str
    cv_file_url: str
    position_title: str
    stage: str
    applicant_type: str
    possible_duplicate: bool
    folder_path: str
    applied_at: datetime

    model_config = {"from_attributes": True}
