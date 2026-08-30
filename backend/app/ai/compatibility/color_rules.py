"""
Color compatibility rules based on color wheel theory.

Colors are mapped to one of 7 color wheel families (red, orange, yellow,
green, blue, purple, pink) or classified as neutral. Neutral colors work
with everything. Non-neutral pairs are scored using complementary,
analogous, or tonal relationships.
"""

from typing import Tuple, List, Dict

# ---------------------------------------------------------------------------
# Color Classification
# ---------------------------------------------------------------------------

NEUTRAL_COLORS = {
    "white", "black", "grey", "gray", "navy", "beige", "cream", "tan",
    "brown", "khaki", "olive", "charcoal", "ivory", "camel", "taupe",
    "stone", "sand", "off-white", "ecru", "bone", "denim", "dark brown",
    "light brown", "nude", "blush beige", "champagne",
}

# Map every common color name → wheel family
COLOR_FAMILY_MAP: Dict[str, str] = {
    # Reds
    "red": "red", "crimson": "red", "maroon": "red", "burgundy": "red",
    "wine": "red", "scarlet": "red", "cherry": "red", "ruby": "red",
    "carmine": "red", "oxblood": "red",
    # Oranges
    "orange": "orange", "coral": "orange", "peach": "orange",
    "salmon": "orange", "terracotta": "orange", "rust": "orange",
    "burnt orange": "orange", "copper": "orange",
    # Yellows
    "yellow": "yellow", "gold": "yellow", "mustard": "yellow",
    "amber": "yellow", "lemon": "yellow", "saffron": "yellow",
    "sunflower": "yellow", "butter": "yellow",
    # Greens
    "green": "green", "sage": "green", "mint": "green",
    "forest green": "green", "emerald": "green", "teal": "green",
    "lime": "green", "hunter green": "green", "moss": "green",
    "chartreuse": "green", "seafoam": "green", "army green": "green",
    "dark green": "green", "light green": "green",
    # Blues
    "blue": "blue", "royal blue": "blue", "sky blue": "blue",
    "powder blue": "blue", "cobalt": "blue", "indigo": "blue",
    "steel blue": "blue", "cornflower": "blue", "cerulean": "blue",
    "aqua": "blue", "cyan": "blue", "turquoise": "blue",
    "light blue": "blue", "dark blue": "blue", "midnight blue": "blue",
    # Purples
    "purple": "purple", "violet": "purple", "lavender": "purple",
    "plum": "purple", "lilac": "purple", "grape": "purple",
    "eggplant": "purple", "orchid": "purple", "periwinkle": "purple",
    # Pinks
    "pink": "pink", "hot pink": "pink", "rose": "pink",
    "blush": "pink", "fuchsia": "pink", "magenta": "pink",
    "dusty rose": "pink", "mauve": "pink", "bubblegum": "pink",
    "baby pink": "pink", "dark pink": "pink",
}

# Complementary pairs (opposite on colour wheel — high contrast, striking)
COMPLEMENTARY: Dict[str, str] = {
    "red": "green",
    "orange": "blue",
    "yellow": "purple",
    "green": "red",
    "blue": "orange",
    "purple": "yellow",
    "pink": "green",
}

# Analogous groups (adjacent families — harmonious, easy to wear)
ANALOGOUS_NEIGHBORS: Dict[str, List[str]] = {
    "red":    ["orange", "pink"],
    "orange": ["red", "yellow"],
    "yellow": ["orange", "green"],
    "green":  ["yellow", "blue"],
    "blue":   ["green", "purple"],
    "purple": ["blue", "pink"],
    "pink":   ["purple", "red"],
}


def _normalize(color: str) -> str:
    return color.lower().strip()


def is_neutral(color: str) -> bool:
    return _normalize(color) in NEUTRAL_COLORS


def get_color_family(color: str) -> str:
    return COLOR_FAMILY_MAP.get(_normalize(color), "unknown")


def score_color_pair(color1: str, color2: str) -> Tuple[float, str]:
    """
    Score two colors for compatibility.
    Returns (score 0.0–1.0, human-readable reason string).
    """
    c1 = _normalize(color1)
    c2 = _normalize(color2)

    # Identical colors → monochromatic
    if c1 == c2:
        return 0.88, f"Monochromatic {color1} look"

    n1, n2 = is_neutral(c1), is_neutral(c2)

    # Both neutrals — always works
    if n1 and n2:
        return 1.0, "Classic neutral combination"

    # One neutral + one colour — always works
    if n1 or n2:
        non_neutral = color2 if n1 else color1
        return 0.95, f"Neutral base lets {non_neutral} pop"

    f1 = get_color_family(c1)
    f2 = get_color_family(c2)

    # Can't classify — give benefit of the doubt
    if f1 == "unknown" or f2 == "unknown":
        return 0.60, "Color combination may work — experiment"

    # Same family → tonal / monochromatic
    if f1 == f2:
        return 0.85, f"Tonal {f1} pairing — cohesive look"

    # Complementary → striking contrast
    if COMPLEMENTARY.get(f1) == f2:
        return 0.90, f"{color1.title()} and {color2.title()} are complementary — bold contrast"

    # Analogous → harmonious
    if f2 in ANALOGOUS_NEIGHBORS.get(f1, []):
        return 0.80, f"{color1.title()} and {color2.title()} are analogous — harmonious blend"

    # No recognised relationship — risky
    return 0.45, f"{color1.title()} and {color2.title()} clash — bold choice"


def score_outfit_colors(items: List[Dict]) -> Tuple[float, List[str]]:
    """
    Score an entire outfit for colour compatibility.
    items: list of dicts with at least 'primary_color' key.
    Returns (average_score, list_of_reason_strings).
    """
    if len(items) < 2:
        return 1.0, []

    scores: List[float] = []
    reasons: List[str] = []

    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            c1 = items[i].get("primary_color", "")
            c2 = items[j].get("primary_color", "")
            if c1 and c2:
                s, r = score_color_pair(c1, c2)
                scores.append(s)
                if r not in reasons:
                    reasons.append(r)

    if not scores:
        return 0.70, ["Color compatibility unknown"]

    avg = sum(scores) / len(scores)
    # Slightly penalise low-scoring pairs more aggressively
    if min(scores) < 0.5:
        avg = avg * 0.85

    return round(avg, 3), reasons[:3]
