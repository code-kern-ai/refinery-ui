const colors = require("tailwindcss/colors");
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./submodules/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /(bg)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(100|200|500)/,
      variants: ['hover']
    },
    { pattern: /(border)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray)-(400|800)/, },
    { pattern: /(text)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(700|800)/, },
    { pattern: /(bg)-(gray)-(700)/, },
    { pattern: /(fill)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray)-(100|900)/, },
    // patterns for submodules
    { pattern: /(border)-(gray)-(200|800)/, },
  ],
  theme: {
    colors: {
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.yellow,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
    },
    extend: {
      colors: {
        kernindigo: {
          DEFAULT: "#0C052E",
          dark: "#06023b",
          darker: "#4F46E5",
          "darker-1": "#312E81",
          light: "#EEF2FF",
          "dark-1": "#0000F5",
          "dark-2": "#4338CA",
        },
        kernpurple: {
          DEFAULT: "#ae28ae"
        },
      },
      fontFamily: {
        sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
        mono: ['DM Mono', ...defaultTheme.fontFamily.mono],
      },
    },
    screens: {
      "xs": "450px",
      ...defaultTheme.screens,
    }
  },
  plugins: [],
}