/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#020817',
        sidebarAccent: '#111827',
      },
    },
  },
  plugins: [],
};

