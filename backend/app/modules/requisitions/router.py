import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.modules.requisitions import service
from app.modules.requisitions.schemas import ApprovalDecision, RequisitionCreate, RequisitionOut

router = APIRouter(prefix="/api/v1/requisitions", tags=["requisitions"])


@router.get("", response_model=list[RequisitionOut])
def list_requisitions(db: Session = Depends(get_db), _user=Depends(require_role("admin", "recruiter", "hiring_manager", "management"))):
    return service.list_requisitions(db)


@router.post("", response_model=RequisitionOut, status_code=201)
def create_requisition(
    payload: RequisitionCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("hiring_manager", "admin")),
):
    return service.create_requisition(db, payload, created_by=uuid.UUID(user["sub"]))


@router.patch("/{requisition_id}/approve", response_model=RequisitionOut)
def approve_requisition(
    requisition_id: uuid.UUID,
    payload: ApprovalDecision,
    db: Session = Depends(get_db),
    user=Depends(require_role("hr_manager", "management", "admin")),
):
    return service.decide_approval(
        db,
        requisition_id=requisition_id,
        approver_id=uuid.UUID(user["sub"]),
        decision=payload.decision,
        reason=payload.reason,
    )
