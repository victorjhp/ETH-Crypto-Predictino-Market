/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        up: "#16a34a",
        down: "#dc2626",
        accent: "#6366f1",
      },
    },
  },
  plugins: [],
};
