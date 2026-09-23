from typing import List, Dict, Any
from app.integrations.supabase_client import supabase_manager
from app.schemas.recommendation import Recommendation

_MOCK_RECS: Dict[str, List[Recommendation]] = {}

class RecommendationRepository:
    async def save_recommendations(self, plan_id: str, recs: List[Recommendation]) -> None:
        if supabase_manager.is_connected:
            try:
                records = [r.model_dump(exclude={"is_saved"}) for r in recs]
                supabase_manager.client.table("recommendations").insert(records).execute()
                return
            except Exception:
                pass
        _MOCK_RECS[plan_id] = recs

    async def get_by_plan_id(self, plan_id: str) -> List[Recommendation]:
        if supabase_manager.is_connected:
            try:
                res = supabase_manager.client.table("recommendations").select("*").eq("plan_id", plan_id).execute()
                if res.data:
                    return [Recommendation(**r) for r in res.data]
            except Exception:
                pass
        return _MOCK_RECS.get(plan_id, [])

recommendation_repository = RecommendationRepository()
