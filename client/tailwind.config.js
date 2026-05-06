/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        paper: '#f5efe6',
        ink: '#1f1b16',
        muted: '#6b6357',
        accent: '#c2410c',
      },
      boxShadow: {
        card: '0 1px 0 rgba(31,27,22,0.06), 0 8px 24px -12px rgba(31,27,22,0.18)',
        cardHover: '0 1px 0 rgba(31,27,22,0.08), 0 16px 32px -12px rgba(31,27,22,0.25)',
      },
    },
  },
  plugins: [],
};
