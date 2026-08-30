/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
        "outline": "var(--color-outline)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "on-surface": "var(--color-on-surface)",
        "primary-container": "var(--color-primary-container)",
        "primary-fixed": "var(--color-primary-fixed)",
        "surface-container-high": "var(--color-surface-container-high)",
        "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "inverse-surface": "var(--color-inverse-surface)",
        "on-primary-container": "var(--color-on-primary-container)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
        "secondary": "var(--color-secondary)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "surface-bright": "var(--color-surface-bright)",
        "tertiary-container": "var(--color-tertiary-container)",
        "surface-container-low": "var(--color-surface-container-low)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "on-tertiary": "var(--color-on-tertiary)",
        "primary-fixed-dim": "var(--color-primary-fixed-dim)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "surface-dim": "var(--color-surface-dim)",
        "background": "var(--color-background)",
        "on-background": "var(--color-on-background)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
        "error": "var(--color-error)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        "on-error-container": "var(--color-on-error-container)",
        "outline-variant": "var(--color-outline-variant)",
        "surface-variant": "var(--color-surface-variant)",
        "on-primary-fixed": "var(--color-on-primary-fixed)",
        "inverse-primary": "var(--color-inverse-primary)",
        "surface-tint": "var(--color-surface-tint)",
        "on-primary": "var(--color-on-primary)",
        "error-container": "var(--color-error-container)",
        "primary": "var(--color-primary)",
        "tertiary": "var(--color-tertiary)",
        "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
        "secondary-container": "var(--color-secondary-container)",
        "on-secondary": "var(--color-on-secondary)",
        "surface-container": "var(--color-surface-container)",
        "surface": "var(--color-surface)",
        "on-error": "var(--color-on-error)"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "margin-desktop": "64px",
        "section-gap": "80px",
        "margin-mobile": "20px",
        "container-max": "1440px",
        "unit": "8px",
        "gutter": "24px"
      },
      "fontFamily": {
        "button": ["Inter"],
        "headline-md": ["Playfair Display"],
        "label-caps": ["Inter"],
        "display-lg": ["Playfair Display"],
        "body-lg": ["Inter"],
        "body-md": ["Inter"],
        "display-lg-mobile": ["Playfair Display"],
        "headline-sm": ["Playfair Display"]
      },
      "fontSize": {
        "button": ["14px", { "lineHeight": "1.0", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "headline-md": ["32px", { "lineHeight": "1.2", "fontWeight": "500" }],
        "label-caps": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.1em", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "letterSpacing": "-0.01em", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "display-lg-mobile": ["32px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "headline-sm": ["24px", { "lineHeight": "1.3", "fontWeight": "500" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
