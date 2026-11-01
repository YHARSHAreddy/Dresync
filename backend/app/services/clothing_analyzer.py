import io
import os
import math
import json
import base64
import requests
from typing import Tuple, List, Optional
from PIL import Image, ImageFilter
from app.models.clothing import ClothingCategory, ClothingPattern
from app.schemas.clothing import ClothingAnalysisResult
from app.storage.local import storage

NAMED_COLORS = {
    'Jet Black': (18, 18, 18),
    'Charcoal': (55, 65, 81),
    'Slate Gray': (100, 116, 139),
    'Light Gray': (209, 213, 219),
    'Crisp White': (248, 250, 252),
    'Navy Blue': (30, 58, 138),
    'Royal Blue': (37, 99, 235),
    'Sky Blue': (56, 189, 248),
    'Teal': (13, 148, 136),
    'Forest Green': (22, 101, 52),
    'Olive Green': (101, 116, 50),
    'Sage Green': (134, 150, 126),
    'Burgundy': (128, 0, 32),
    'Crimson Red': (185, 28, 28),
    'Rust Orange': (194, 65, 12),
    'Mustard Yellow': (202, 138, 4),
    'Camel': (193, 154, 107),
    'Beige': (245, 245, 220),
    'Chocolate Brown': (67, 40, 24),
}


def _color_distance(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))


def _closest_color_name(rgb: Tuple[int, int, int]) -> str:
    return min(NAMED_COLORS.keys(), key=lambda name: _color_distance(rgb, NAMED_COLORS[name]))


def _rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"


