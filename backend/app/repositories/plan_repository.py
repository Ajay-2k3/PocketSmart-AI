from typing import Dict, Any, List, Optional
from app.integrations.supabase_client import supabase_manager

# In-memory storage for test/mock mode
_MOCK_PLANS: Dict[str, Dict[str, Any]] = {}

class PlanRepository:
    async def save_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        if supabase_manager.is_connected:
            try:
                res = supabase_manager.client.table("plans").insert(plan_data).execute()
                return res.data[0] if res.data else plan_data
            except Exception:
                pass
        _MOCK_PLANS[plan_data["id"]] = plan_data
        return plan_data

    async def get_plan_by_id(self, plan_id: str) -> Optional[Dict[str, Any]]:
        if supabase_manager.is_connected:
            try:
                res = supabase_manager.client.table("plans").select("*").eq("id", plan_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        return _MOCK_PLANS.get(plan_id)

    async def list_plans_for_user(self, user_id: str, planner_type: Optional[str] = None) -> List[Dict[str, Any]]:
        if supabase_manager.is_connected:
            try:
                q = supabase_manager.client.table("plans").select("*").eq("user_id", user_id)
                if planner_type:
                    q = q.eq("planner_type", planner_type)
                res = q.order("created_at", desc=True).execute()
                return res.data or []
            except Exception:
                pass
        return [
            p for p in _MOCK_PLANS.values()
            if p.get("user_id") == user_id and (planner_type is None or p.get("planner_type") == planner_type)
        ]

    async def delete_plan(self, plan_id: str) -> bool:
        if supabase_manager.is_connected:
            try:
                supabase_manager.client.table("plans").delete().eq("id", plan_id).execute()
            except Exception:
                pass
        _MOCK_PLANS.pop(plan_id, None)
        return True

plan_repository = PlanRepository()
