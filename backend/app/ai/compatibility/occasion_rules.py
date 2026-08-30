"""
Occasion and season compatibility rules.
"""

from typing import List, Tuple, Dict, Set

OCCASION_COMPAT: Dict[str, Set[str]] = {
    "casual":          {"casual", "weekend", "everyday", "outdoor", "brunch"},
    "work":            {"work", "business", "office", "smart_casual"},
    "business":        {"business", "work", "formal", "office"},
    "formal":          {"formal", "business", "gala", "wedding"},
    "date":            {"date", "casual", "smart_casual", "dinner"},
    "dinner":          {"dinner", "date", "formal", "smart_casual"},
    "outdoor":         {"outdoor", "casual", "sporty", "adventure"},
    "sporty":          {"sporty", "outdoor", "gym", "athletic"},
    "gym":             {"gym", "sporty", "athletic"},
    "party":           {"party", "evening", "night out", "date"},
    "evening":         {"evening", "party", "dinner", "formal", "night out"},
    "weekend":         {"weekend", "casual", "outdoor", "brunch"},
    "travel":          {"travel", "casual", "outdoor", "comfort"},
    "beach":           {"beach", "casual", "outdoor", "vacation"},
    "wedding":         {"wedding", "formal", "semi_formal"},
    "semi_formal":     {"semi_formal", "formal", "smart_casual"},
}

SEASON_COMPAT: Dict[str, Set[str]] = {
    "spring":  {"spring", "all"},
    "summer":  {"summer", "all"},
    "fall":    {"fall", "autumn", "all"},
    "autumn":  {"fall", "autumn", "all"},
    "winter":  {"winter", "all"},
    "all":     {"spring", "summer", "fall", "autumn", "winter", "all"},
}


def score_occasion_match(
    item_occasions: List[List[str]], requested_occasion: str
) -> Tuple[float, str]:
    """
    Score how well a list of items' occasions match the requested occasion.
    item_occasions: list of each item's occasions list.
    """
    if not requested_occasion:
        return 0.70, "No occasion filter applied"

    req = requested_occasion.lower().strip()
    compat = OCCASION_COMPAT.get(req, {req})

    matched = 0
    total = 0

    for occ_list in item_occasions:
        if not occ_list:
            continue
        total += 1
        item_occ_set = {o.lower().strip() for o in occ_list}
        if item_occ_set & compat:
            matched += 1

    if total == 0:
        return 0.70, "Occasion not specified on items"
    if matched == total:
        return 1.0, f"All pieces are suited for {requested_occasion} occasions"
    if matched >= total * 0.5:
        return 0.75, f"Most pieces suit {requested_occasion} occasions"
    return 0.40, f"Some pieces may not suit {requested_occasion} occasions"


def score_season_match(
    item_seasons: List[List[str]], requested_season: str
) -> Tuple[float, str]:
    """
    Score how well items' season tags match the requested season.
    """
    if not requested_season:
        return 0.70, "No season filter applied"

    req = requested_season.lower().strip()
    compat = SEASON_COMPAT.get(req, {req})

    matched = 0
    total = 0

    for season_list in item_seasons:
        if not season_list:
            continue
        total += 1
        item_season_set = {s.lower().strip() for s in season_list}
        if item_season_set & compat:
            matched += 1

    if total == 0:
        return 0.70, "Season not specified on items"
    if matched == total:
        return 1.0, f"All pieces are appropriate for {requested_season}"
    if matched >= total * 0.5:
        return 0.75, f"Most pieces suit {requested_season} weather"
    return 0.40, f"Some pieces may not be suitable for {requested_season}"
