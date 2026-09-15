/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Architectural Luxury Design System Palette
        richblack: {
          DEFAULT: '#111111',
          primary: '#111111',
          deep: '#111111',
          dark: '#0A0A0A',
        },
        charcoal: {
          DEFAULT: '#292929', // Secondary
          text: '#111111',
          muted: '#292929',
          light: '#3D3D3D',
        },
        champagne: {
          DEFAULT: '#C8A96B', // Accent
          accent: '#C8A96B',
          soft: '#FAF7F0',
          subtle: '#F3ECE0',
          hover: '#B89758',
          glow: 'rgba(200, 169, 107, 0.25)',
        },
        warm: {
          DEFAULT: '#F7F6F2', // Main Background
          offwhite: '#F7F6F2',
          bg: '#F7F6F2',
        },
        pure: {
          DEFAULT: '#FFFFFF', // Cards & clean areas
          white: '#FFFFFF',
        },
        graphite: {
          DEFAULT: '#555555', // Body Text
          text: '#555555',
        },
        softgray: {
          DEFAULT: '#E2E0DB', // Borders
          border: '#E2E0DB',
        },
        // Backward-compatible semantic aliases mapped to the new palette
        emerald: {
          deep: '#111111',    // Mapped to Rich Black
          dark: '#181818',
          light: '#292929',
          900: '#111111',
        },
        mint: {
          DEFAULT: '#C8A96B',  // Mapped to Champagne
          fresh: '#C8A96B',
          soft: '#FAF7F0',
          light: '#F3ECE0',
          hover: '#B89758',
          glow: 'rgba(200, 169, 107, 0.25)',
        },
        sage: {
          gray: '#555555',     // Mapped to Graphite Gray (Body Text)
          border: '#E2E0DB',   // Mapped to Soft Gray (Borders)
          light: '#FAF7F0',
          muted: '#858585',    // Mapped to Cool Gray
        },
        brand: {
          navy: '#111111',     // Rich Black
          orange: '#C8A96B',   // Champagne
          slate: '#F7F6F2',    // Warm Off-White
          emerald: '#111111',
          mint: '#C8A96B',
        },
        cool: {
          DEFAULT: '#858585',  // Cool Gray (Muted Text)
          muted: '#858585',
          50: '#F7F6F2',
          100: '#FAF7F0',
          200: '#E2E0DB',
          300: '#D2CDBC',
          400: '#C8A96B',
          500: '#B89758',
          600: '#292929',
          700: '#1F1F1F',
          800: '#181818',
          900: '#111111',
        }
      }
    },
  },
  plugins: [],
}
