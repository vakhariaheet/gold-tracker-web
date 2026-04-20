/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0908',
        surface: '#111110',
        's2': '#181715',
        's3': '#1E1C1A',
        'surface-light': '#181715',
        gold: {
          DEFAULT: '#C29C44',
          light: '#E8D5A3',
          dim: '#261F0E',
          bright: '#D4AF37',
          dark: '#8C6E2C',
        },
        warm: '#EDE8DF',
        muted: '#7A6E62',
        faint: '#3D3830',
        emerge: '#4B8A65',
        'emerge-light': '#90C9A8',
        'emerge-bg': '#0D1F16',
        crimson: '#A05050',
        'crimson-light': '#D4908A',
        'crimson-bg': '#1F0D0D',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
