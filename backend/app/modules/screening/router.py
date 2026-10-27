import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.modules.screening import service
from app.modules.screening.schemas import (
    ScorecardTemplateCreate,
    ScorecardTemplateOut,
    ScreeningEvaluationCreate,
    ScreeningEvaluationOut,
    ScreeningSummary,
)

router = APIRouter(prefix="/api/v1/screening", tags=["screening"])

ANY_ROLE = ("recruiter_primary", "recruiter_admin", "hiring_manager", "recruiting_administrator")
SCORER_ROLE = ("recruiter_primary", "recruiter_admin", "hiring_manager", "recruiting_administrator")


@router.get("/templates", response_model=list[ScorecardTemplateOut])
def list_templates(db: Session = Depends(get_db), _user=Depends(require_role(*ANY_ROLE))):
    return service.list_templates(db)


@router.post("/templates", response_model=ScorecardTemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    payload: ScorecardTemplateCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("recruiter_admin", "recruiting_administrator")),
):
    return service.create_template(db, payload, uuid.UUID(user["sub"]))


@router.get("/evaluations", response_model=list[ScreeningEvaluationOut])
def list_evaluations(
    candidate_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    _user=Depends(require_role(*ANY_ROLE)),
):
    return service.list_evaluations(db, candidate_id)


@router.post("/evaluations", response_model=ScreeningEvaluationOut, status_code=status.HTTP_201_CREATED)
def submit_evaluation(
    payload: ScreeningEvaluationCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role(*SCORER_ROLE)),
):
    try:
        return service.submit_evaluation(db, payload, uuid.UUID(user["sub"]))
    except Exception as exc:  # noqa: BLE001 - surface a clean 400 for bad references
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/summary", response_model=ScreeningSummary)
def get_summary(db: Session = Depends(get_db), _user=Depends(require_role(*ANY_ROLE))):
    return service.summary(db)
