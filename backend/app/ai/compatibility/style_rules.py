"""
Style compatibility rules.
Each style has a set of compatible styles. An outfit scores higher when
all included items share at least one compatible style.
"""

from typing import List, Tuple, Set, Dict

# Map each style to the set of styles it works with
STYLE_COMPAT: Dict[str, Set[str]] = {
    "casual":          {"casual", "streetwear", "sporty", "smart_casual", "bohemian", "vintage"},
    "smart_casual":    {"smart_casual", "casual", "business_casual", "preppy"},
    "business_casual": {"business_casual", "smart_casual", "formal", "preppy"},
    "formal":          {"formal", "business_casual"},
    "streetwear":      {"streetwear", "casual", "sporty", "athleisure"},
    "sporty":          {"sporty", "casual", "streetwear", "athleisure"},
    "athleisure":      {"athleisure", "sporty", "streetwear", "casual"},
    "bohemian":        {"bohemian", "casual", "vintage"},
    "vintage":         {"vintage", "casual", "bohemian", "preppy"},
    "preppy":          {"preppy", "smart_casual", "business_casual", "vintage"},
    "minimalist":      {"minimalist", "smart_casual", "formal", "casual"},
    "edgy":            {"edgy", "streetwear", "rock"},
    "rock":            {"rock", "edgy", "streetwear", "casual"},
}

KNOWN_STYLES = set(STYLE_COMPAT.keys())


def styles_are_compatible(styles1: List[str], styles2: List[str]) -> Tuple[float, str]:
    """
    Check if two style lists are compatible.
    Returns (score, reason).
    """
    if not styles1 or not styles2:
        return 0.70, "Style not specified — combination may work"

    s1 = {s.lower().strip() for s in styles1}
    s2 = {s.lower().strip() for s in styles2}

    # Direct overlap
    if s1 & s2:
        shared = (s1 & s2).pop()
        return 1.0, f"Both pieces share a {shared} style"

    # Check compatibility map
    for style_a in s1:
        compat = STYLE_COMPAT.get(style_a, set())
        if s2 & compat:
            matched = (s2 & compat).pop()
            return 0.85, f"{style_a.title()} and {matched.title()} styles complement each other"

    # No compatibility found
    style_names = ", ".join(s1) + " vs " + ", ".join(s2)
    return 0.35, f"Style mismatch: {style_names}"


def score_outfit_styles(items: List[Dict]) -> Tuple[float, List[str]]:
    """
    Score a list of clothing items (each with a 'styles' key) for style compatibility.
    Returns (score 0–1, reasons list).
    """
    if len(items) < 2:
        return 1.0, []

    scores: List[float] = []
    reasons: List[str] = []

    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            s1 = items[i].get("styles", [])
            s2 = items[j].get("styles", [])
            score, reason = styles_are_compatible(s1, s2)
            scores.append(score)
            if reason not in reasons:
                reasons.append(reason)

    if not scores:
        return 0.70, ["Style compatibility unknown"]

    avg = sum(scores) / len(scores)
    return round(avg, 3), reasons[:2]
