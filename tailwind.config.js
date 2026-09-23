/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8ff',
          100: '#dbeefe',
          500: '#2f8fd6',
          600: '#1f6fae',
          700: '#1a5686',
          900: '#123a5c'
        }
      }
    }
  },
  plugins: []
};
