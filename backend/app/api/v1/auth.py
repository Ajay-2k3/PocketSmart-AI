import uuid
from fastapi import APIRouter, Depends, status
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse
from app.core.security import AuthenticatedUser, create_access_token
from app.core.dependencies import get_current_user
from app.repositories.profile_repository import profile_repository

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    user_id = str(uuid.uuid4())
    token = create_access_token(user_id, email=payload.email)
    await profile_repository.update_profile(user_id, full_name=payload.full_name, avatar_url=None)
    return UserResponse(
        id=user_id,
        email=payload.email,
        full_name=payload.full_name,
        token=token
    )

@router.post("/login", response_model=UserResponse)
async def login(payload: LoginRequest):
    user_id = str(uuid.uuid4())
    token = create_access_token(user_id, email=payload.email)
    return UserResponse(
        id=user_id,
        email=payload.email,
        full_name="PocketSmart User",
        token=token
    )

@router.get("/me", response_model=UserResponse)
async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
    profile = await profile_repository.get_profile(user.id)
    return UserResponse(
        id=user.id,
        email=user.email or f"{user.id}@example.com",
        full_name=profile.get("full_name", "") if profile else "",
        token=""
    )
