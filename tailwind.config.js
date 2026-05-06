/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#00E5FF',        // cyan neón del logo
        'accent-dim': '#00B8CC',  // versión más oscura para hover
        surface: '#000000',       // fondo principal (negro puro)
        'surface-2': '#161616',   // cards y secciones
        'surface-3': '#1f1f1f',   // hover states
        'text-primary': '#FFFFFF',
        'text-secondary': '#9ca3af',
        'text-muted': '#4b5563',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [],
}
