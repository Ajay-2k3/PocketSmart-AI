import logging
from typing import Optional, Any
from app.core.config import settings

logger = logging.getLogger("pocketsmart.gemini")

class GeminiManager:
    def __init__(self):
        self._model = None
        if settings.gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.gemini_api_key)
                self._model = genai.GenerativeModel(settings.gemini_model)
                logger.info(f"Gemini client initialized with model {settings.gemini_model}")
            except Exception as e:
                logger.warning(f"Could not configure Gemini: {e}")
                self._model = None

    @property
    def model(self) -> Optional[Any]:
        return self._model

    @property
    def is_available(self) -> bool:
        return self._model is not None

gemini_manager = GeminiManager()
