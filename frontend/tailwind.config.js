/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        olive: {
          50: '#f4f7f4',
          100: '#e6ede6',
          800: '#2D3A2D',
          900: '#1a241a',
        },
        gold: {
          400: '#D4AF37',
          500: '#C5A059',
          600: '#A68443',
        },
        charcoal: '#121212',
      },
    },
  },
  plugins: [],
};
