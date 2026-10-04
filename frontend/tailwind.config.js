/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          app: '#222f30',
          sidebar: '#222f30',
          card: '#263536',
          elevated: '#304041',
          rust: '#263536',
        },
        line: {
          subtle: '#4d5757',
          strong: '#64706e',
        },
        ink: {
          primary: '#f7f7f5',
          secondary: '#b1bcb7',
          muted: '#a6b2ae',
        },
        accent: {
          coral: '#cef79e',
          'coral-soft': '#304041',
          green: '#cef79e',
          'green-soft': '#304041',
          teal: '#c9cbbe',
          amber: '#f7f7f5',
        },
      },
      fontFamily: {
        sans: ['Aspekta', 'Inter Tight', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: 'none',
        glow: 'none',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0%)' },
        },
      },
      animation: {
        scan: 'scan 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
