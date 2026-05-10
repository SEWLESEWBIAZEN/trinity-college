// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        source:   ["var(--font-source)", "Helvetica Neue", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#1a2744",
          mid:     "#243560",
          light:   "#3a5080",
        },
        gold: {
          DEFAULT: "#c9993a",
          light:   "#e8be72",
          dark:    "#b8882e",
        },
        cream: {
          DEFAULT: "#faf8f3",
          dark:    "#f0ece3",
        },
      },
      boxShadow: {
        card: "0 2px 12px rgba(26,39,68,.08), 0 1px 3px rgba(26,39,68,.06)",
        lg:   "0 8px 40px rgba(26,39,68,.14)",
      },
      borderRadius: {
        xl:  "16px",
        "2xl": "28px",
      },
    },
  },
  plugins: [],
};

export default config;
