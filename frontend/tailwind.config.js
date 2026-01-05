/** @type {import('tailwindcss').Config} */
module.exports = {
  // Paths to all files using Tailwind classes
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  
  presets: [require("nativewind/preset")],
  
  theme: {
    extend: {
      colors: {
        primary: '#090302',          // main brand color
        secondary: '#151312',        // secondary brand/background
        light: {
          100: '#63B995',            // subtle text / icons
          200: '#7D98A1',            // medium text
          300: '#C0E8F9',            // highlights / accents
        },
        dark: {
          100: '#393E41',            // dark gray / cards
          200: '#272a2b',            // darker gray / background
        },
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
      }
    },
  },
  
  plugins: [],
};
