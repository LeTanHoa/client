/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zing: {
          // Background colors
          bg: '#0a0e27',
          'bg-secondary': '#12172b',
          'bg-tertiary': '#1a1f3a',
          'bg-panel': '#151d38',
          
          // Accent colors - Purple/Blue gradient
          primary: '#9d4edd',
          'primary-light': '#c77dff',
          secondary: '#5a189a',
          accent: '#3a86ff',
          
          // Text colors
          text: '#ffffff',
          'text-secondary': '#b0b0b0',
          'text-tertiary': '#888888',
          
          // Success/Action colors
          success: '#00d4ff',
          pink: '#ff006e',
          orange: '#ffa500',
        },
        spotify: {
          black: '#121212',
          panel: '#181818',
          hover: '#282828',
          green: '#1db954',
          subtle: '#b3b3b3',
        },
      },
      backgroundImage: {
        'zing-gradient': 'linear-gradient(135deg, #0a0e27 0%, #1a0f3a 50%, #0a0e27 100%)',
        'zing-accent': 'linear-gradient(135deg, #9d4edd 0%, #5a189a 100%)',
      },
    },
  },
  plugins: [],
};
