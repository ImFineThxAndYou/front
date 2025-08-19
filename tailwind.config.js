/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        '53': 'repeat(53, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}

