/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#050505',
        surface: {
          DEFAULT: '#111111',
          hover: '#1a1a1a',
          active: '#222222',
        },
        accent: {
          DEFAULT: '#00E5FF',
          muted: '#00B8CC',
          deep: '#007A8A',
        },
        txt: {
          1: '#FFFFFF',
          2: '#A3A3A3',
          3: '#525252',
        }
      },
      boxShadow: {
        '4xl': '32px',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scaleIn:   { '0%': { opacity: 0, transform: 'scale(0.92) translateY(12px)' }, '100%': { opacity: 1, transform: 'scale(1) translateY(0)' } },
        shimmer:   { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(200%)' } },
        pulseRing: { '0%, 100%': { opacity: 0.2, transform: 'scale(1)' }, '50%': { opacity: 0.5, transform: 'scale(1.05)' } },
        spin:      { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up':    'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':    'fadeIn 0.4s ease-out',
        'scale-in':   'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer':    'shimmer 2s infinite linear',
        'pulse-ring': 'pulseRing 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
