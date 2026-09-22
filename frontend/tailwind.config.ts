import type { Config } from "tailwindcss";

// Workday-inspired palette (see docs/ATS-Jaknot-Master-Documentation.md, section 4.1)
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        "navy": "#1B365D",
        "navy-dark": "#132A47",
        "navy-light": "#2C4A76",
        "accent-orange": "#FF6B35",
        "accent-orange-dark": "#E85A2A",
        "cloud-blue": "#EEF3F7",
        "brand-blue": "#4A90D2",
        "brand-blue-light": "#8FC1F2",
      },
      borderRadius: {
        card: "10px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27, 54, 93, 0.06), 0 1px 1px rgba(27, 54, 93, 0.04)",
        "card-hover": "0 8px 20px -6px rgba(27, 54, 93, 0.18)",
        orange: "0 6px 16px -4px rgba(255, 107, 53, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
