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
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
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