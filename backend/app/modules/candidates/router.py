from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.modules.candidates import service
from app.modules.candidates.schemas import CandidateIntake, CandidateOut

router = APIRouter(prefix="/api/v1/candidates", tags=["candidates"])


@router.post("/intake", response_model=CandidateOut, status_code=201)
def intake_candidate(
    payload: CandidateIntake,
    db: Session = Depends(get_db),
    _user=Depends(require_role("recruiter", "admin")),
):
    return service.intake_candidate(db, payload)


@router.get("/search", response_model=list[CandidateOut])
def search_candidates(
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _user=Depends(require_role("recruiter", "admin", "hiring_manager", "management")),
):
    return service.search_candidates(db, q)
