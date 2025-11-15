/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4A69FF',
        secondary: '#7D5FFF',
        'secondary-green': '#1DD1A1',
        'background-light': '#f5f6fa',
        'background-dark': '#111418',
        'text-light': '#2d3436',
        'text-dark': '#f5f6fa',
        'card-light': '#ffffff',
        'card-dark': '#1c2127',
        'border-light': '#dfe4ea',
        'border-dark': '#3b4754',
        'custom-blue': '#4A90E2',
        'custom-green': '#50E3C2',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

