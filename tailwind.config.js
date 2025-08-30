import lineClamp from '@tailwindcss/line-clamp'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  safelist: [
    // Indigo
    "from-indigo-50","to-indigo-100","ring-indigo-200","text-indigo-700","bg-indigo-50","border-indigo-200",
    // Emerald
    "from-emerald-50","to-emerald-100","ring-emerald-200","text-emerald-700","bg-emerald-50","border-emerald-200",
    // Rose
    "from-rose-50","to-rose-100","ring-rose-200","text-rose-700","bg-rose-50","border-rose-200",
    // Violet
    "from-violet-50","to-violet-100","ring-violet-200","text-violet-700","bg-violet-50","border-violet-200",
    // Amber
    "from-amber-50","to-amber-100","ring-amber-200","text-amber-700","bg-amber-50","border-amber-200",
    // Sky
    "from-sky-50","to-sky-100","ring-sky-200","text-sky-700","bg-sky-50","border-sky-200",
    // Fuchsia
    "from-fuchsia-50","to-fuchsia-100","ring-fuchsia-200","text-fuchsia-700","bg-fuchsia-50","border-fuchsia-200",
    // Teal
    "from-teal-50","to-teal-100","ring-teal-200","text-teal-700","bg-teal-50","border-teal-200",
  ],
  plugins: [lineClamp],
}
