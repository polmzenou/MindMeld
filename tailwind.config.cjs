/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'light-bg': '#f9fafb',
        'light-card': '#ffffff',
        'light-text': '#111827',
        'light-accent': '#6366f1',
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-text': '#f1f5f9',
        'dark-accent': '#818cf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
