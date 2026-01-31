import typography from "@tailwindcss/typography";
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  //  DARK MODE STRATEGY
  darkMode: "class", 

  theme: {
    extend: {
      // COLOR PALETTE 
      colors: {
        primary: {
          light: "#4F46E5", 
          dark: "#6366F1",  
        },
        background: {
          light: "#F3F4F6", 
          dark: "#0F172A",  
        },
        surface: {
          light: "#FFFFFF", 
          dark: "#1E293B",  
        },
        text: {
          light: "#1F2937", 
          dark: "#F8FAFC",  
        },
      },
      
      // 🏃 ANIMATION 
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      
      // KEYFRAMES 
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" }, 
          "100%": { transform: "translateX(100%)" }, 
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        }
      },

      // TYPOGRAPHY
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },

  //  PLUGINS
  plugins: [
    typography, 
  ],
};