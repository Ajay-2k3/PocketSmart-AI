from typing import Dict, Any, Optional
from app.integrations.supabase_client import supabase_manager

_MOCK_PROFILES: Dict[str, Dict[str, Any]] = {}

class ProfileRepository:
    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        if supabase_manager.is_connected:
            try:
                res = supabase_manager.client.table("profiles").select("*").eq("id", user_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        return _MOCK_PROFILES.get(user_id)

    async def update_profile(self, user_id: str, full_name: Optional[str], avatar_url: Optional[str]) -> Dict[str, Any]:
        data = {"id": user_id}
        if full_name is not None:
            data["full_name"] = full_name
        if avatar_url is not None:
            data["avatar_url"] = avatar_url

        if supabase_manager.is_connected:
            try:
                res = supabase_manager.client.table("profiles").upsert(data).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        current = _MOCK_PROFILES.get(user_id, {"id": user_id, "email": f"{user_id}@example.com"})
        current.update(data)
        _MOCK_PROFILES[user_id] = current
        return current

profile_repository = ProfileRepository()
