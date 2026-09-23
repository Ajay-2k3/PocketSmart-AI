import uuid
from typing import List, Optional
from app.integrations.product_providers.mock_provider import mock_product_provider
from app.schemas.recommendation import Recommendation

class RecommendationService:
    @staticmethod
    def get_recommendations_for_plan(
        planner_type: str,
        total_budget: float,
        priorities: Optional[List[str]] = None,
        guest_count: Optional[int] = None,
    ) -> List[Recommendation]:
        # Fetch from catalog provider
        recs = mock_product_provider.search(
            planner_type=planner_type,
            max_price=total_budget * 0.7,
            guest_count=guest_count
        )
        return recs

    @staticmethod
    def calculate_total_cost(recommendations: List[Recommendation]) -> float:
        return sum(r.price for r in recommendations)
