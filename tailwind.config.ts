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
        ink: "#0F172A",
        muted: "#667085",
        line: "#E4E7EC",
        panel: "#FFFFFF",
        soft: "#F8FAFC",
        accent: "#1D4ED8",
        teal: "#0F766E",
        coral: "#EA580C",
        violet: "#6D28D9"
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
