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
        ink: "#1A1A2E",
        muted: "#6B6B8A",
        line: "rgba(108, 99, 255, 0.12)",
        panel: "#FFFFFF",
        soft: "#F8F7FF",
        accent: "#6C63FF",
        teal: "#0D9488",
        coral: "#F59E0B",
        violet: "#6C63FF"
      },
      boxShadow: {
        premium: "0 8px 32px rgba(108, 99, 255, 0.15)",
        subtle: "0 2px 16px rgba(108, 99, 255, 0.08)"
      },
      borderRadius: {
        xl: "0.625rem",
        "2xl": "0.875rem"
      }
    }
  },
  plugins: []
};

export default config;
