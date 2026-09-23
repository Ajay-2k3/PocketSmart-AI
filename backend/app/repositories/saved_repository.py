import uuid
from typing import List, Dict, Any, Set
from app.integrations.supabase_client import supabase_manager

_MOCK_SAVED: Dict[str, Set[str]] = {}

class SavedRepository:
    async def save_recommendation(self, user_id: str, recommendation_id: str) -> None:
        if supabase_manager.is_connected:
            try:
                supabase_manager.client.table("saved_recommendations").insert({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "recommendation_id": recommendation_id
                }).execute()
                return
            except Exception:
                pass
        if user_id not in _MOCK_SAVED:
            _MOCK_SAVED[user_id] = set()
        _MOCK_SAVED[user_id].add(recommendation_id)

    async def unsave_recommendation(self, user_id: str, recommendation_id: str) -> None:
        if supabase_manager.is_connected:
            try:
                supabase_manager.client.table("saved_recommendations").delete().eq("user_id", user_id).eq("recommendation_id", recommendation_id).execute()
                return
            except Exception:
                pass
        if user_id in _MOCK_SAVED:
            _MOCK_SAVED[user_id].discard(recommendation_id)

    async def get_saved_ids(self, user_id: str) -> List[str]:
        if supabase_manager.is_connected:
            try:
                res = supabase_manager.client.table("saved_recommendations").select("recommendation_id").eq("user_id", user_id).execute()
                if res.data:
                    return [r["recommendation_id"] for r in res.data]
            except Exception:
                pass
        return list(_MOCK_SAVED.get(user_id, set()))

saved_repository = SavedRepository()
