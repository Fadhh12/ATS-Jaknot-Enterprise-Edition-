import type { Config } from "tailwindcss";

// Enterprise ATS palette — see docs/UI-Redesign-Notes.md for the full token rationale.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: "#E8F1F5",
        surface: "#FFFFFF",
        "surface-alt": "#F4F7F9",
        border: "#D9E2E8",
        "text-primary": "#1C2B39",
        "text-secondary": "#64748B",
        "text-muted": "#94A3B8",
        primary: { DEFAULT: "#1B365D", hover: "#152C4C" },
        accent: { DEFAULT: "#FF6B35", hover: "#E85A25", soft: "#FFF0EA" },
        success: { DEFAULT: "#16A34A", soft: "#ECFDF3" },
        warning: { DEFAULT: "#F59E0B", soft: "#FFF7E8" },
        error: { DEFAULT: "#DC2626" },
        info: { DEFAULT: "#2563EB", soft: "#EFF6FF" },
        locked: "#A7B0B8",
        "brand-blue": "#4A90D2",
      },
      borderRadius: {
        sm: "8px",
        control: "12px",
        card: "16px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.08)",
        raised: "0 12px 34px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
