/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["ui-sans", "sans-serif"],
      },
      colors: {
        orange: {
          DEFAULT: "#FAAF40",
          50: "#fff8eb",
          100: "#fdeac8",
          200: "#fcd28b",
          300: "#faaf40",
          400: "#f99a26",
          500: "#f3760d",
          600: "#d75408",
          700: "#b2370b",
          800: "#912a0f",
          900: "#772410",
          950: "#440f04",
        },
        minsk: {
          DEFAULT: "#2c2e83",
          50: "#eef3ff",
          100: "#dfe9ff",
          200: "#c6d4ff",
          300: "#a3b8fe",
          400: "#7e91fb",
          500: "#606cf4",
          600: "#4242e9",
          700: "#3734ce",
          800: "#2e2da6",
          900: "#2c2e83",
          950: "#1a1a4c",
        },
        "fun-green": {
          DEFAULT: "#00ca4b",
          50: "#ecfff4",
          100: "#d3ffe6",
          200: "#aaffd0",
          300: "#69ffac",
          400: "#21ff81",
          500: "#00f25f",
          600: "#00ca4b",
          700: "#009e3e",
          800: "#007332",
          900: "#02652e",
          950: "#003917",
        },
        whisper: "#F0F0F5",
      },
    },
  },
  plugins: [
    function ({ addComponents, theme }) {
      addComponents({
        ".margin-container": {
          marginInline: "1rem",

          "@screen sm": {
            // maxWidth: "640px",
            marginInline: "2rem",
          },
          "@screen md": {
            // maxWidth: "768px",
            marginInline: "3rem",
          },
          "@screen lg": {
            // maxWidth: "1024",
            marginInline: "4rem",
          },
          "@screen xl": {
            // maxWidth: "1280px",
            marginInline: "5rem",
          },
          "@screen 2xl": {
            // maxWidth: "1536px",
            marginInline: "7rem",
          },
        },

        ".padding-container": {
          paddingInline: "1rem",

          "@screen sm": {
            paddingInline: "2rem",
          },
          "@screen md": {
            paddingInline: "3rem",
          },
          "@screen lg": {
            paddingInline: "4rem",
          },
          "@screen xl": {
            paddingInline: "5rem",
          },
          "@screen 2xl": {
            paddingInline: "7rem",
          },
        },
      });
    },
  ],
};
