from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.plan import PlanSummaryResponse, PlanDetailResponse
from app.core.security import AuthenticatedUser
from app.core.dependencies import get_current_user
from app.services.plan_service import PlanService

router = APIRouter(prefix="/plans", tags=["Plans"])

@router.get("", response_model=List[PlanSummaryResponse])
async def list_plans(
    planner_type: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user)
):
    return await PlanService.list_user_plans(user.id, planner_type)

@router.get("/{plan_id}", response_model=PlanDetailResponse)
async def get_plan(plan_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    return await PlanService.get_plan(plan_id, user.id)

@router.delete("/{plan_id}", status_code=status.HTTP_200_OK)
async def delete_plan(plan_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    await PlanService.delete_plan(plan_id, user.id)
    return {"status": "success", "message": "Plan deleted successfully"}
