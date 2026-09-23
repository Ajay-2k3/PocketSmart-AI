def build_home_prompt(data: dict) -> str:
    return f"""You are an expert interior designer and budget strategist for PocketSmart AI.
Create a structured interior decoration plan.

Input Parameters:
- Room Type: {data.get('room_type')}
- Room Size: {data.get('room_size_sqft', 'N/A')} sq ft
- Style: {data.get('style', 'Modern')}
- Total Budget: {data.get('currency', 'INR')} {data.get('total_budget')}
- Key Priorities: {', '.join(data.get('key_priorities', []))}
- Color Preferences: {', '.join(data.get('color_preferences', []))}

Return ONLY a valid JSON object matching this schema:
{{
  "summary": "Detailed strategic design overview",
  "recommendations": [
    {{
      "name": "Item Name",
      "category": "Category",
      "price": 1000.0,
      "why_recommended": "Reasoning",
      "match_score": 95.0,
      "budget_impact": "medium"
    }}
  ],
  "warnings": []
}}
"""
