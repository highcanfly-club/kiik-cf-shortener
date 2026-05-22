/*!
=========================================================
* © 2022-2026 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
*/
/** @type {import('tailwindcss').Config} */
/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  safelist: [{ pattern: /^font-neutra-/ }],
  //safelist: (process.env.NODE_ENV !== 'development') ? [] : [{ pattern: /.*/ }], // not usefull with vite
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        "neutra-bold": ["NeutrafaceText-Bold"],
        "neutra-boldsc": ["NeutrafaceText-BoldSC"],
        "neutra-boldalt": ["NeutrafaceText-BoldAlt"],
        "neutra-book": ["NeutrafaceText-Book"],
        "neutra-booknoambiguity": ["NeutrafaceText-BookNoAmbiguity"],
        "neutra-booksc": ["NeutrafaceText-BookSC"],
        "neutra-bookitalic": ["NeutrafaceText-BookItalic"],
        "neutra-demi": ["NeutrafaceText-Demi"],
        "neutra-demisc": ["NeutrafaceText-DemiSC"],
        "neutra-demiitalic": ["NeutrafaceText-DemiItalic"],
        "neutra-light": ["NeutrafaceText-Light"],
        "neutra-lightsc": ["NeutrafaceText-LightSC"],
        "neutra-lightitalic": ["NeutrafaceText-LightItalic"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
