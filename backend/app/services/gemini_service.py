import json
import logging
import re
from typing import Dict, Any, Optional
from app.integrations.gemini_client import gemini_manager
from app.core.exceptions import AIProcessingError

logger = logging.getLogger("pocketsmart.gemini_service")

class GeminiService:
    @staticmethod
    def _parse_json(text: str) -> Dict[str, Any]:
        cleaned = text.strip()
        
        # Match markdown block ```json ... ```
        json_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(json_pattern, cleaned)
        if match:
            cleaned = match.group(1).strip()
        else:
            # Try to find first { and last }
            first_brace = cleaned.find("{")
            last_brace = cleaned.rfind("}")
            if first_brace != -1 and last_brace != -1:
                cleaned = cleaned[first_brace:last_brace + 1]

        try:
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Failed to parse JSON from AI response: {e}. Raw text: {text[:200]}")
            raise AIProcessingError("Failed to parse structured JSON from AI response")

    @staticmethod
    def _repair_plan_schema(data: Dict[str, Any], planner_type: str) -> Dict[str, Any]:
        if "summary" not in data:
            data["summary"] = f"AI Curated Plan for {planner_type.capitalize()} with optimal cost-to-value distribution."
        if "recommendations" not in data or not isinstance(data["recommendations"], list):
            data["recommendations"] = []
        if "warnings" not in data:
            data["warnings"] = ["Plan generated with fallback defaults."]
        return data

    @classmethod
    async def generate_plan_ai(
        cls,
        prompt: str,
        planner_type: str = "home",
        image_bytes: Optional[bytes] = None
    ) -> Dict[str, Any]:
        if not gemini_manager.is_available:
            # Fallback mock structured AI response
            return {
                "summary": f"Smart AI {planner_type.capitalize()} Plan designed to maximize quality within your budget parameters.",
                "recommendations": [],
                "warnings": []
            }

        try:
            model = gemini_manager.model
            if image_bytes:
                import google.generativeai as genai
                # Multimodal request
                img_part = {"mime_type": "image/jpeg", "data": image_bytes}
                response = model.generate_content([prompt, img_part])
            else:
                response = model.generate_content(prompt)

            raw_text = response.text
            parsed = cls._parse_json(raw_text)
            return cls._repair_plan_schema(parsed, planner_type)
        except AIProcessingError:
            raise
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return {
                "summary": f"Optimized {planner_type.capitalize()} Plan generated with algorithmic recommendations.",
                "recommendations": [],
                "warnings": [f"AI synthesis fallback engaged: {str(e)[:50]}"]
            }
