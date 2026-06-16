/**
 * Design System 2.0 Tokens
 * Color palette, spacing scale, typography scale
 */

// ============================================================================
// COLORS — FinanceHub 2.0 Design System
// ============================================================================

export const colors = {
  // Primary brand — Cyan
  cyan: {
    primary: "#00d4b8",      // Main accent
    dark: "#00b8a0",         // Hover state
    light: "#00e8cc",        // Active state
    bg: "#003d35",           // Tinted background
    border: "#00d4b820",     // 12% opacity for borders
  },

  // Semantic — Blue
  blue: {
    info: "#1b8aff",
    border: "#1b8aff20",
  },

  // Background scale (dark-to-dark)
  background: {
    base: "#060a0f",         // Absolute base
    surface: "#0a0e13",      // Body background
    card: "#0d1520",         // Card/panels
    sidebar: "#111c29",      // Sidebar bg
    hover: "#162030",        // Hover state
    border: "#1e2d3d",       // Border color
    "border-em": "#2d3f52",  // Emphasized border
  },

  // Text scale
  text: {
    primary: "#e2e8f0",      // Main text
    secondary: "#94a3b8",    // Secondary text
    muted: "#64748b",        // Muted/labels
    disabled: "#475569",     // Disabled state
  },

  // Semantic — Data colors
  sentiment: {
    positive: "#4ade80",     // Up/gain
    negative: "#f87171",     // Down/loss
    caution: "#fbbf24",      // Warning
    ai: "#a78bfa",           // AI accent
  },

  // Semantic — Backgrounds
  "sentiment-bg": {
    positive: "#0a2e1e",     // Green background
    negative: "#2e0a0a",     // Red background
  },
} as const;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const spacing = {
  // Base unit: 4px
  xs: "4px",    // 1 unit
  sm: "8px",    // 2 units
  md: "12px",   // 3 units
  base: "16px", // 4 units
  lg: "20px",   // 5 units
  xl: "24px",   // 6 units
  "2xl": "32px",  // 8 units
  "3xl": "40px",  // 10 units
  "4xl": "48px",  // 12 units
  "6xl": "64px",  // 16 units
  "8xl": "80px",  // 20 units
  "10xl": "96px", // 24 units
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Families (already in layout.tsx)
  fontFamily: {
    sans: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },

  // Font sizes
  fontSize: {
    xs: { size: "12px", weight: 400, lineHeight: "16px" },
    sm: { size: "13px", weight: 400, lineHeight: "18px" },
    base: { size: "14px", weight: 400, lineHeight: "20px" },
    md: { size: "16px", weight: 400, lineHeight: "24px" },
    lg: { size: "18px", weight: 400, lineHeight: "26px" },
    xl: { size: "20px", weight: 400, lineHeight: "28px" },
    "2xl": { size: "24px", weight: 400, lineHeight: "32px" },
    "3xl": { size: "28px", weight: 700, lineHeight: "36px" },
    "4xl": { size: "36px", weight: 800, lineHeight: "44px" },
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Letter spacing for labels/headings
  letterSpacing: {
    tight: "-0.5px",
    normal: "0",
    wide: "0.8px",
    wider: "1.5px",
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  sm: "4px",
  base: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
  full: "9999px",
} as const;

// ============================================================================
// SHADOWS (optional, for future use)
// ============================================================================

export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
} as const;
