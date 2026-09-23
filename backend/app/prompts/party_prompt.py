def build_party_prompt(data: dict) -> str:
    return f"""You are an elite event planner and financial coordinator for PocketSmart AI.
Create a structured event plan.

Input Parameters:
- Party Type: {data.get('party_type')}
- Guest Count: {data.get('guest_count')}
- Theme: {data.get('theme', 'Celebration')}
- Total Budget: {data.get('currency', 'INR')} {data.get('total_budget')}
- Catering Preference: {data.get('catering_preference', 'Standard')}

Return ONLY a valid JSON object matching this schema:
{{
  "summary": "Detailed event coordination overview",
  "recommendations": [
    {{
      "name": "Service / Item Name",
      "category": "Catering / Decor / Entertainment",
      "price": 5000.0,
      "why_recommended": "Reasoning",
      "match_score": 90.0,
      "budget_impact": "medium"
    }}
  ],
  "warnings": []
}}
"""
