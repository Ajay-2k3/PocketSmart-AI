import logging
from typing import Dict, Any, Optional
from app.integrations.supabase_client import supabase_manager

logger = logging.getLogger("pocketsmart.profile_repository")

_MEMORY_PROFILES: Dict[str, Dict[str, Any]] = {}

class ProfileRepository:
    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        if supabase_manager.is_connected:
            try:
                res = supabase_manager.client.table("profiles").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Supabase PostgreSQL get_profile error: {e}")
        return _MEMORY_PROFILES.get(user_id)

    async def update_profile(self, user_id: str, full_name: Optional[str], avatar_url: Optional[str]) -> Dict[str, Any]:
        data = {"id": user_id}
        if full_name is not None:
            data["full_name"] = full_name
        if avatar_url is not None:
            data["avatar_url"] = avatar_url

        current = _MEMORY_PROFILES.get(user_id, {"id": user_id, "email": f"{user_id}@example.com"})
        current.update(data)
        _MEMORY_PROFILES[user_id] = current

        if supabase_manager.is_connected:
            try:
                res = supabase_manager.client.table("profiles").upsert(data).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Supabase PostgreSQL update_profile error: {e}")
        return current

profile_repository = ProfileRepository()
