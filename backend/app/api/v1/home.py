from fastapi import APIRouter, Depends
from app.schemas.home import HomePlannerRequest
from app.schemas.plan import PlanDetailResponse
from app.core.security import AuthenticatedUser
from app.core.dependencies import get_current_user
from app.services.plan_service import PlanService

router = APIRouter(tags=["Planner - Home"])

@router.post("/planner/home", response_model=PlanDetailResponse)
@router.post("/planners/home", response_model=PlanDetailResponse)
@router.post("/planner/home/generate", response_model=PlanDetailResponse)
@router.post("/planners/home/generate", response_model=PlanDetailResponse)
async def generate_home_plan(payload: HomePlannerRequest, user: AuthenticatedUser = Depends(get_current_user)):
    return await PlanService.create_and_execute_plan(
        user_id=user.id,
        planner_type="home",
        title=payload.title or "Home Setup Plan",
        total_budget=payload.total_budget,
        currency=payload.currency,
        flexibility=payload.budget_flexibility,
        input_data=payload.model_dump()
    )
