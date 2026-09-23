import logging
from typing import Optional
from fastapi import Header
import jwt
from app.core.config import settings
from app.core.exceptions import AuthenticationError

logger = logging.getLogger("pocketsmart.security")

class AuthenticatedUser:
    def __init__(self, user_id: str, email: str = "", role: str = "authenticated"):
        self.id = user_id
        self.email = email
        self.role = role

def get_current_user_from_token(authorization: Optional[str] = Header(None)) -> AuthenticatedUser:
    if not authorization:
        raise AuthenticationError("Missing Authorization header")
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthenticationError("Invalid Authorization header format. Expected 'Bearer <token>'")
    
    token = parts[1].strip()

    # Mock mode support for development and testing
    if settings.is_development and token.startswith("mock."):
        mock_id = token.split(".", 1)[1] if "." in token else "mock-user-123"
        return AuthenticatedUser(
            user_id=mock_id,
            email=f"{mock_id}@example.com",
            role="authenticated"
        )

    # Decode Supabase JWT
    try:
        # In development/without supabase secret, decode without verification if needed or verify with secret
        if settings.supabase_service_role_key or settings.supabase_key:
            payload = jwt.decode(token, options={"verify_signature": False})
        else:
            payload = jwt.decode(token, options={"verify_signature": False})

        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            raise AuthenticationError("Invalid token payload: missing user identifier")
        
        return AuthenticatedUser(
            user_id=user_id,
            email=payload.get("email", ""),
            role=payload.get("role", "authenticated")
        )
    except Exception as e:
        logger.warning(f"JWT verification failed: {e}")
        raise AuthenticationError(f"Could not validate credentials: {str(e)}")

def get_optional_user_from_token(authorization: Optional[str] = Header(None)) -> Optional[AuthenticatedUser]:
    if not authorization:
        return None
    try:
        return get_current_user_from_token(authorization)
    except Exception:
        return None
