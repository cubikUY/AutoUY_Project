import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema principal AutoUY — azul eléctrico (#136dec)
        primary: {
          DEFAULT: "#136dec",
          50: "#eef5ff",
          100: "#d9e8fe",
          200: "#bbd7fd",
          300: "#8bbdfc",
          400: "#5499f8",
          500: "#2f78f4",
          600: "#136dec",
          700: "#1151c8",
          800: "#1344a4",
          900: "#153c82",
          950: "#11274f",
        },
        // Gris corporativo
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Status
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
