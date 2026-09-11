import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        polar: {
          50: '#eef5ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#0b1f68',
          950: '#050057',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.12)',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { transform: 'translateX(-8%)', opacity: '0.7' },
          '50%': { transform: 'translateX(8%)', opacity: '1' },
        },
        pulseLogo: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.08)', opacity: '0.82' },
        },
        progressSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        aurora: 'aurora 3s ease-in-out infinite',
        pulseLogo: 'pulseLogo 1.8s ease-in-out infinite',
        progressSweep: 'progressSweep 1.2s ease-in-out infinite',
        fadeIn: 'fadeIn 220ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;