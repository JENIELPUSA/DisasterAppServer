/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: { 
    extend: {
      colors: {
        // Maaari kang magdagdag ng custom colors dito kung kailangan
        primary: '#FC563C',
        secondary: '#172A39',
        background: '#E9E4E0',
      },
    },
  },
  plugins: [],
};