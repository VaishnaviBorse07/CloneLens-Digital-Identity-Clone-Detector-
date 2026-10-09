/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Manrope', 'Space Grotesk', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Legacy aliases (kept for backward compat)
        'cyan-primary':   '#06b6d4',
        'cyan-bright':    '#22d3ee',
        'purple-primary': '#8b5cf6',
        'purple-bright':  '#a78bfa',
        'indigo-primary': '#6366f1',
        'emerald-bright': '#34d399',
        'rose-bright':    '#f87171',
        // Standard Tailwind shades updated to match design
        cyan: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
          800: '#155e75', 900: '#164e63',
        },
        purple: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
          400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7c3aed',
          800: '#6d28d9', 900: '#4c1d95',
        },
        violet: {
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
        },
        rose: {
          50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
        },
        emerald: {
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
        },
        amber: {
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
        },
        slate: {
          700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#070810',
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
