/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        cream: '#f5f0e8',
        ink: '#1a1a2e',
        blush: '#e8c4c4',
        sage: '#a8c5a0',
        dusty: '#9b8ea8',
        paper: '#fdf6e3',
        aged: '#d4a96a',
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        flicker: 'flicker 0.15s infinite',
        'fade-in': 'fadeIn 0.6s ease forwards',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
        flicker: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.95' } },
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
}