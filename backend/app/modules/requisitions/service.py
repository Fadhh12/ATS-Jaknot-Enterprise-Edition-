import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.requisitions.models import JobRequisition, RequisitionApproval
from app.modules.requisitions.schemas import RequisitionCreate

# BR-03: every status change records timestamp, actor, and reason when rejected.
APPROVAL_CHAIN_ROLES = ["hiring_manager", "hr_manager", "management"]


def list_requisitions(db: Session) -> list[JobRequisition]:
    return db.query(JobRequisition).order_by(JobRequisition.created_at.desc()).all()


def create_requisition(db: Session, payload: RequisitionCreate, created_by: uuid.UUID) -> JobRequisition:
    requisition = JobRequisition(**payload.model_dump(), created_by=created_by, status="Pending Approval")
    db.add(requisition)
    db.flush()

    for step, _role in enumerate(APPROVAL_CHAIN_ROLES, start=1):
        db.add(RequisitionApproval(requisition_id=requisition.id, approver_id=created_by, sequence=step))

    db.commit()
    db.refresh(requisition)
    return requisition


def decide_approval(
    db: Session,
    requisition_id: uuid.UUID,
    approver_id: uuid.UUID,
    decision: str,
    reason: str | None,
) -> JobRequisition:
    requisition = db.query(JobRequisition).filter(JobRequisition.id == requisition_id).one()

    step = (
        db.query(RequisitionApproval)
        .filter(RequisitionApproval.requisition_id == requisition_id, RequisitionApproval.decision == "Pending")
        .order_by(RequisitionApproval.sequence)
        .first()
    )
    if step is None:
        return requisition

    step.approver_id = approver_id
    step.decision = decision
    step.reason = reason
    step.decided_at = datetime.utcnow()

    if decision == "Rejected":
        requisition.status = "Rejected"
    else:
        remaining = (
            db.query(RequisitionApproval)
            .filter(RequisitionApproval.requisition_id == requisition_id, RequisitionApproval.decision == "Pending")
            .count()
        )
        requisition.status = "Approved" if remaining == 0 else "Pending Approval"

    db.commit()
    db.refresh(requisition)
    return requisition
