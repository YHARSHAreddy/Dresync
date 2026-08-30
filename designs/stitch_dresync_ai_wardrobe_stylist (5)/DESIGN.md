---
name: Dresync Aesthetic
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#45474c'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#75777c'
  outline-variant: '#c5c6cc'
  surface-tint: '#575f6d'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141c28'
  on-primary-container: '#7c8493'
  inverse-primary: '#bfc7d7'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c19'
  on-tertiary-container: '#838480'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe3f4'
  primary-fixed-dim: '#bfc7d7'
  on-primary-fixed: '#141c28'
  on-primary-fixed-variant: '#3f4755'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e3e3de'
  tertiary-fixed-dim: '#c6c7c2'
  on-tertiary-fixed: '#1a1c19'
  on-tertiary-fixed-variant: '#454744'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 80px
---

## Brand & Style

The design system embodies a **Premium Fashion-Tech** identity, merging the tactile elegance of high-end editorial magazines with the precision of AI-driven technology. The target audience consists of fashion-conscious individuals who value curation, efficiency, and a sophisticated digital environment.

The visual style is a fusion of **Minimalism** and **Glassmorphism**. It prioritizes high-quality imagery—treating wardrobe items as art—surrounded by expansive whitespace and ethereal, translucent layers. The emotional response should be one of "effortless luxury": calm, organized, and deeply personalized. The interface acts as a quiet frame for the vibrant photography of the user's wardrobe.

## Colors

The palette is rooted in sophisticated neutrals to ensure the user's clothing colors remain the focus.
- **Primary (Midnight Blue):** Used for primary actions, heavy text, and navigational anchors.
- **Secondary (Soft Gold):** Reserved for "AI-Powered" moments, premium status indicators, and subtle highlights.
- **Background (Champagne Cream):** A warm, off-white base that feels more luxurious and softer than pure white.
- **Surface (Glass):** A semi-transparent white used for cards and overlays to create depth without clutter.
- **Neutrals (Soft Charcoal):** Used for secondary text and UI borders to maintain a low-contrast, high-end feel.

## Typography

This system utilizes a classic editorial pairing. **Playfair Display** provides the "Editorial Voice," used for page titles, section headers, and featured AI insights. Its high-contrast strokes evoke luxury.

**Inter** serves as the "System Voice," ensuring maximum legibility for functional UI elements, wardrobe metadata, and settings. 

Large display type should use tighter letter spacing for a modern look, while small labels use increased tracking (letter spacing) and uppercase styling to mimic high-end brand tags.

## Layout & Spacing

The layout follows a **Fluid Grid** model with extremely generous margins to simulate a fashion lookbook. 
- **Desktop:** 12-column grid with 64px outer margins. Content is often centered with wide "breathing room" on the flanks.
- **Mobile:** 4-column grid with 20px margins. 
- **Rhythm:** An 8px base unit is used, but preferred increments are larger (24px, 32px, 64px) to avoid visual density. 

Elements should feel "hung" in space rather than packed together. Vertical rhythm is driven by the `section-gap` to clearly delineate different outfit categories or style suggestions.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and soft, ambient occlusion rather than traditional shadows.
- **Layers:** Background (Champagne) -> Surface (Glass Card) -> Floating (Active Element).
- **Glass Effect:** Surfaces use a background blur of `20px` to `32px` and a thin `1px` white border at `20%` opacity to define the edge.
- **Shadows:** Only used on the highest level (e.g., a modal or a floating action button). Shadows should be "Long & Soft"—low opacity (`4-8%`) with a large spread and a slight tint of the Primary color (`#121A26`) to maintain color harmony.

## Shapes

The shape language is defined by "Organic Precision." 
- **Primary Container Radius:** Use `24px` (1.5rem) for main cards and wardrobe item containers.
- **Feature/Hero Radius:** Use `40px` (2.5rem) for large image banners or AI "Look of the Day" cards.
- **Button Radius:** A mix of soft-rectangular (`12px`) and full-pill shapes for secondary filters.

Avoid sharp 90-degree angles entirely to maintain the approachable, "soft-tech" aesthetic.

## Components

### Buttons
- **Primary:** Solid Midnight Blue with white text. High-contrast, no shadow, subtle `8px` radius.
- **Secondary:** Transparent with a `1px` Soft Charcoal border.
- **Ghost:** Pure text with the `label-caps` typography style.

### Cards (Wardrobe & Outfits)
Cards are the core of this system. They must use the Glassmorphism style: `70%` white fill, `32px` blur, and a `24px` corner radius. Images within cards should have a `16px` internal radius, creating a nested, soft look.

### Input Fields
Inputs are minimal: a single bottom border or a very light `tertiary` fill. Focus states use the Soft Gold accent for the cursor and underline.

### Chips & Filters
Small, pill-shaped elements with a `secondary` background at `10%` opacity. When active, they switch to solid Midnight Blue.

### Wardrobe Grid
A masonry or strict square grid with generous `24px` spacing between items. Every item should have a subtle hover effect that slightly scales the image—simulating the feeling of browsing a physical boutique.

### AI Stylist Modal
Use a full-screen blur background with a centered, glass-textured container. Typography should shift to `headline-md` for the AI's "voice" to make the interaction feel personal and editorial.