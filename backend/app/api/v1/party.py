from fastapi import APIRouter, Depends
from app.schemas.party import PartyPlannerRequest
from app.schemas.plan import PlanDetailResponse
from app.core.security import AuthenticatedUser
from app.core.dependencies import get_current_user
from app.services.plan_service import PlanService

router = APIRouter(tags=["Planner - Party"])

@router.post("/planner/party", response_model=PlanDetailResponse)
@router.post("/planners/party", response_model=PlanDetailResponse)
async def generate_party_plan(payload: PartyPlannerRequest, user: AuthenticatedUser = Depends(get_current_user)):
    return await PlanService.create_and_execute_plan(
        user_id=user.id,
        planner_type="party",
        title=payload.title or "Party & Event Plan",
        total_budget=payload.total_budget,
        currency=payload.currency,
        flexibility=payload.budget_flexibility,
        input_data=payload.model_dump(),
        guest_count=payload.guest_count
    )
