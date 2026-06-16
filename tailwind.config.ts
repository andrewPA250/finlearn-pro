import type { Config } from "tailwindcss";

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
        cyan: "var(--color-cyan)",
        "cyan-dark": "var(--color-cyan-dark)",
        "cyan-light": "var(--color-cyan-light)",
        "cyan-bg": "var(--color-cyan-bg)",

        /* Background scale */
        "bg-base": "var(--bg-base)",
        "bg-primary": "var(--bg-primary)",
        "bg-card": "var(--bg-card)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-hover": "var(--bg-hover)",
        "bg-border": "var(--bg-border)",

        /* Text scale */
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-disabled": "var(--text-disabled)",

        /* Semantic */
        positive: "var(--color-positive)",
        negative: "var(--color-negative)",
        caution: "var(--color-caution)",
        "color-ai": "var(--color-ai)",
        info: "var(--color-info)",

        /* Legacy (backward compat) */
        "accent-purple": "var(--accent-purple)",
        "accent-green": "var(--accent-green)",
        "accent-blue": "var(--accent-blue)",
        "accent-amber": "var(--accent-amber)",
        error: "var(--error)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
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
        platform: "1440px",
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
