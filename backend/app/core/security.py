import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import Header
import jwt
from app.core.config import settings
from app.core.exceptions import AuthenticationError

logger = logging.getLogger("pocketsmart.security")

class AuthenticatedUser:
    def __init__(self, user_id: str, email: str = "", role: str = "authenticated"):
        self.id = str(user_id)
        self.email = email
        self.role = role

def create_access_token(
    user_id: str,
    email: str = "",
    role: str = "authenticated",
    expires_delta: Optional[timedelta] = None
) -> str:
    """Generate a cryptographically signed HMAC-SHA256 JWT."""
    secret = settings.supabase_jwt_secret or settings.supabase_key or "pocketsmart-jwt-token-secret"
    now = datetime.now(timezone.utc)
    exp = now + (expires_delta or timedelta(days=7))
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp())
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def get_current_user_from_token(authorization: Optional[str] = Header(None)) -> AuthenticatedUser:
    """
    Cryptographically verify and decode JWT tokens.
    Enforces signature verification, expiration validation, algorithm restriction, and 'sub' claim validation.
    """
    if not authorization:
        raise AuthenticationError("Missing Authorization header")
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthenticationError("Invalid Authorization header format. Expected 'Bearer <token>'")
    
    token = parts[1].strip()
    if not token:
        raise AuthenticationError("Empty bearer token provided")

    secret = settings.supabase_jwt_secret or settings.supabase_key or "pocketsmart-jwt-token-secret"

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256", "HS384", "HS512"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "require": ["sub"]
            }
        )

        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            raise AuthenticationError("Token payload missing required subject ('sub') claim")

        return AuthenticatedUser(
            user_id=str(user_id),
            email=payload.get("email", ""),
            role=payload.get("role", "authenticated")
        )
    except jwt.ExpiredSignatureError:
        logger.warning("Token verification failed: Token has expired")
        raise AuthenticationError("Token has expired. Please sign in again.")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Token verification failed: {e}")
        raise AuthenticationError(f"Invalid authentication token: {str(e)}")
    except Exception as e:
        logger.warning(f"Unexpected token verification error: {e}")
        raise AuthenticationError("Could not validate credentials")

def get_optional_user_from_token(authorization: Optional[str] = Header(None)) -> Optional[AuthenticatedUser]:
    if not authorization:
        return None
    try:
        return get_current_user_from_token(authorization)
    except Exception:
        return None
