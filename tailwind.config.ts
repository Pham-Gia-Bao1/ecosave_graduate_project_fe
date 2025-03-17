import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssDebugScreens from "tailwindcss-debug-screens";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        primary: {
          DEFAULT: "#009883",
          dark: "#068887", // Fixed invalid hex code
          light: "#058170",
        },
        secondary: {
          DEFAULT: "#EDF4F6",
          dark: "#D8E1E4",
          light: "#F1FCFF",
        },
        error: {
          DEFAULT: "#DC2626",
          dark: "#B91C1C",
          light: "#F87171",
        },
        success: {
          DEFAULT: "#16A34A",
          dark: "#15803D",
          light: "#4ADE80",
        },
        border: "#e5e7eb",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        soft: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
        strong: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
      },
      animation: {
        "spin-ease": "spin-ease 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite",
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-down': 'fadeInDown 0.5s ease-in',
        'fade-in-up': 'fadeInUp 0.5s ease-in',
      },
      keyframes: {
        "spin-ease": {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" },
        },

        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },


    },
  },
  plugins: [tailwindcssAnimate, tailwindcssDebugScreens], // Fixed missing plugin
};

export default config;
