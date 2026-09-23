import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.services.budget_service import BudgetService
from app.services.recommendation_service import RecommendationService
from app.repositories.plan_repository import plan_repository
from app.repositories.recommendation_repository import recommendation_repository
from app.schemas.plan import PlanDetailResponse, BudgetSummary, PlanSummaryResponse
from app.core.exceptions import NotFoundError, AuthorizationError

class PlanService:
    @staticmethod
    async def create_and_execute_plan(
        user_id: str,
        planner_type: str,
        title: str,
        total_budget: float,
        currency: str,
        flexibility: str,
        input_data: Dict[str, Any],
        ai_summary: str = "",
        guest_count: Optional[int] = None
    ) -> PlanDetailResponse:
        plan_id = str(uuid.uuid4())

        # 1. Budget allocation
        allocations = BudgetService.allocate(total_budget, planner_type)

        # 2. Curate recommendations
        recommendations = RecommendationService.get_recommendations_for_plan(
            planner_type=planner_type,
            total_budget=total_budget,
            guest_count=guest_count
        )
        for r in recommendations:
            r.plan_id = plan_id

        # 3. Calculate financial totals
        estimated_cost = RecommendationService.calculate_total_cost(recommendations)
        if estimated_cost == 0:
            estimated_cost = total_budget * 0.85

        budget_calc = BudgetService.calculate(total_budget, estimated_cost, currency)
        warnings = BudgetService.generate_warnings(total_budget, estimated_cost, flexibility)

        if not ai_summary:
            ai_summary = f"Curated {planner_type.capitalize()} plan allocating {budget_calc.percentage_used}% of your {currency} {total_budget:,.2f} budget."

        from datetime import timezone
        now_iso = datetime.now(timezone.utc).isoformat()
        plan_record = {
            "id": plan_id,
            "user_id": user_id,
            "planner_type": planner_type,
            "title": title or f"My {planner_type.capitalize()} Plan",
            "budget": total_budget,
            "estimated_cost": estimated_cost,
            "remaining_budget": budget_calc.remaining_budget,
            "currency": currency,
            "ai_summary": ai_summary,
            "warnings": warnings,
            "allocations": [a.model_dump() for a in allocations],
            "input_data": input_data,
            "status": "completed",
            "created_at": now_iso
        }
        await plan_repository.save_plan(plan_record)
        await recommendation_repository.save_recommendations(plan_id, recommendations)

        budget_summary = BudgetSummary(
            budget=total_budget,
            total_budget=total_budget,
            totalBudget=total_budget,
            estimated_cost=estimated_cost,
            estimatedCost=estimated_cost,
            remaining_budget=budget_calc.remaining_budget,
            remaining=budget_calc.remaining_budget,
            savings=max(budget_calc.remaining_budget, 0.0),
            percentage_used=budget_calc.percentage_used,
            utilization=round(budget_calc.percentage_used),
            currency=currency,
            is_over_budget=budget_calc.is_over_budget
        )

        return PlanDetailResponse(
            id=plan_id,
            plan_id=plan_id,
            user_id=user_id,
            planner_type=planner_type,
            title=plan_record["title"],
            budget=budget_summary,
            budget_summary=budget_summary,
            allocations=allocations,
            ai_summary=ai_summary,
            aiSummary=ai_summary,
            warnings=warnings,
            recommendations=recommendations,
            input_data=input_data,
            status="completed",
            created_at=plan_record["created_at"],
            createdAt=plan_record["created_at"]
        )

    @staticmethod
    async def get_plan(plan_id: str, user_id: str) -> PlanDetailResponse:
        plan = await plan_repository.get_plan_by_id(plan_id)
        if not plan:
            raise NotFoundError("Plan not found")
        if plan["user_id"] != user_id:
            raise AuthorizationError("Access denied to this plan")

        recs = await recommendation_repository.get_by_plan_id(plan_id)
        total_budget = float(plan["budget"])
        estimated_cost = float(plan["estimated_cost"])
        budget_calc = BudgetService.calculate(total_budget, estimated_cost, plan.get("currency", "INR"))

        budget_summary = BudgetSummary(
            budget=total_budget,
            total_budget=total_budget,
            totalBudget=total_budget,
            estimated_cost=estimated_cost,
            estimatedCost=estimated_cost,
            remaining_budget=budget_calc.remaining_budget,
            remaining=budget_calc.remaining_budget,
            savings=max(budget_calc.remaining_budget, 0.0),
            percentage_used=budget_calc.percentage_used,
            utilization=round(budget_calc.percentage_used),
            currency=plan.get("currency", "INR"),
            is_over_budget=budget_calc.is_over_budget
        )

        return PlanDetailResponse(
            id=plan["id"],
            plan_id=plan["id"],
            user_id=plan["user_id"],
            planner_type=plan["planner_type"],
            title=plan["title"],
            budget=budget_summary,
            budget_summary=budget_summary,
            allocations=plan.get("allocations", []),
            ai_summary=plan.get("ai_summary", ""),
            aiSummary=plan.get("ai_summary", ""),
            warnings=plan.get("warnings", []),
            recommendations=recs,
            input_data=plan.get("input_data", {}),
            status=plan.get("status", "completed"),
            created_at=plan.get("created_at"),
            createdAt=plan.get("created_at")
        )

    @staticmethod
    async def list_user_plans(user_id: str, planner_type: Optional[str] = None) -> List[PlanSummaryResponse]:
        plans = await plan_repository.list_plans_for_user(user_id, planner_type)
        results = []
        for p in plans:
            results.append(PlanSummaryResponse(
                id=p["id"],
                user_id=p["user_id"],
                planner_type=p["planner_type"],
                title=p["title"],
                budget=float(p["budget"]),
                estimated_cost=float(p["estimated_cost"]),
                remaining_budget=float(p["remaining_budget"]),
                currency=p.get("currency", "INR"),
                status=p.get("status", "completed"),
                created_at=p.get("created_at", "")
            ))
        return results

    @staticmethod
    async def delete_plan(plan_id: str, user_id: str) -> bool:
        plan = await plan_repository.get_plan_by_id(plan_id)
        if not plan:
            raise NotFoundError("Plan not found")
        if plan["user_id"] != user_id:
            raise AuthorizationError("Access denied to this plan")
        return await plan_repository.delete_plan(plan_id)
