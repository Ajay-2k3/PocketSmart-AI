def build_jewelry_prompt(data: dict) -> str:
    return f"""You are a luxury jewelry stylist and gemologist for PocketSmart AI.
Create a structured jewelry styling plan.

Input Parameters:
- Occasion: {data.get('occasion')}
- Jewelry Type: {data.get('jewelry_type')}
- Metal Preference: {data.get('metal_preference', 'Gold')}
- Style: {data.get('style', 'Contemporary')}
- Total Budget: {data.get('currency', 'INR')} {data.get('total_budget')}
- Outfit Description: {data.get('outfit_description', 'N/A')}

Return ONLY a valid JSON object matching this schema:
{{
  "summary": "Detailed jewelry styling rationale",
  "recommendations": [
    {{
      "name": "Jewelry Piece Name",
      "category": "Necklace / Earrings / Ring",
      "price": 15000.0,
      "why_recommended": "Design & aesthetic alignment",
      "match_score": 95.0,
      "budget_impact": "high"
    }}
  ],
  "warnings": []
}}
"""
