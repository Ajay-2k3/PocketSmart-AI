from typing import Optional, Dict, Any
from app.repositories.profile_repository import profile_repository
from app.schemas.auth import UserResponse

class ProfileService:
    @staticmethod
    async def get_profile(user_id: str, email: str = "") -> UserResponse:
        profile = await profile_repository.get_profile(user_id)
        if not profile:
            return UserResponse(
                id=user_id,
                email=email or f"{user_id}@example.com",
                full_name="User",
                avatar_url=None
            )
        return UserResponse(
            id=user_id,
            email=profile.get("email", email),
            full_name=profile.get("full_name", ""),
            avatar_url=profile.get("avatar_url")
        )

    @staticmethod
    async def update_profile(user_id: str, full_name: Optional[str] = None, avatar_url: Optional[str] = None) -> UserResponse:
        updated = await profile_repository.update_profile(user_id, full_name, avatar_url)
        return UserResponse(
            id=user_id,
            email=updated.get("email", ""),
            full_name=updated.get("full_name", full_name or ""),
            avatar_url=updated.get("avatar_url", avatar_url)
        )
