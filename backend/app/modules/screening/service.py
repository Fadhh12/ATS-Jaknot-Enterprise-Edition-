import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.auth.models import User
from app.modules.candidates.models import Candidate
from app.modules.candidates.service import build_folder_path
from app.modules.screening.models import ScorecardTemplate, ScreeningEvaluation
from app.modules.screening.schemas import ScorecardTemplateCreate, ScreeningEvaluationCreate

# Stage the candidate moves to once a scorecard recommends them.
STAGE_ON_ADVANCE = "Shortlist"
STAGE_ON_REJECT = "Rejected"
STAGE_ON_HOLD = "Screening"


def _weighted_score(criteria: list[dict], scores: dict[str, int]) -> float:
    """Weighted percentage 0-100. Criterion scores run 1-5."""
    if not criteria:
        return 0.0
    total_weight = sum(int(c.get("weight", 0)) for c in criteria)
    if total_weight <= 0:
        return 0.0
    earned = 0.0
    for c in criteria:
        raw = scores.get(c.get("name", ""))
        if raw is None:
            continue
        earned += min(5, max(1, int(raw))) * int(c.get("weight", 0))
    return round((earned / total_weight) / 5 * 100, 1)


def _recommendation(score: float, template: ScorecardTemplate) -> str:
    if score >= template.pass_threshold:
        return "Advance"
    if score >= template.hold_threshold:
        return "Hold"
    return "Reject"


def _attach_names(db: Session, evaluations: list[ScreeningEvaluation]) -> list[ScreeningEvaluation]:
    if not evaluations:
        return evaluations

    candidate_ids = {e.candidate_id for e in evaluations}
    candidates = {
        c.id: c
        for c in db.query(Candidate).filter(Candidate.id.in_(candidate_ids)).all()
    }

    template_ids = {e.template_id for e in evaluations}
    templates = {
        t.id: t
        for t in db.query(ScorecardTemplate).filter(ScorecardTemplate.id.in_(template_ids)).all()
    }

    reviewer_ids = {e.reviewer_id for e in evaluations}
    reviewers = {u.id: u.name for u in db.query(User).filter(User.id.in_(reviewer_ids)).all()}

    for e in evaluations:
        candidate = candidates.get(e.candidate_id)
        template = templates.get(e.template_id)
        e.candidate_name = candidate.full_name if candidate else "—"
        e.candidate_position = candidate.position_title if candidate else "—"
        e.candidate_stage = candidate.stage if candidate else "—"
        e.template_name = template.name if template else "—"
        e.reviewer_name = reviewers.get(e.reviewer_id, "—")
    return evaluations


def list_templates(db: Session) -> list[ScorecardTemplate]:
    templates = (
        db.query(ScorecardTemplate)
        .order_by(ScorecardTemplate.is_default.desc(), ScorecardTemplate.created_at.desc())
        .all()
    )
    reviewer_ids = {t.created_by for t in templates}
    names = {u.id: u.name for u in db.query(User).filter(User.id.in_(reviewer_ids)).all()} if reviewer_ids else {}
    for t in templates:
        t.created_by_name = names.get(t.created_by, "—")
    return templates


def create_template(db: Session, payload: ScorecardTemplateCreate, created_by: uuid.UUID) -> ScorecardTemplate:
    template = ScorecardTemplate(
        name=payload.name,
        position_title=payload.position_title,
        criteria=[c.model_dump() for c in payload.criteria],
        pass_threshold=payload.pass_threshold,
        hold_threshold=payload.hold_threshold,
        is_default=payload.is_default,
        created_by=created_by,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    creator = db.query(User).filter(User.id == created_by).first()
    template.created_by_name = creator.name if creator else "—"
    return template


def list_evaluations(db: Session, candidate_id: uuid.UUID | None = None) -> list[ScreeningEvaluation]:
    q = db.query(ScreeningEvaluation)
    if candidate_id:
        q = q.filter(ScreeningEvaluation.candidate_id == candidate_id)
    evaluations = q.order_by(ScreeningEvaluation.submitted_at.desc()).all()
    return _attach_names(db, evaluations)


def submit_evaluation(
    db: Session, payload: ScreeningEvaluationCreate, reviewer_id: uuid.UUID
) -> ScreeningEvaluation:
    template = db.query(ScorecardTemplate).filter(ScorecardTemplate.id == payload.template_id).one()
    candidate = db.query(Candidate).filter(Candidate.id == payload.candidate_id).one()

    score = _weighted_score(template.criteria, payload.scores)
    recommendation = _recommendation(score, template)

    evaluation = ScreeningEvaluation(
        candidate_id=candidate.id,
        template_id=template.id,
        reviewer_id=reviewer_id,
        scores=payload.scores,
        notes=payload.notes,
        overall_notes=payload.overall_notes,
        weighted_score=score,
        recommendation=recommendation,
        status="Submitted",
        submitted_at=datetime.utcnow(),
    )
    db.add(evaluation)

    if recommendation == "Advance":
        candidate.stage = STAGE_ON_ADVANCE
    elif recommendation == "Reject":
        candidate.stage = STAGE_ON_REJECT
    else:
        candidate.stage = STAGE_ON_HOLD
    candidate.folder_path = build_folder_path(
        candidate.position_title, candidate.stage, candidate.applied_at
    )

    db.commit()
    db.refresh(evaluation)
    return _attach_names(db, [evaluation])[0]


def summary(db: Session) -> dict:
    candidates = db.query(Candidate).all()
    evaluations = db.query(ScreeningEvaluation).all()

    scored_candidate_ids = {e.candidate_id for e in evaluations}
    total_in_screening = sum(1 for c in candidates if c.stage == "Screening")
    total_scored = len(scored_candidate_ids)
    advance = sum(1 for e in evaluations if e.recommendation == "Advance")
    hold = sum(1 for e in evaluations if e.recommendation == "Hold")
    reject = sum(1 for e in evaluations if e.recommendation == "Reject")
    average = round(sum(e.weighted_score for e in evaluations) / len(evaluations), 1) if evaluations else 0.0

    return {
        "total_in_screening": total_in_screening,
        "total_scored": total_scored,
        "advance": advance,
        "hold": hold,
        "reject": reject,
        "average_score": average,
    }
