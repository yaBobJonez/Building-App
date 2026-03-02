/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Public Sans", "sans-serif"] },
      colors: {
        brand: { black: "#000000", white: "#FFFFFF", gray: "#C4C4C4" },
      },
    },
  },
  plugins: [],
};
