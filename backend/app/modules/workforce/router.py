from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.modules.workforce import service
from app.modules.workforce.schemas import (
    DepartmentSummary,
    ManpowerPlanCreate,
    ManpowerPlanOut,
    ManpowerPlanUpdate,
)

router = APIRouter(prefix="/api/v1/workforce", tags=["workforce"])


@router.get("", response_model=list[ManpowerPlanOut])
def list_manpower_plans(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    plans = service.get_all_manpower_plans(db)
    return plans


@router.get("/departments", response_model=list[DepartmentSummary])
def get_department_summary(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return service.get_department_summary(db)


@router.get("/{plan_id}", response_model=ManpowerPlanOut)
def get_manpower_plan(plan_id: UUID, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    plan = service.get_manpower_plan_by_id(db, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manpower plan not found")
    return plan


@router.post("", response_model=ManpowerPlanOut, status_code=status.HTTP_201_CREATED)
def create_manpower_plan(
    payload: ManpowerPlanCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return service.create_manpower_plan(db, payload, user["sub"])


@router.patch("/{plan_id}", response_model=ManpowerPlanOut)
def update_manpower_plan(
    plan_id: UUID,
    payload: ManpowerPlanUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    plan = service.update_manpower_plan(db, plan_id, payload)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manpower plan not found")
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_manpower_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    success = service.delete_manpower_plan(db, plan_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manpower plan not found")
