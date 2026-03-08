/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF6B00',
        cream: '#FFF8F0',
        deepGreen: '#1A6B3A',
        warmGold: '#E8A020',
        textDark: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
