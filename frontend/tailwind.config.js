/** @type {import('tailwindcss').Config} */
module.exports = {
  // Paths to all files using Tailwind classes
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  
  presets: [require("nativewind/preset")],

  // 1. Enable class-based dark mode (Essential for NativeWind)
  darkMode: "class", 
  
  theme: {
    extend: {
      colors: {
        // --- BRAND PALETTE ---
        primary: '#090302',          // Main brand color (Deep Black)
        secondary: '#151312',        // Secondary brand (Rich Black)
        light: {
          100: '#63B995',            // Brand Green (Buttons, Active Tabs, Icons)
          200: '#7D98A1',            // Slate Blue
          300: '#C0E8F9',            // Pale Blue Highlights
        },
        dark: {
          100: '#393E41',            // Dark Mode Card Background
          200: '#272a2b',            // Dark Mode Screen Background
        },

        // --- UI SEMANTICS ---
        
        // Backgrounds
        background: {
          DEFAULT: '#f8f9fa',        // Main Screen BG (Light)
          dark: '#151312',           // Main Screen BG (Dark)
          subtle: '#f9f9f9',         // Future/Disabled Card BG
          highlight: '#f0f9f4',      // Current User Highlight (RankList)
        },
        
        // Surfaces / Cards
        card: {
          DEFAULT: '#FFFFFF',        // Standard Card White
          dark: '#393E41',           // Standard Card Dark
        },

        // Borders
        border: {
          light: '#eeeeee',          // Standard light border
          subtle: '#f0f0f0',         // Very subtle divider
        },

        // Typography & Icons
        text: {
          main: '#333333',           // Standard Text
          secondary: '#666666',      // Subtitles
          muted: '#999999',          // Tertiary/Meta text
          dim: '#888888',            // Disabled/Future text
          inverted: '#FFFFFF',       // Text on dark backgrounds
        },

        // --- STATUS & ACTIONS ---

        // Action / Alerts
        danger: {
          DEFAULT: '#d32f2f',        // Error text / Logout text
          bright: '#FF5252',         // Delete/Trash Icon
          bg: '#ffebee',             // Error background / Logout button
        },
        info: {
          DEFAULT: '#2196F3',        // Blue accents (UserAvatar, Reset Button)
          dark: '#4A90E2',           // Lighter blue for dark mode
        },

        // Medals (Leaderboard)
        gold: '#FFD700',
        silver: '#C0C0C0',
        bronze: '#CD7F32',

        // Chore Status Badges
        status: {
          blue: {                    // "Doing Now"
            bg: '#E3F2FD',
            border: '#64B5F6',
            text: '#1565C0',
          },
          green: {                   // "Done by Others"
            bg: '#E8F5E9',
            border: '#81C784',
            text: '#2E7D32',
          },
          purple: {                  // "Done by Me"
            bg: '#F3E5F5',
            border: '#BA68C8',
            text: '#7B1FA2',
          },
          orange: {                  // "Working" (Others)
            bg: '#FFF3E0',
            border: '#FFB74D',
            text: '#E65100',
          }
        },
        
        // Navigation
        tab: {
          active: '#63B995',         // Matches light-100
          inactive: '#9CA3AF',       // Matches gray-400
          border: '#F3F4F6',         // Tab bar top border
        }
      },
      
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',               // Headers
      }
    },
  },
  
  plugins: [],
};