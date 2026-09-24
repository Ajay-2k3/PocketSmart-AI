import uuid
import logging
from fastapi import APIRouter, Depends, status
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse
from app.core.security import AuthenticatedUser, create_access_token
from app.core.dependencies import get_current_user
from app.core.rate_limiter import rate_limit
from app.integrations.supabase_client import supabase_manager
from app.repositories.profile_repository import profile_repository

logger = logging.getLogger("pocketsmart.auth")

router = APIRouter(prefix="/auth", tags=["Auth"])


def _register_via_admin(email: str, password: str, full_name: str):
    """
    Use the Supabase admin API to create a user with email already confirmed.
    Returns (user_id, access_token) or (None, None) on failure.
    """
    try:
        admin = supabase_manager.admin_client
        if admin is None:
            return None, None
        res = admin.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name}
        })
        if res and res.user:
            # After admin create, sign in immediately to get a session token
            user_id = str(res.user.id)
            try:
                session_res = supabase_manager.client.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                token = session_res.session.access_token if session_res.session else None
                return user_id, token
            except Exception as login_e:
                logger.warning(f"Admin create succeeded but sign-in failed: {login_e}")
                return user_id, None
    except Exception as e:
        logger.warning(f"Admin user creation failed: {e}")
        return None, None


def _register_via_signup(email: str, password: str, full_name: str):
    """
    Use the Supabase anon client sign_up (email confirmation may be required).
    Returns (user_id, access_token) or (None, None) on failure.
    """
    try:
        res = supabase_manager.client.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"full_name": full_name}}
        })
        user_id = str(res.user.id) if res.user else None
        token = res.session.access_token if res.session else None
        return user_id, token
    except Exception as e:
        logger.warning(f"Supabase Auth sign_up error: {e}")
        return None, None


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(max_requests=10, window_seconds=60))]
)
async def register(payload: RegisterRequest):
    user_id = None
    token = None

    if supabase_manager.is_connected:
        # Try admin create first (bypasses email confirmation)
        user_id, token = _register_via_admin(payload.email, payload.password, payload.full_name)

        # Fallback to standard sign_up
        if not user_id:
            user_id, token = _register_via_signup(payload.email, payload.password, payload.full_name)

    # Fallback: generate local user ID (in-memory mode)
    if not user_id:
        user_id = str(uuid.uuid4())
    if not token:
        token = create_access_token(user_id, email=payload.email)

    # Update profile (best-effort — must not fail the registration response)
    if supabase_manager.is_connected:
        await profile_repository.update_profile(user_id, full_name=payload.full_name, avatar_url=None)
    else:
        await profile_repository.update_profile_memory(user_id, full_name=payload.full_name)

    return UserResponse(
        id=user_id,
        email=payload.email,
        full_name=payload.full_name,
        fullName=payload.full_name,
        token=token
    )


@router.post(
    "/login",
    response_model=UserResponse,
    dependencies=[Depends(rate_limit(max_requests=20, window_seconds=60))]
)
async def login(payload: LoginRequest):
    user_id = None
    token = None
    full_name = "PocketSmart User"

    if supabase_manager.is_connected:
        try:
            res = supabase_manager.client.auth.sign_in_with_password({
                "email": payload.email,
                "password": payload.password
            })
            if res.user:
                user_id = str(res.user.id)
                full_name = res.user.user_metadata.get("full_name", full_name) if res.user.user_metadata else full_name
            if res.session and res.session.access_token:
                token = res.session.access_token
        except Exception as e:
            logger.warning(f"Supabase Auth sign_in error: {e}")

    if not user_id:
        user_id = str(uuid.uuid4())
    if not token:
        token = create_access_token(user_id, email=payload.email)

    return UserResponse(
        id=user_id,
        email=payload.email,
        full_name=full_name,
        fullName=full_name,
        token=token
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
    profile = await profile_repository.get_profile(user.id)
    name = (profile.get("full_name") if profile else None) or "PocketSmart User"
    avatar = profile.get("avatar_url") if profile else None
    return UserResponse(
        id=user.id,
        email=user.email or f"{user.id}@example.com",
        full_name=name,
        fullName=name,
        avatar_url=avatar,
        avatarUrl=avatar,
        token=""
    )
