import logging
from typing import Optional, Any
from app.core.config import settings

logger = logging.getLogger("pocketsmart.supabase")

class SupabaseManager:
    _instance = None
    _client = None

    def __init__(self):
        if settings.supabase_url and settings.supabase_key and not settings.is_development:
            try:
                from supabase import create_client, Client
                self._client: Client = create_client(
                    settings.supabase_url,
                    settings.supabase_service_role_key or settings.supabase_key
                )
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Supabase client: {e}. Using mock mode.")
                self._client = None
        else:
            self._client = None

    @property
    def client(self) -> Optional[Any]:
        return self._client

    @property
    def is_connected(self) -> bool:
        return self._client is not None

supabase_manager = SupabaseManager()
