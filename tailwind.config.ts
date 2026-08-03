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
        ink: "#1E3A5F",
        muted: "#64748B",
        line: "#E7EAF0",
        panel: "#FFFFFF",
        soft: "#FAF8F5",
        accent: "#1E3A5F",
        teal: "#059669",
        coral: "#F97316",
        violet: "#7C3AED"
      },
      boxShadow: {
        premium: "0 8px 30px rgba(15, 23, 42, 0.08)",
        subtle: "0 4px 24px rgba(30, 58, 95, 0.06)"
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
