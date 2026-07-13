import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#667085",
        line: "#E7EAF0",
        panel: "#FFFFFF",
        soft: "#F6F8FB",
        accent: "#2563EB",
        teal: "#10B981",
        coral: "#F97316",
        violet: "#7C3AED"
      },
      boxShadow: {
        premium: "0 18px 60px rgba(23, 32, 51, 0.09)",
        subtle: "0 10px 35px rgba(23, 32, 51, 0.06)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      }
    }
  },
  plugins: []
};

export default config;
