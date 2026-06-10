/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde6ff",
          200: "#c3d1ff",
          300: "#9db1ff",
          400: "#7488fc",
          500: "#5562f5",
          600: "#4040ea",
          700: "#3530cf",
          800: "#2d2aa6",
          900: "#292884",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
