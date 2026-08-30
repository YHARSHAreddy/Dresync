"""
Outfit compatibility scorer.

Takes a list of clothing item dicts and optional context constraints,
scores each dimension, and produces a weighted total score plus
a list of human-readable reason strings for display in the UI.

Weights:
  Color compatibility   30 %
  Style compatibility   25 %
  Occasion match        20 %
  Season match          15 %
  Category completeness 10 %
"""

from typing import List, Dict, Optional, Tuple
from app.ai.compatibility.color_rules import score_outfit_colors
from app.ai.compatibility.style_rules import score_outfit_styles
from app.ai.compatibility.occasion_rules import score_occasion_match, score_season_match

WEIGHTS = {
    "color":    0.30,
    "style":    0.25,
    "occasion": 0.20,
    "season":   0.15,
    "category": 0.10,
}

SCORE_LABELS = [
    (0.90, "Exceptional"),
    (0.80, "Excellent"),
    (0.70, "Great"),
    (0.60, "Good"),
    (0.50, "Fair"),
    (0.00, "Needs Work"),
]

REQUIRED_CATEGORIES = {"top", "bottom"}
PREFERRED_CATEGORIES = {"shoes"}


def _category_score(item_categories: List[str]) -> Tuple[float, str]:
    cat_set = {c.lower() for c in item_categories}
    has_required = REQUIRED_CATEGORIES.issubset(cat_set)
    has_shoes = bool(cat_set & PREFERRED_CATEGORIES)

    if has_required and has_shoes:
        return 1.0, "Complete outfit with top, bottom and shoes"
    if has_required:
        return 0.80, "Core outfit complete — consider adding shoes"
    return 0.40, "Outfit is missing key pieces"


def get_score_label(score: float) -> str:
    for threshold, label in SCORE_LABELS:
        if score >= threshold:
            return label
    return "Needs Work"


def score_outfit(
    items: List[Dict],
    occasion: Optional[str] = None,
    season: Optional[str] = None,
) -> Dict:
    """
    Score an outfit combination.

    items: list of dicts, each with keys:
        primary_color, styles (list), seasons (list), occasions (list), category

    Returns a dict:
        {
            "score": float,          # 0.0 – 1.0
            "label": str,            # "Excellent", "Good", etc.
            "percentage": int,       # 0 – 100
            "reasons": [             # up to 5 human-readable strings
                {"type": "color"|"style"|"occasion"|"season"|"category",
                 "description": str}
            ],
            "breakdown": {           # per-dimension scores
                "color": float, "style": float, ...
            }
        }
    """
    if not items:
        return {"score": 0.0, "label": "No Items", "percentage": 0, "reasons": [], "breakdown": {}}

    # --- Dimension scores ---
    color_score, color_reasons = score_outfit_colors(items)
    style_score, style_reasons = score_outfit_styles(items)

    item_occasions = [item.get("occasions", []) for item in items]
    item_seasons   = [item.get("seasons", [])   for item in items]
    item_cats      = [item.get("category", "")  for item in items]

    occ_score,  occ_reason  = score_occasion_match(item_occasions, occasion or "")
    sea_score,  sea_reason  = score_season_match(item_seasons, season or "")
    cat_score,  cat_reason  = _category_score(item_cats)

    # --- Weighted total ---
    total = (
        color_score    * WEIGHTS["color"] +
        style_score    * WEIGHTS["style"] +
        occ_score      * WEIGHTS["occasion"] +
        sea_score      * WEIGHTS["season"] +
        cat_score      * WEIGHTS["category"]
    )
    total = round(min(total, 1.0), 3)

    # --- Build reasons list ---
    reasons = []
    for r in color_reasons:
        reasons.append({"type": "color", "description": r})
    for r in style_reasons:
        reasons.append({"type": "style", "description": r})
    if occ_score >= 0.75 and occasion:
        reasons.append({"type": "occasion", "description": occ_reason})
    if sea_score >= 0.75 and season:
        reasons.append({"type": "season", "description": sea_reason})
    reasons.append({"type": "category", "description": cat_reason})

    return {
        "score":      total,
        "label":      get_score_label(total),
        "percentage": int(round(total * 100)),
        "reasons":    reasons[:5],
        "breakdown": {
            "color":    round(color_score, 3),
            "style":    round(style_score, 3),
            "occasion": round(occ_score, 3),
            "season":   round(sea_score, 3),
            "category": round(cat_score, 3),
        },
    }
