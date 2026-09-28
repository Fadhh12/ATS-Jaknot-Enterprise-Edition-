import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.auth.models import User
from app.modules.requisitions.models import JobRequisition, RequisitionApproval
from app.modules.requisitions.schemas import RequisitionCreate

# BR-03: every status change records timestamp, actor, and reason when rejected.
# Single-step approval: the Hiring Manager auto-assigned to the requisition's
# supervisory organization decides; Recruiting Administrator can override.
APPROVAL_CHAIN_ROLES = ["hiring_manager"]


def _attach_names(db: Session, reqs: list[JobRequisition]) -> list[JobRequisition]:
    if not reqs:
        return reqs

    creator_ids = {r.created_by for r in reqs}
    creators = {u.id: u.name for u in db.query(User).filter(User.id.in_(creator_ids)).all()}

    req_ids = [r.id for r in reqs]
    decided = (
        db.query(RequisitionApproval)
        .filter(RequisitionApproval.requisition_id.in_(req_ids), RequisitionApproval.decision != "Pending")
        .order_by(RequisitionApproval.decided_at.desc())
        .all()
    )
    latest_approver_by_req: dict[uuid.UUID, uuid.UUID] = {}
    for a in decided:
        latest_approver_by_req.setdefault(a.requisition_id, a.approver_id)

    approver_ids = set(latest_approver_by_req.values())
    approvers = {u.id: u.name for u in db.query(User).filter(User.id.in_(approver_ids)).all()} if approver_ids else {}

    for r in reqs:
        r.created_by_name = creators.get(r.created_by, "—")
        approver_id = latest_approver_by_req.get(r.id)
        r.approved_by_name = approvers.get(approver_id) if approver_id else None
    return reqs


def list_requisitions(db: Session) -> list[JobRequisition]:
    reqs = db.query(JobRequisition).order_by(JobRequisition.created_at.desc()).all()
    return _attach_names(db, reqs)


def create_requisition(db: Session, payload: RequisitionCreate, created_by: uuid.UUID) -> JobRequisition:
    requisition = JobRequisition(**payload.model_dump(), created_by=created_by, status="Pending Approval")
    db.add(requisition)
    db.flush()

    for step, _role in enumerate(APPROVAL_CHAIN_ROLES, start=1):
        db.add(RequisitionApproval(requisition_id=requisition.id, approver_id=created_by, sequence=step))

    db.commit()
    db.refresh(requisition)
    return _attach_names(db, [requisition])[0]


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
        return _attach_names(db, [requisition])[0]

    step.approver_id = approver_id
    step.decision = decision
    step.reason = reason
    step.decided_at = datetime.utcnow()
    db.flush()  # session has autoflush off — the remaining-count query below must see this row's new decision

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
    return _attach_names(db, [requisition])[0]
