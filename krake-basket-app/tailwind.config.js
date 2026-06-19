/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Redefinimos 'orange' para que apunte a tu nuevo Cian Neón en toda la web
        orange: {
          500: '#00d2d4', // Un tono cian un poco más suave para bordes o texto secundario
          600: '#05fcfe', // ¡Tu color exacto! El cian neón brillante para Navbar y botones principales
          700: '#00c1c3', // Una variante un poco más oscura para el efecto hover (cuando pasas el mouse)
        },
      },
    },
  },
  plugins: [],
}