/**
 * Design Tokens — saas-ui
 *
 * Single source of truth for the entire library.
 * Tailwind @theme, Figma variables, and every component derive from here.
 * Never use raw values in components — always reference a token.
 */

// ─── Colour ───────────────────────────────────────────────────────────────────
// Neutral scale only — theme colours live in src/themes/*.css

export const colors = {
  neutral: {
    0: "#ffffff",
    50: "#f8fafc",
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
// Base unit: 4px.
// Token name → CSS var           → Tailwind utility
// spacing[1] → var(--spacing-1)  → p-1, gap-1, m-1 …
// spacing[2] → var(--spacing-2)  → p-2, gap-2 …
// Figma: "Spacing / {key}" variables in each theme collection

export const spacing = {
  0: "0px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
// Token name → CSS var             → Tailwind utility
// radius.sm  → var(--radius-sm)   → rounded-(--radius-sm)
// radius.md  → var(--radius-md)   → rounded-(--radius-md)   ← default components
// radius.lg  → var(--radius-lg)   → rounded-(--radius-lg)   ← cards, panels
// radius.xl  → var(--radius-xl)   → rounded-(--radius-xl)   ← modals
// radius.full→ var(--radius-full) → rounded-(--radius-full) ← badges, pills
// Figma: "Radius / {key}" variables in each theme collection

export const radius = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontFamily = {
  sans: ["Inter", "system-ui", "sans-serif"],
  mono: ["JetBrains Mono", "Fira Code", "monospace"],
} as const;

export const fontSize = {
  xs: ["11px", { lineHeight: "16px" }],
  sm: ["12px", { lineHeight: "16px" }],
  base: ["14px", { lineHeight: "20px" }],
  md: ["16px", { lineHeight: "24px" }],
  lg: ["18px", { lineHeight: "28px" }],
  xl: ["20px", { lineHeight: "28px" }],
  "2xl": ["24px", { lineHeight: "32px" }],
  "3xl": ["30px", { lineHeight: "36px" }],
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadow = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
} as const;

// ─── Transitions ─────────────────────────────────────────────────────────────

export const transition = {
  fast: "100ms ease",
  base: "150ms ease",
  slow: "250ms ease",
} as const;

// ─── Z-index ─────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

// ─── Semantic aliases ─────────────────────────────────────────────────────────
// Neutral-derived only. Primary / state colours → use CSS vars directly.

export const semantic = {
  textPrimary: colors.neutral[900],
  textSecondary: colors.neutral[600],
  textTertiary: colors.neutral[400],
  textInverse: colors.neutral[0],

  bgPage: colors.neutral[50],
  bgSurface: colors.neutral[0],
  bgSubtle: colors.neutral[100],

  borderDefault: colors.neutral[200],
  borderStrong: colors.neutral[300],
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
