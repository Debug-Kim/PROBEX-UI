import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Probex Design Tokens ────────────────────────────────────────────
      colors: {
        // Brand primitives
        "probex-cyan":    "var(--probex-primary)",
        "probex-blue":    "#3B82F6",
        "probex-purple":  "var(--probex-secondary)",
        "probex-green":   "#10B981",
        "probex-red":     "#EF4444",
        "probex-amber":   "#F59E0B",

        // Surface system (theme-reactive via CSS vars)
        "surface-0":      "var(--probex-bg)",
        "surface-1":      "var(--probex-surface)",
        "surface-2":      "var(--probex-surface-2)",
        "surface-3":      "var(--probex-surface-3)",

        // Border system
        "border-subtle":  "var(--probex-border)",
        "border-default": "var(--probex-border-default)",
        "border-strong":  "var(--probex-border-strong)",
        "border-active":  "var(--probex-border-active)",

        // Text system
        "text-primary":   "var(--probex-text-primary)",
        "text-secondary": "var(--probex-text-secondary)",
        "text-muted":     "var(--probex-text-muted)",
        "text-disabled":  "var(--probex-text-disabled)",

        // Semantic
        "yes":            "var(--probex-yes)",
        "no":             "var(--probex-no)",
        "positive":       "var(--probex-positive)",
        "negative":       "var(--probex-negative)",
        "warning":        "var(--probex-warning)",

        // Consensus-specific
        "consensus-high":   "var(--probex-consensus-high)",
        "consensus-med":    "var(--probex-consensus-med)",
        "consensus-low":    "var(--probex-consensus-low)",
      },

      // ─── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        sans:  ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs:    ["0.75rem",  { lineHeight: "1rem" }],
        sm:    ["0.8125rem", { lineHeight: "1.25rem" }],
        base:  ["0.875rem", { lineHeight: "1.5rem" }],
        md:    ["0.9375rem", { lineHeight: "1.5rem" }],
        lg:    ["1rem",     { lineHeight: "1.5rem" }],
        xl:    ["1.125rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.25rem",  { lineHeight: "1.75rem" }],
        "3xl": ["1.5rem",   { lineHeight: "2rem" }],
        "4xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "5xl": ["2.25rem",  { lineHeight: "2.5rem" }],
        "6xl": ["3rem",     { lineHeight: "1" }],
      },

      // ─── Spacing ─────────────────────────────────────────────────────────
      spacing: {
        "4.5":  "1.125rem",
        "13":   "3.25rem",
        "15":   "3.75rem",
        "18":   "4.5rem",
        "sidebar-expanded":  "200px",
        "sidebar-collapsed": "52px",
        "topnav-height":     "52px",
      },

      // ─── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: "6px",
        sm:      "4px",
        md:      "8px",
        lg:      "10px",
        xl:      "12px",
        "2xl":   "16px",
        "3xl":   "20px",
      },

      // ─── Animation ───────────────────────────────────────────────────────
      keyframes: {
        // Pulse for live indicators
        "live-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.35" },
        },
        // Consensus gauge fill
        "gauge-fill": {
          from: { "stroke-dashoffset": "251" },
          to:   { "stroke-dashoffset": "var(--gauge-offset)" },
        },
        // Probability bar fill
        "bar-fill": {
          from: { width: "0%" },
          to:   { width: "var(--bar-width)" },
        },
        // Fade in up (page transitions, cards)
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        // Fade in
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        // Slide in from left (sidebar)
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to:   { transform: "translateX(0)", opacity: "1" },
        },
        // Trading panel slide
        "slide-in-right": {
          from: { transform: "translateX(32px)", opacity: "0" },
          to:   { transform: "translateX(0)", opacity: "1" },
        },
        // Number counter
        "count-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to:   { transform: "translateY(0)", opacity: "1" },
        },
        // Shimmer loading
        shimmer: {
          "0%":   { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        // Ticker scroll
        "ticker-scroll": {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "live-pulse":     "live-pulse 1.8s ease-in-out infinite",
        "gauge-fill":     "gauge-fill 1s cubic-bezier(.4,0,.2,1) forwards",
        "bar-fill":       "bar-fill 0.6s cubic-bezier(.4,0,.2,1) forwards",
        "fade-in-up":     "fade-in-up 0.3s ease-out",
        "fade-in":        "fade-in 0.2s ease-out",
        "slide-in-left":  "slide-in-left 0.25s cubic-bezier(.4,0,.2,1)",
        "slide-in-right": "slide-in-right 0.25s cubic-bezier(.4,0,.2,1)",
        "count-up":       "count-up 0.4s ease-out",
        shimmer:          "shimmer 1.8s linear infinite",
        "ticker-scroll":  "ticker-scroll 30s linear infinite",
      },

      // ─── Box Shadow ──────────────────────────────────────────────────────
      boxShadow: {
        "surface": "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--probex-border)",
        "surface-lg": "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px var(--probex-border)",
        "cyan-glow": "0 0 20px rgba(0,212,255,0.15)",
        "cyan-glow-sm": "0 0 10px rgba(0,212,255,0.1)",
        "purple-glow": "0 0 20px rgba(109,94,247,0.15)",
        "trading-panel": "0 0 40px rgba(0,0,0,0.6)",
      },

      // ─── Backdrop Blur ───────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
      },

      // ─── Z-Index Scale ───────────────────────────────────────────────────
      zIndex: {
        sidebar:         "40",
        topnav:          "50",
        modal:           "60",
        toast:           "70",
        tooltip:         "80",
      },

      // ─── Screen Breakpoints ──────────────────────────────────────────────
      screens: {
        sm:    "640px",
        md:    "768px",
        lg:    "1024px",
        xl:    "1280px",
        "2xl": "1440px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [],
};

export default config;
