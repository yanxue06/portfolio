/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F2ECDE',
        navy: '#0F1E3A',
        gold: '#C4A35C',
      },
      fontFamily: {
        sans: ['"Archivo Variable"', 'Archivo', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