def _analyze_with_gemini(file_bytes: bytes, filename: str) -> Optional[dict]:
    """
    Attempt Gemini Vision API if GEMINI_API_KEY or GOOGLE_API_KEY is present in environment.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    try:
        b64_data = base64.b64encode(file_bytes).decode("utf-8")
        ext = os.path.splitext(filename)[1].lower().replace(".", "")
        mime_type = f"image/{ext}" if ext in ("png", "webp", "jpeg", "jpg") else "image/jpeg"
        if mime_type == "image/jpg":
            mime_type = "image/jpeg"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        prompt = (
            "You are an AI fashion wardrobe expert. Analyze this clothing photo. "
            "Return ONLY a valid JSON object (no markdown, no quotes around json) with the following structure:\n"
            "{\n"
            '  "category": "top" | "bottom" | "outerwear" | "shoes" | "accessory",\n'
            '  "subcategory": "string (e.g. T-Shirt, Oxford Shirt, Chinos, Jeans, Sneakers, Blazer)",\n'
            '  "name": "string (concise descriptive name, e.g. Navy Blue Oxford Shirt)",\n'
            '  "primary_color": "hex string e.g. #1e3a8a",\n'
            '  "color_name": "string friendly color name e.g. Navy Blue",\n'
            '  "secondary_colors": ["hex strings"],\n'
            '  "pattern": "solid" | "striped" | "checkered" | "floral" | "geometric" | "animal_print" | "abstract" | "other",\n'
            '  "styles": ["casual" | "formal" | "smart_casual" | "streetwear" | "athletic" | "minimalist"],\n'
            '  "seasons": ["all_season" | "spring" | "summer" | "autumn" | "winter"],\n'
            '  "occasions": ["everyday" | "work" | "casual" | "formal" | "party" | "date" | "sport"],\n'
            '  "notes": "string detailing fabric texture, weave, and fit"\n'
            "}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": b64_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        resp = requests.post(url, json=payload, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean possible markdown wrap
            cleaned = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(cleaned)
    except Exception as e:
        print(f"Gemini vision extraction fallback to CV: {e}")
        return None

    return None


def _analyze_with_cv(im: Image.Image) -> dict:
    """
    Intelligent Computer Vision and color/pattern extraction using Pillow.
    Extracts foreground garment, dominant palette, and edge frequency for pattern detection.
    """
    im_rgba = im.convert("RGBA")
    w, h = im_rgba.size
    aspect_ratio = w / h if h > 0 else 1.0

    # Downsample for fast analysis
    thumb = im_rgba.resize((140, 140))
    pixels = list(thumb.getdata())

    # Detect background color from corners
    corner_indices = [0, 139, 140 * 139, 140 * 140 - 1]
    corner_rgbs = [pixels[idx][:3] for idx in corner_indices if pixels[idx][3] > 50]
    if corner_rgbs:
        bg_r = sum(c[0] for c in corner_rgbs) // len(corner_rgbs)
        bg_g = sum(c[1] for c in corner_rgbs) // len(corner_rgbs)
        bg_b = sum(c[2] for c in corner_rgbs) // len(corner_rgbs)
        bg_color = (bg_r, bg_g, bg_b)
    else:
        bg_color = (255, 255, 255)

    # Extract foreground pixels
    fg_pixels: List[Tuple[int, int, int]] = []
    for r, g, b, a in pixels:
        if a < 40:
            continue
        if _color_distance((r, g, b), bg_color) > 36:
            fg_pixels.append((r, g, b))

    if not fg_pixels:
        # Fallback if whole image was deemed background
        fg_pixels = [p[:3] for p in pixels if p[3] > 40]

    # Cluster colors by 24-step bins
    bin_size = 24
    binned = [
        (
            min(255, (r // bin_size) * bin_size + bin_size // 2),
            min(255, (g // bin_size) * bin_size + bin_size // 2),
            min(255, (b // bin_size) * bin_size + bin_size // 2)
        )
        for r, g, b in fg_pixels
    ]
    from collections import Counter
    counts = Counter(binned).most_common(8)

    primary_rgb = counts[0][0] if counts else (40, 50, 70)
    primary_color = _rgb_to_hex(primary_rgb)
    color_name = _closest_color_name(primary_rgb)

    # Find secondary distinct colors
    secondary_colors = []
    for rgb, _ in counts[1:]:
        if _color_distance(rgb, primary_rgb) > 55:
            hex_val = _rgb_to_hex(rgb)
            if hex_val not in secondary_colors:
                secondary_colors.append(hex_val)
        if len(secondary_colors) >= 2:
            break

    # Analyze pattern using Edge Variance on grayscale thumbnail
    gray_thumb = thumb.convert("L")
    edges = gray_thumb.filter(ImageFilter.FIND_EDGES)
    edge_data = list(edges.getdata())
    mean_edge = sum(edge_data) / len(edge_data) if edge_data else 0

    # Calculate horizontal vs vertical variance
    diff_h = 0
    diff_v = 0
    edge_grid = [edge_data[i * 140:(i + 1) * 140] for i in range(140)]
    for y in range(1, 139):
        for x in range(1, 139):
            diff_h += abs(edge_grid[y][x] - edge_grid[y][x - 1])
            diff_v += abs(edge_grid[y][x] - edge_grid[y - 1][x])

    total_diff = diff_h + diff_v + 1e-5
    h_ratio = diff_h / total_diff

    # Determine pattern
    if mean_edge < 14:
        pattern = ClothingPattern.solid
    elif abs(h_ratio - 0.5) > 0.18:
        pattern = ClothingPattern.striped
    elif mean_edge > 32:
        pattern = ClothingPattern.checkered if abs(h_ratio - 0.5) < 0.08 else ClothingPattern.floral
    else:
        pattern = ClothingPattern.solid

    # Estimate category
    if aspect_ratio < 0.62:
        category = ClothingCategory.bottom
        subcategory = "Trousers"
    elif aspect_ratio > 1.25 and h < 800:
        category = ClothingCategory.shoes
        subcategory = "Footwear"
    else:
        category = ClothingCategory.top
        subcategory = "Top"

    # Default styles / seasons
    styles = ["casual"]
    if color_name in ("Charcoal", "Jet Black", "Navy Blue", "Slate Gray", "Crisp White"):
        styles.append("smart_casual")
    seasons = ["all_season"]
    occasions = ["everyday", "casual"]

    # Formulate title
    name = f"{color_name} {subcategory}"

    return {
        "category": category,
        "subcategory": subcategory,
        "name": name,
        "primary_color": primary_color,
        "color_name": color_name,
        "secondary_colors": secondary_colors,
        "pattern": pattern,
        "styles": styles,
        "seasons": seasons,
        "occasions": occasions,
        "notes": f"Detected {color_name} with {pattern.value} texture.",
    }


def analyze_clothing_image(file_bytes: bytes, filename: str, user_id: str) -> ClothingAnalysisResult:
    """
    Main entry point for wardrobe clothing image and texture analysis.
    Saves image to storage and performs AI/CV extraction of colors, texture, pattern, and category.
    """
    # 1. Save permanently to uploads under user's directory
    image_url = storage.save(file_bytes, filename, subfolder=str(user_id))

    # 2. Try Gemini Vision first
    result = _analyze_with_gemini(file_bytes, filename)

    # 3. Fallback to local CV if Gemini not available or failed
    if not result:
        im = Image.open(io.BytesIO(file_bytes))
        result = _analyze_with_cv(im)

    # Validate category and pattern enums safely
    raw_cat = str(result.get("category", "top")).lower()
    valid_cat = ClothingCategory.top
    for c in ClothingCategory:
        if c.value == raw_cat:
            valid_cat = c
            break

    raw_pat = str(result.get("pattern", "solid")).lower()
    valid_pat = ClothingPattern.solid
    for p in ClothingPattern:
        if p.value == raw_pat:
            valid_pat = p
            break

    return ClothingAnalysisResult(
        name=result.get("name", "Wardrobe Piece"),
        category=valid_cat,
        subcategory=result.get("subcategory"),
        primary_color=result.get("primary_color", "#2563eb"),
        color_name=result.get("color_name"),
        secondary_colors=result.get("secondary_colors", []),
        pattern=valid_pat,
        styles=result.get("styles", ["casual"]),
        seasons=result.get("seasons", ["all_season"]),
        occasions=result.get("occasions", ["everyday"]),
        notes=result.get("notes"),
        image_url=image_url
    )
