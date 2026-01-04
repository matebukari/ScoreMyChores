/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#090302',
        secondary: '#151312',
        light: {
          100: '#A9B4C2',
          200: '#7D98A1',
          300: '#C0E8F9',
        },
        dark: {
          100: '#393E41',
          200: '#272a2b'
        }
      }
    },
  },
  plugins: [],
}