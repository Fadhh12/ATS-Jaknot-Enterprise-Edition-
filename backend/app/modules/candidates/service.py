import re
from datetime import datetime

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.modules.candidates.models import Candidate
from app.modules.candidates.schemas import CandidateIntake


def _slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def build_folder_path(position_title: str, stage: str, applied_at: datetime) -> str:
    """FR-01.2: automated virtual foldering by position + recruitment stage."""
    return f"{_slugify(position_title)}/{_slugify(stage)}/{applied_at:%Y-%m}"


def find_prior_applications(db: Session, full_name: str, email: str, phone: str) -> list[Candidate]:
    """FR-01.3: prior applications from the same person, matched by exact
    name (case-insensitive) or by email/phone."""
    return (
        db.query(Candidate)
        .filter(
            or_(
                func.lower(Candidate.full_name) == full_name.strip().lower(),
                Candidate.email == email,
                Candidate.phone == phone,
            )
        )
        .all()
    )


def classify_duplicate(prior: list[Candidate], position_title: str) -> str | None:
    if not prior:
        return None
    same_position = any(p.position_title.strip().lower() == position_title.strip().lower() for p in prior)
    return "same_position" if same_position else "different_position"


def intake_candidate(db: Session, payload: CandidateIntake) -> Candidate:
    prior = find_prior_applications(db, payload.full_name, payload.email, payload.phone)
    duplicate_type = classify_duplicate(prior, payload.position_title)

    applied_at = datetime.utcnow()
    candidate = Candidate(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        cv_file_url=payload.cv_file_url,
        position_title=payload.position_title,
        stage=payload.stage,
        applicant_type=payload.applicant_type,
        duplicate_type=duplicate_type,
        folder_path=build_folder_path(payload.position_title, payload.stage, applied_at),
        applied_at=applied_at,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


def assign_folder(db: Session, candidate_id, folder_id) -> Candidate:
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).one()
    candidate.folder_id = folder_id
    db.commit()
    db.refresh(candidate)
    return candidate


def search_candidates(db: Session, query: str | None) -> list[Candidate]:
    q = db.query(Candidate)
    if query:
        like = f"%{query}%"
        q = q.filter(or_(Candidate.full_name.ilike(like), Candidate.email.ilike(like), Candidate.folder_path.ilike(like)))
    return q.order_by(Candidate.applied_at.desc()).all()
