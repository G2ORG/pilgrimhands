import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // OPC brand colors — deep crimson + gold
        crimson: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#9b1c2e",
          600: "#7f1424",
          700: "#63101c",
          900: "#3b0a11",
        },
        gold: {
          400: "#f4c542",
          500: "#e6b020",
          600: "#c99a12",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
