import re
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.modules.candidates.models import Candidate
from app.modules.candidates.schemas import CandidateIntake


def _slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def build_folder_path(position_title: str, stage: str, applied_at: datetime) -> str:
    """FR-01.2: automated virtual foldering by position + recruitment stage."""
    return f"{_slugify(position_title)}/{_slugify(stage)}/{applied_at:%Y-%m}"


def find_duplicate(db: Session, email: str, phone: str) -> Candidate | None:
    """FR-01.3: detect duplicate candidates by email or phone."""
    return db.query(Candidate).filter(or_(Candidate.email == email, Candidate.phone == phone)).first()


def intake_candidate(db: Session, payload: CandidateIntake) -> Candidate:
    if find_duplicate(db, payload.email, payload.phone):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Candidate with this email or phone already exists",
        )

    applied_at = datetime.utcnow()
    candidate = Candidate(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        cv_file_url=payload.cv_file_url,
        folder_path=build_folder_path(payload.position_title, payload.stage, applied_at),
        applied_at=applied_at,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


def search_candidates(db: Session, query: str | None) -> list[Candidate]:
    q = db.query(Candidate)
    if query:
        like = f"%{query}%"
        q = q.filter(or_(Candidate.full_name.ilike(like), Candidate.email.ilike(like), Candidate.folder_path.ilike(like)))
    return q.order_by(Candidate.applied_at.desc()).all()
