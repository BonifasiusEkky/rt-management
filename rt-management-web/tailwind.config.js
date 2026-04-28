/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#111827', // Slate 900
        secondary: '#64748b', // Slate 500
        bg: '#FFFFFF',
        card: '#FFFFFF',
        border: '#F3F4F6', // Gray 100
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        '2xl': '0.75rem',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}

