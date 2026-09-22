import type { Config } from "tailwindcss";

// Workday-inspired palette (see docs/ATS-Jaknot-Master-Documentation.md, section 4.1)
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "navy": "#1B365D",
        "navy-dark": "#132A47",
        "accent-orange": "#FF6B35",
        "cloud-blue": "#E8F1F5",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
