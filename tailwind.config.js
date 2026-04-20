/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0E21',
        surface: '#1D1E33',
        'surface-light': '#252640',
        gold: {
          DEFAULT: '#FFB300',
          light: '#FFD54F',
          dark: '#FF8F00',
        },
      },
    },
  },
  plugins: [],
}
