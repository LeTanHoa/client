/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        spotify: {
          black: '#121212',
          panel: '#181818',
          hover: '#282828',
          green: '#1db954',
          subtle: '#b3b3b3',
        },
      },
    },
  },
  plugins: [],
};
