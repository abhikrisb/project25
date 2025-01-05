import type { Config } from "tailwindcss";

export default {
  darkMode: 'class', 
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: {
          DEFAULT: '#1a1a1a',
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#404040',
          400: '#525252',
          500: '#737373',
          600: '#999999',
          700: '#a6a6a6',
          800: '#d9d9d9',
          900: '#f2f2f2'
        }
      },
      transitionProperty: {
        'all': 'all',
      }
    },
  },
  plugins: [],
} satisfies Config;
