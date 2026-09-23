from fastapi import APIRouter
from app.core.config import settings
from app.integrations.supabase_client import supabase_manager
from app.integrations.gemini_client import gemini_manager

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "environment": settings.environment,
        "supabase_connected": supabase_manager.is_connected,
        "gemini_connected": gemini_manager.is_available
    }
