/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7ff',
          100: '#e8edff',
          200: '#d3dbff',
          300: '#b1bfff',
          400: '#7c93ff',
          500: '#536cf5',
          600: '#3a4de0',
          700: '#313fbc',
          800: '#2c3799',
          900: '#283178',
        },
      },
      boxShadow: {
        card: '0 10px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}

