/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0fe',
          100: '#c5d8fd',
          200: '#9cb9fb',
          300: '#7399f8',
          400: '#4d7cf5',
          500: '#1a73e8',
          600: '#1557cc',
          700: '#1044b0',
          800: '#0b3494',
          900: '#062478',
        },
        accent: {
          500: '#ff6b35',
          600: '#e85520',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
