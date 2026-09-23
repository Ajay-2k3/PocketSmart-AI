from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.common import BaseSchema

class RegisterRequest(BaseSchema):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password at least 6 characters")
    full_name: str = Field("", description="User full name")

class LoginRequest(BaseSchema):
    email: EmailStr
    password: str = Field(..., min_length=1)

class UserResponse(BaseSchema):
    id: str
    email: str
    full_name: str = ""
    fullName: Optional[str] = None
    token: str = ""
    avatar_url: Optional[str] = None
    avatarUrl: Optional[str] = None
    created_at: Optional[str] = None
    createdAt: Optional[str] = None

    def __init__(self, **data):
        super().__init__(**data)
        name = data.get("full_name") or data.get("fullName") or ""
        self.full_name = name
        self.fullName = name
        avatar = data.get("avatar_url") or data.get("avatarUrl")
        self.avatar_url = avatar
        self.avatarUrl = avatar
        created = data.get("created_at") or data.get("createdAt")
        self.created_at = created
        self.createdAt = created

class ProfileUpdateRequest(BaseSchema):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
