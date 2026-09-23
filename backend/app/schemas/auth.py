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
    token: str = ""
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None

class ProfileUpdateRequest(BaseSchema):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
