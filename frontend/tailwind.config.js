/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  safelist: [
    // Colors for dynamic classes
    {
      pattern: /bg-(emerald|blue|purple|pink|orange|red|yellow)-(400|500|600)/,
    },
    {
      pattern: /text-(emerald|blue|purple|pink|orange|red|yellow)-(400|500|600)/,
    },
    {
      pattern: /border-(emerald|blue|purple|pink|orange|red|yellow)-(400|500|600)/,
    },
    {
      pattern: /shadow-(emerald|blue|purple|pink|orange|red|yellow)-(400|500|600)/,
    },
  ],
}