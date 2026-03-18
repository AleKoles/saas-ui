/**
 * Design Tokens — saas-ui
 *
 * This is the single source of truth for the entire library.
 * Tailwind config, Pencil.dev, and every component all derive from here.
 * Never use raw colour hex or spacing values in components — always reference
 * a token so design and code stay in sync.
 */

// ─── Colour ───────────────────────────────────────────────────────────────────
//
// PRIMARY COLOUR is not here → lives in src/themes/*.css as --color-primary
// SEMANTIC COLOURS (success, danger, warning, info) are not here either →
// they also live in src/themes/*.css because each theme has its own palette.
//
// Only the neutral scale lives here — it never changes between themes.
//
export const colors = {
    neutral: {
      0:   "#ffffff",
      50:  "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
  } as const;
  
  // ─── Spacing ─────────────────────────────────────────────────────────────────
  // Base unit: 4px. Matches Tailwind's default scale.
  
  export const spacing = {
    0:   "0px",
    1:   "4px",
    2:   "8px",
    3:   "12px",
    4:   "16px",
    5:   "20px",
    6:   "24px",
    8:   "32px",
    10:  "40px",
    12:  "48px",
    16:  "64px",
    20:  "80px",
    24:  "96px",
  } as const;
  
  // ─── Border radius ────────────────────────────────────────────────────────────
  
  export const radius = {
    none:  "0px",
    sm:    "4px",
    md:    "8px",   // ← default for most components
    lg:    "12px",  // cards, panels
    xl:    "16px",  // modals
    full:  "9999px" // badges, pills, avatars
  } as const;
  
  // ─── Typography ───────────────────────────────────────────────────────────────
  
  export const fontFamily = {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Fira Code", "monospace"],
  } as const;
  
  export const fontSize = {
    xs:   ["11px", { lineHeight: "16px" }],
    sm:   ["12px", { lineHeight: "16px" }],
    base: ["14px", { lineHeight: "20px" }],
    md:   ["16px", { lineHeight: "24px" }],
    lg:   ["18px", { lineHeight: "28px" }],
    xl:   ["20px", { lineHeight: "28px" }],
    "2xl":["24px", { lineHeight: "32px" }],
    "3xl":["30px", { lineHeight: "36px" }],
  } as const;
  
  export const fontWeight = {
    normal:   "400",
    medium:   "500",
    semibold: "600",
    bold:     "700",
  } as const;
  
  // ─── Shadows ─────────────────────────────────────────────────────────────────
  // Used sparingly — only for elevation (cards, modals, dropdowns)
  
  export const shadow = {
    sm:  "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md:  "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
    lg:  "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
    xl:  "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
  } as const;
  
  // ─── Transitions ─────────────────────────────────────────────────────────────
  // Respect prefers-reduced-motion — components check this at runtime
  
  export const transition = {
    fast:   "100ms ease",
    base:   "150ms ease",
    slow:   "250ms ease",
  } as const;
  
  // ─── Z-index scale ────────────────────────────────────────────────────────────
  
  export const zIndex = {
    base:    0,
    raised:  10,
    dropdown:100,
    sticky:  200,
    overlay: 300,
    modal:   400,
    toast:   500,
  } as const;
  
  // ─── Semantic aliases ─────────────────────────────────────────────────────────
  // Only neutral-derived aliases live here.
  // Anything primary or state-coloured → use CSS custom properties directly
  // e.g. var(--color-primary), var(--color-success-500)
  
  export const semantic = {
    // Text hierarchy — neutral only
    textPrimary:    colors.neutral[900],
    textSecondary:  colors.neutral[600],
    textTertiary:   colors.neutral[400],
    textInverse:    colors.neutral[0],
  
    // Backgrounds — neutral only
    bgPage:         colors.neutral[50],
    bgSurface:      colors.neutral[0],
    bgSubtle:       colors.neutral[100],
  
    // Borders — neutral only
    borderDefault:  colors.neutral[200],
    borderStrong:   colors.neutral[300],
  } as const;
  
  // ─── Master export ────────────────────────────────────────────────────────────
  
  export const tokens = {
    colors,
    spacing,
    radius,
    fontFamily,
    fontSize,
    fontWeight,
    shadow,
    transition,
    zIndex,
    semantic,
  } as const;
  
  export type Tokens = typeof tokens;