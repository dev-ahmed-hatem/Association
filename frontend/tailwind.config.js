/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
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
        calypso: {
          DEFAULT: "#0E6B81",
          50: "#ebfffe",
          100: "#cbfffe",
          200: "#9efdff",
          300: "#5cf9ff",
          400: "#12eafe",
          500: "#00cce4",
          600: "#00a2bf",
          700: "#04819a",
          800: "#0e6b81",
          900: "#105569",
          950: "#033849",
        },
        shark: {
          DEFAULT: "#707987",
          50: "#f7f8f8",
          100: "#edeef1",
          200: "#d8dbdf",
          300: "#b6bbc3",
          400: "#8e96a2",
          500: "#707987",
          600: "#5a616f",
          700: "#494e5b",
          800: "#3f444d",
          900: "#383b42",
          950: "#25272c",
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
