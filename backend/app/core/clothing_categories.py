import re
from typing import Optional
from app.models.clothing import ClothingCategory, ClothingItem

BOTTOM_KEYWORDS = [
    "jean", "jeans", "trouser", "trousers", "pant", "pants",
    "chino", "chinos", "short", "shorts", "jogger", "joggers",
    "cargo", "cargos", "slacks", "sweatpant", "sweatpants", "denim",
    "skirt", "skirts", "legging", "leggings", "trackpant", "trackpants",
    "capri", "capris", "bermuda", "boxer", "culotte", "culottes"
]

TOP_KEYWORDS = [
    "tshirt", "t-shirt", "tee", "shirt", "shirts", "polo", "hoodie",
    "sweater", "sweatshirt", "tank", "blouse", "jersey", "cardigan",
    "top", "tops", "tunic", "camisole", "vest", "pullover"
]

SHOES_KEYWORDS = [
    "shoe", "shoes", "sneaker", "sneakers", "boot", "boots",
    "loafer", "loafers", "sandal", "sandals", "slide", "slides",
    "footwear", "oxford", "oxfords", "derby", "heel", "heels", "flat", "flats"
]

OUTERWEAR_KEYWORDS = [
    "jacket", "coat", "blazer", "overcoat", "windbreaker", "parka", "trench", "anorak"
]

ACCESSORY_KEYWORDS = [
    "belt", "watch", "hat", "cap", "tie", "scarf", "sunglasses", "bag", "wallet"
]


def _text_matches_keywords(text: Optional[str], keywords: list[str]) -> bool:
    if not text:
        return False
    # Normalize words
    words = re.findall(r"\b[a-zA-Z-]+\b", text.lower())
    for word in words:
        if word in keywords:
            return True
        # Check stem without trailing 's'
        if word.endswith("s") and word[:-1] in keywords:
            return True
    return False


def get_effective_category(item) -> ClothingCategory:
    """
    Intelligently determines the true category of a clothing item.
    Inspects category, subcategory, and name so that bottom-wear like jeans,
    trousers, chinos, shorts, and pants are always recognized as bottoms even
    if the item was mistakenly assigned category 'top'.
    """
    if not item:
        return ClothingCategory.top

    raw_cat = item.category
    cat_val = raw_cat.value if hasattr(raw_cat, "value") else str(raw_cat).lower()

    subcat = str(getattr(item, "subcategory", "") or "").lower()
    name = str(getattr(item, "name", "") or "").lower()

    # Priority 1: If subcategory or name explicitly contains bottom keywords, it is a bottom
    # (except when specifically named a jacket like "denim jacket")
    if _text_matches_keywords(subcat, BOTTOM_KEYWORDS) or _text_matches_keywords(name, BOTTOM_KEYWORDS):
        if not _text_matches_keywords(name, OUTERWEAR_KEYWORDS) and not _text_matches_keywords(name, TOP_KEYWORDS):
            return ClothingCategory.bottom

    # Priority 2: Check if explicitly matched other categories
    if _text_matches_keywords(subcat, SHOES_KEYWORDS) or _text_matches_keywords(name, SHOES_KEYWORDS):
        return ClothingCategory.shoes

    if _text_matches_keywords(subcat, OUTERWEAR_KEYWORDS) or _text_matches_keywords(name, OUTERWEAR_KEYWORDS):
        return ClothingCategory.outerwear

    if _text_matches_keywords(subcat, ACCESSORY_KEYWORDS) or _text_matches_keywords(name, ACCESSORY_KEYWORDS):
        return ClothingCategory.accessory

    if _text_matches_keywords(subcat, TOP_KEYWORDS) or _text_matches_keywords(name, TOP_KEYWORDS):
        return ClothingCategory.top

    # Priority 3: Fallback to stored category value
    for c in ClothingCategory:
        if c.value == cat_val:
            return c

    return ClothingCategory.top


def infer_category_from_text(name: Optional[str], subcategory: Optional[str]) -> Optional[ClothingCategory]:
    """
    Infers the most appropriate category from user-entered name and subcategory.
    Useful when a user adds/edits a piece so the category dropdown auto-selects.
    """
    combined = f"{name or ''} {subcategory or ''}".strip()
    if not combined:
        return None

    if _text_matches_keywords(combined, BOTTOM_KEYWORDS):
        if not _text_matches_keywords(combined, OUTERWEAR_KEYWORDS) and not _text_matches_keywords(combined, TOP_KEYWORDS):
            return ClothingCategory.bottom

    if _text_matches_keywords(combined, SHOES_KEYWORDS):
        return ClothingCategory.shoes

    if _text_matches_keywords(combined, OUTERWEAR_KEYWORDS):
        return ClothingCategory.outerwear

    if _text_matches_keywords(combined, ACCESSORY_KEYWORDS):
        return ClothingCategory.accessory

    if _text_matches_keywords(combined, TOP_KEYWORDS):
        return ClothingCategory.top

    return None
