import type { Config } from "tailwindcss";

/** Resolves a color from an "R G B" CSS variable, honoring Tailwind's opacity modifiers (e.g. bg-card/40). */
function withOpacity(varName: string): string {
  return (({ opacityValue }: { opacityValue?: string }) =>
    opacityValue !== undefined
      ? `rgb(var(${varName}) / ${opacityValue})`
      : `rgb(var(${varName}))`) as unknown as string;
}

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Brand colors */
        cyan: withOpacity("--color-cyan-rgb"),
        "cyan-dark": withOpacity("--color-cyan-dark-rgb"),
        "cyan-light": withOpacity("--color-cyan-light-rgb"),
        "cyan-bg": withOpacity("--color-cyan-bg-rgb"),

        /* Background scale */
        "bg-base": withOpacity("--bg-base-rgb"),
        "bg-primary": withOpacity("--bg-primary-rgb"),
        "bg-card": withOpacity("--bg-card-rgb"),
        "bg-sidebar": withOpacity("--bg-sidebar-rgb"),
        "bg-hover": withOpacity("--bg-hover-rgb"),
        "bg-border": withOpacity("--bg-border-rgb"),

        /* Text scale */
        "text-primary": withOpacity("--text-primary-rgb"),
        "text-secondary": withOpacity("--text-secondary-rgb"),
        "text-muted": withOpacity("--text-muted-rgb"),
        "text-disabled": withOpacity("--text-disabled-rgb"),

        /* Semantic */
        positive: withOpacity("--color-positive-rgb"),
        negative: withOpacity("--color-negative-rgb"),
        caution: withOpacity("--color-caution-rgb"),
        "color-ai": withOpacity("--color-ai-rgb"),
        info: withOpacity("--color-info-rgb"),

        /* Legacy (backward compat) */
        "accent-purple": "var(--accent-purple)",
        "accent-green": "var(--accent-green)",
        "accent-blue": "var(--accent-blue)",
        "accent-amber": "var(--accent-amber)",
        error: "var(--error)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        xs: "14px",
        base: "16px",
        lg: "20px",
        "2xl": "28px",
        "4xl": "36px",
      },
      borderRadius: {
        card: "12px",
      },
      spacing: {
        sidebar: "240px",
        "touch-target": "48px",
      },
      maxWidth: {
        reading: "680px",
        platform: "1680px",
      },
      screens: {
        mobile: { max: "767px" },
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
