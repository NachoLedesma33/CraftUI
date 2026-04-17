/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'editor-base': { raw: '(min-width: 0px)' },
        'editor-sm': { raw: '(min-width: 640px)' },
        'editor-md': { raw: '(min-width: 768px)' },
        'editor-lg': { raw: '(min-width: 1024px)' },
        'editor-xl': { raw: '(min-width: 1280px)' },
      },
      colors: {
        editor: {
          canvas: '#f5f5f5',
          sidebar: '#ffffff',
          toolbar: '#fafafa',
          border: '#e5e7eb',
          accent: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
}