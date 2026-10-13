from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.modules.workforce.models import ManpowerPlan
from app.modules.workforce.schemas import ManpowerPlanCreate, ManpowerPlanUpdate


def get_all_manpower_plans(db: Session) -> list[ManpowerPlan]:
    return db.query(ManpowerPlan).order_by(ManpowerPlan.created_at.desc()).all()


def get_manpower_plan_by_id(db: Session, plan_id: UUID) -> ManpowerPlan | None:
    return db.query(ManpowerPlan).filter(ManpowerPlan.id == plan_id).first()


def create_manpower_plan(db: Session, payload: ManpowerPlanCreate, created_by: str) -> ManpowerPlan:
    plan = ManpowerPlan(
        department_id=payload.department_id,
        department_name=payload.department_name,
        position_title=payload.position_title,
        current_headcount=payload.current_headcount,
        target_headcount=payload.target_headcount,
        budget_headcount=payload.budget_headcount,
        justification=payload.justification,
        period_year=payload.period_year,
        period_month=payload.period_month,
        created_by=created_by,
        status="Draft",
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def update_manpower_plan(db: Session, plan_id: UUID, payload: ManpowerPlanUpdate) -> ManpowerPlan | None:
    plan = get_manpower_plan_by_id(db, plan_id)
    if not plan:
        return None

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)

    db.commit()
    db.refresh(plan)
    return plan


def delete_manpower_plan(db: Session, plan_id: UUID) -> bool:
    plan = get_manpower_plan_by_id(db, plan_id)
    if not plan:
        return False
    db.delete(plan)
    db.commit()
    return True


def get_department_summary(db: Session) -> list[dict]:
    results = db.query(
        ManpowerPlan.department_id,
        ManpowerPlan.department_name,
        func.count(ManpowerPlan.id).label("total_positions"),
        func.sum(ManpowerPlan.current_headcount).label("total_current"),
        func.sum(ManpowerPlan.target_headcount).label("total_target"),
        func.sum(ManpowerPlan.budget_headcount).label("total_budget"),
    ).group_by(
        ManpowerPlan.department_id,
        ManpowerPlan.department_name,
    ).all()

    return [
        {
            "department_id": r.department_id,
            "department_name": r.department_name,
            "total_positions": r.total_positions,
            "total_current": int(r.total_current or 0),
            "total_target": int(r.total_target or 0),
            "total_budget": int(r.total_budget or 0),
        }
        for r in results
    ]
