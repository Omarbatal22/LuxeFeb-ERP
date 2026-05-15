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
        primary: {
          50: "#f0f8ff",
          100: "#e0f0fe",
          200: "#bae0fd",
          300: "#7cc5fc",
          400: "#36a7f9",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
          800: "#0c4a6e",
          900: "#08334f",
          950: "#041d2e",
        },
        brand: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#eaddd7",
          300: "#e0c1b3",
          400: "#d3a28e",
          500: "#c78369",
          600: "#b97156",
          700: "#9b5e47",
          800: "#7c4c39",
          900: "#653e2f",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#ecfdf5",
          dark: "#065f46",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fef2f2",
          dark: "#991b1b",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fffbeb",
          dark: "#92400e",
        },
        info: {
          DEFAULT: "#0284c7",
          light: "#f0f9ff",
          dark: "#075985",
        }
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'sm': '0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;