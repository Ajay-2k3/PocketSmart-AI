import uuid
from typing import List, Optional
from app.integrations.product_providers.base import BaseProductProvider
from app.schemas.recommendation import Recommendation

MOCK_CATALOG = {
    "home": [
        {"name": "Modern 3-Seater Velvet Sofa", "category": "Furniture", "price": 28000, "source": "Urban Ladder", "match_score": 96.0, "budget_impact": "high"},
        {"name": "Warm Ambient Floor Lamp", "category": "Lighting", "price": 4500, "source": "IKEA", "match_score": 92.0, "budget_impact": "low"},
        {"name": "Solid Sheesham Wood Coffee Table", "category": "Furniture", "price": 8500, "source": "Pepperfry", "match_score": 90.0, "budget_impact": "medium"},
        {"name": "Handwoven Geometric Area Rug", "category": "Decor", "price": 6200, "source": "FabIndia", "match_score": 88.0, "budget_impact": "medium"},
        {"name": "Minimalist Ceramic Planter Set", "category": "Decor", "price": 1800, "source": "Amazon", "match_score": 85.0, "budget_impact": "low"}
    ],
    "party": [
        {"name": "Artisan Gourmet Appetizer Spread", "category": "Catering", "price": 14000, "source": "Local Caterer", "match_score": 95.0, "budget_impact": "high"},
        {"name": "Neon Ambient Uplighting & Glow Kit", "category": "Decor", "price": 5500, "source": "PartyBazaar", "match_score": 92.0, "budget_impact": "medium"},
        {"name": "Custom 2-Tier Celebration Cake", "category": "Catering", "price": 4000, "source": "The Daily Bake", "match_score": 94.0, "budget_impact": "medium"},
        {"name": "Bluetooth Pro Sound & DJ Speaker", "category": "Entertainment", "price": 6500, "source": "JBL Rental", "match_score": 89.0, "budget_impact": "medium"}
    ],
    "jewelry": [
        {"name": "22K Gold Antique Choker Necklace", "category": "Necklace", "price": 45000, "source": "Tanishq", "match_score": 98.0, "budget_impact": "high"},
        {"name": "Kundan & Pearl Drop Earrings", "category": "Earrings", "price": 12500, "source": "CaratLane", "match_score": 95.0, "budget_impact": "medium"},
        {"name": "Handcrafted Floral Jadau Maang Tikka", "category": "Accessories", "price": 9000, "source": "Senco Gold", "match_score": 91.0, "budget_impact": "low"},
        {"name": "Embossed Filigree Bangle Pair", "category": "Bangles", "price": 18000, "source": "Malabar Gold", "match_score": 90.0, "budget_impact": "medium"}
    ]
}

class MockProductProvider(BaseProductProvider):
    def search(
        self,
        query: str = "",
        category: Optional[str] = None,
        max_price: Optional[float] = None,
        planner_type: str = "home",
        guest_count: Optional[int] = None,
    ) -> List[Recommendation]:
        items = MOCK_CATALOG.get(planner_type, MOCK_CATALOG["home"])
        results = []
        for item in items:
            if max_price and item["price"] > max_price:
                continue
            rec = Recommendation(
                id=str(uuid.uuid4()),
                name=item["name"],
                category=item.get("category", "General"),
                source=item.get("source", "Catalog"),
                source_url="https://example.com/product",
                price=float(item["price"]),
                currency="INR",
                image_url="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                description=f"Curated recommendation matching your {planner_type} preferences.",
                why_recommended=f"Top match based on style aesthetic and budget constraints.",
                match_score=float(item.get("match_score", 90.0)),
                budget_impact=item.get("budget_impact", "medium"),
                metadata={}
            )
            results.append(rec)
        return results

mock_product_provider = MockProductProvider()
