/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0d0f15',
        panel: '#141722',
        card: '#1b1f2d',
        cardHover: '#23283a',
        cardActive: '#2a3045',
        borderSubtle: '#242838',
        borderMedium: '#343b52',
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          glow: 'rgba(245, 158, 11, 0.2)',
        },
        primary: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.2)',
        },
        success: {
          DEFAULT: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
        },
        danger: {
          DEFAULT: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
        },
      },
    },
  },
  plugins: [],
}
