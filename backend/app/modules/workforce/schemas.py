from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ManpowerPlanCreate(BaseModel):
    department_id: str = Field(..., title="Department ID")
    department_name: str = Field(..., title="Department Name")
    position_title: str = Field(..., title="Position Title")
    current_headcount: int = Field(0, title="Current Headcount")
    target_headcount: int = Field(..., title="Target Headcount")
    budget_headcount: int = Field(..., title="Budget Headcount")
    justification: Optional[str] = Field(None, title="Justification")
    period_year: int = Field(..., title="Period Year")
    period_month: int = Field(..., title="Period Month")


class ManpowerPlanUpdate(BaseModel):
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    position_title: Optional[str] = None
    current_headcount: Optional[int] = None
    target_headcount: Optional[int] = None
    budget_headcount: Optional[int] = None
    justification: Optional[str] = None
    period_year: Optional[int] = None
    period_month: Optional[int] = None
    status: Optional[str] = None


class ManpowerPlanOut(BaseModel):
    id: UUID
    department_id: str
    department_name: str
    position_title: str
    current_headcount: int
    target_headcount: int
    budget_headcount: int
    justification: Optional[str]
    period_year: int
    period_month: int
    status: str
    created_by: str
    created_at: datetime
    vacancy_count: int = Field(0, title="Vacancy Count (from approved requisitions)")

    model_config = {"from_attributes": True}


class DepartmentSummary(BaseModel):
    department_id: str
    department_name: str
    total_positions: int
    total_current: int
    total_target: int
    total_budget: int
