/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyan-primary': '#3aa0c9',
        'cyan-bright': '#5ec2e8',
        'purple-primary': '#8b6fd1',
        'purple-bright': '#a892e0',
        'indigo-primary': '#8b6fd1',
        'emerald-bright': '#34d399',
        'rose-bright': '#e6746f',
        cyan: {
          50: '#f3f9fc', 100: '#e2f2f8', 200: '#c1e3f0', 300: '#94cee6', 400: '#5ab4d8',
          500: '#34a3cf', 600: '#267da0', 700: '#1c5d77', 800: '#123d4e', 900: '#0a232d',
        },
        blue: {
          50: '#f3f9fc', 100: '#e2f2f8', 200: '#c1e3f0', 300: '#94cee6', 400: '#5ab4d8',
          500: '#34a3cf', 600: '#267da0', 700: '#1c5d77', 800: '#123d4e', 900: '#0a232d',
        },
        purple: {
          50: '#f5f3fc', 100: '#e9e3f7', 200: '#cfc3ee', 300: '#ad97e2', 400: '#9d84da',
          500: '#896ad6', 600: '#633ac8', 700: '#4f2da3', 800: '#3b227b', 900: '#2c195b',
        },
        indigo: {
          50: '#f5f3fc', 100: '#e9e3f7', 200: '#cfc3ee', 300: '#ad97e2', 400: '#9d84da',
          500: '#896ad6', 600: '#633ac8', 700: '#4f2da3', 800: '#3b227b', 900: '#2c195b',
        },
        rose: {
          50: '#fdf2f2', 100: '#fbe1e0', 200: '#f6bebc', 300: '#ef8f8a', 400: '#e6746f',
          500: '#e6504a', 600: '#d6251d', 700: '#a91d17', 800: '#7c1511', 900: '#580f0c',
        },
        emerald: {
          50: '#f2fdf8', 100: '#e0faf0', 200: '#bdf5de', 300: '#8cedc6', 400: '#4fd99e',
          500: '#1dba7a', 600: '#148557', 700: '#0e593a', 800: '#0a3e29', 900: '#06281a',
        },
        amber: {
          50: '#fdf9f2', 100: '#faf1e0', 200: '#f4e1bd', 300: '#edcb8d', 400: '#e3ae4f',
          500: '#dc9c27', 600: '#aa781b', 700: '#7e5914', 800: '#533a0d', 900: '#2f2108',
        },
        slate: {
          50: '#f6f7f8', 100: '#ebecef', 200: '#d4d6dd', 300: '#b5b8c4', 400: '#8d92a5',
          500: '#868b9e', 600: '#666c81', 700: '#41434f', 800: '#22242c', 900: '#14161c',
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
