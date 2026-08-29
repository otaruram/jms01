/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        'bg-main': 'var(--bg-main)',
        'bg-card': 'var(--bg-card)',
        'bg-sidebar': 'var(--bg-sidebar)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
      }
    },
  },
  plugins: [],
  // Prevent Tailwind's preflight from breaking existing styles by disabling it temporarily,
  // or scoping it, but since we are mixing with modules, let's keep it on and see if it breaks anything.
  // Actually, preflight resets margins/paddings which might break the custom CSS.
  // Let's disable corePlugins.preflight just to be safe, since it's an existing app.
  corePlugins: {
    preflight: false,
  }
}
