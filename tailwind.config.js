/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        vprom: {
          orange: '#FF6B00',
          dark: '#1a1a1a',
          gray: '#2d2d2d',
          light: '#f4f4f5',
        }
      }
    },
  },
  plugins: [],
}