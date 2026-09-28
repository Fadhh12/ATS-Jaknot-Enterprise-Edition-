import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.modules.candidates import service
from app.modules.candidates.schemas import CandidateFolderAssign, CandidateIntake, CandidateOut

router = APIRouter(prefix="/api/v1/candidates", tags=["candidates"])

ANY_ROLE = ("recruiter_primary", "recruiter_admin", "hiring_manager", "recruiting_administrator")


@router.post("/intake", response_model=CandidateOut, status_code=201)
def intake_candidate(
    payload: CandidateIntake,
    db: Session = Depends(get_db),
    _user=Depends(require_role("recruiter_primary", "recruiter_admin", "recruiting_administrator")),
):
    return service.intake_candidate(db, payload)


@router.get("/search", response_model=list[CandidateOut])
def search_candidates(
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _user=Depends(require_role(*ANY_ROLE)),
):
    return service.search_candidates(db, q)


@router.patch("/{candidate_id}/folder", response_model=CandidateOut)
def assign_folder(
    candidate_id: uuid.UUID,
    payload: CandidateFolderAssign,
    db: Session = Depends(get_db),
    _user=Depends(require_role(*ANY_ROLE)),
):
    return service.assign_folder(db, candidate_id, payload.folder_id)
