import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark-blue': '#3f59a9',
        'brand-light-blue': '#157ec3',
      },
      fontFamily: {
        'helvetica': ['Helvetica', 'Arial', 'sans-serif'],
        'maitree': ['Maitree', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
