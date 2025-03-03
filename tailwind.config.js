/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['NotoSans_400Regular'],
        noto: ['NotoSans_400Regular'],
        notoBold: ['NotoSans_700Bold'],
      },
    },
  },
  plugins: [],
};
