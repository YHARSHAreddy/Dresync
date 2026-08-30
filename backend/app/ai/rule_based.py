"""
Rule-based outfit recommendation engine.

Generates outfit combinations from a user's wardrobe by:
1. Filtering items by requested occasion / season
2. Building (top, bottom, shoes) candidate triples
3. Scoring each with the scorer
4. Returning the top-N sorted by score

The engine is designed to be replaceable: it follows the same interface
a future ML recommender would use.
"""

from __future__ import annotations

import random
from typing import List, Optional, Dict, Set
from app.ai.scorer import score_outfit


def _item_to_dict(item) -> Dict:
    """Convert a ClothingItem ORM object to a plain dict for the scorer."""
    return {
        "id":            str(item.id),
        "category":      item.category.value if hasattr(item.category, "value") else item.category,
        "primary_color": item.primary_color or "",
        "styles":        item.styles or [],
        "seasons":       item.seasons or [],
        "occasions":     item.occasions or [],
        "name":          item.name,
    }


def _passes_filters(item, occasion: Optional[str], season: Optional[str]) -> bool:
    """Check if an item is eligible given the request filters."""
    if occasion and item.occasions:
        occ_set = {o.lower() for o in item.occasions}
        if occasion.lower() not in occ_set and "all" not in occ_set:
            # Relaxed match: check substring
            if not any(occasion.lower() in o for o in occ_set):
                return False
    if season and item.seasons:
        sea_set = {s.lower() for s in item.seasons}
        if season.lower() not in sea_set and "all" not in sea_set:
            return False
    return True


def recommend_outfits(
    clothing_items: List,
    n: int = 5,
    occasion: Optional[str] = None,
    season: Optional[str] = None,
    exclude_outfit_item_sets: Optional[List[Set[str]]] = None,
) -> List[Dict]:
    """
    Generate up to n outfit recommendations.

    clothing_items: list of ClothingItem ORM objects (all active items for the user)
    n: maximum number of outfits to return
    occasion: optional filter
    season: optional filter
    exclude_outfit_item_sets: optional list of frozensets of item IDs to avoid
        (used by weekly planner to prevent same exact outfit repeating)

    Returns a list of dicts:
        {
            "top": ClothingItem | None,
            "bottom": ClothingItem | None,
            "outerwear": ClothingItem | None,
            "shoes": ClothingItem | None,
            "accessories": [ClothingItem],
            "score": float,
            "label": str,
            "percentage": int,
            "reasons": [...],
            "breakdown": {...},
        }
    """
    exclude_outfit_item_sets = exclude_outfit_item_sets or []

    # Split by category
    tops       = [i for i in clothing_items if i.category.value == "top"       and i.usage_status.value == "active"]
    bottoms    = [i for i in clothing_items if i.category.value == "bottom"    and i.usage_status.value == "active"]
    shoes_list = [i for i in clothing_items if i.category.value == "shoes"     and i.usage_status.value == "active"]
    outerwear  = [i for i in clothing_items if i.category.value == "outerwear" and i.usage_status.value == "active"]
    accessories = [i for i in clothing_items if i.category.value == "accessory" and i.usage_status.value == "active"]

    # Apply filters (relaxed: if filtered list is empty, fall back to unfiltered)
    def filtered(lst):
        f = [i for i in lst if _passes_filters(i, occasion, season)]
        return f if f else lst

    tops       = filtered(tops)
    bottoms    = filtered(bottoms)
    shoes_list = filtered(shoes_list)

    if not tops or not bottoms:
        return []

    candidates: List[Dict] = []

    # Limit iterations for large wardrobes to avoid slow response
    max_combos = 300
    combos_tried = 0

    for top in tops:
        for bottom in bottoms:
            if combos_tried >= max_combos:
                break

            combos_tried += 1
            top_dict    = _item_to_dict(top)
            bottom_dict = _item_to_dict(bottom)
            outfit_items = [top_dict, bottom_dict]

            # Pick best-scoring shoes for this top+bottom combination
            best_shoes = None
            best_shoes_score = -1.0
            for shoe in shoes_list:
                shoe_dict = _item_to_dict(shoe)
                test_items = [top_dict, bottom_dict, shoe_dict]
                test_score = score_outfit(test_items, occasion, season)["score"]
                if test_score > best_shoes_score:
                    best_shoes_score = test_score
                    best_shoes = shoe

            if best_shoes:
                outfit_items.append(_item_to_dict(best_shoes))

            # Add outerwear for cold seasons
            chosen_outerwear = None
            if season in ("fall", "autumn", "winter") and outerwear:
                ow = outerwear[0]
                outfit_items.append(_item_to_dict(ow))
                chosen_outerwear = ow

            # Optionally add a random accessory
            chosen_accessory = None
            if accessories and random.random() > 0.4:
                chosen_accessory = random.choice(accessories)

            # Score final combination
            result = score_outfit(outfit_items, occasion, season)

            # Build item set for deduplication
            item_ids: Set[str] = {str(top.id), str(bottom.id)}
            if best_shoes:
                item_ids.add(str(best_shoes.id))

            # Skip if this exact combo was already used (planner dedup)
            if any(item_ids == existing for existing in exclude_outfit_item_sets):
                continue

            candidates.append({
                "top":        top,
                "bottom":     bottom,
                "outerwear":  chosen_outerwear,
                "shoes":      best_shoes,
                "accessories": [chosen_accessory] if chosen_accessory else [],
                "item_ids":   item_ids,
                **result,
            })

    # Sort by score descending, return top N
    candidates.sort(key=lambda x: x["score"], reverse=True)
    return candidates[:n]
