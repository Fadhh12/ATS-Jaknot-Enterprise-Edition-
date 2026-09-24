import uuid
from datetime import datetime

from pydantic import BaseModel


class FolderCreate(BaseModel):
    name: str


class FolderUpdate(BaseModel):
    name: str


class FolderOut(BaseModel):
    id: uuid.UUID
    name: str
    created_by: uuid.UUID
    created_at: datetime
    candidate_count: int = 0

    model_config = {"from_attributes": True}
