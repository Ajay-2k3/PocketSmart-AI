from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.schemas.plan import PlanSummaryResponse
from app.core.security import AuthenticatedUser
from app.core.dependencies import get_current_user
from app.services.plan_service import PlanService

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[PlanSummaryResponse])
async def get_history(
    planner_type: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user)
):
    return await PlanService.list_user_plans(user.id, planner_type)
