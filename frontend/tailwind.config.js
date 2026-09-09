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
        brand: {
          navy: '#0F2942',     // Primary (Sales & Cold)
          orange: '#D95400',   // Secondary (Action & Urgency)
          slate: '#F8FAFC',    // Background / Neutrals
        },
        cool: {
          50: '#F8FAFC',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0F2942',
          700: '#0a2136',
          800: '#071828',
          900: '#040e19',
        }
      }
    },
  },
  plugins: [],
}
