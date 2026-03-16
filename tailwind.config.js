/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Brand (lime-verde) ── */
        brand: {
          50:  '#F4FAD6',
          100: '#E8F5AC',
          200: '#D2EA70',
          400: '#A2C420',
          500: '#8DB600',
          600: '#7A9E00',
          700: '#628000',
          800: '#4A6000',
        },

        /*
         * ── Sobreescribe "orange" con lima ──────────────────────────────────
         * Todos los bg-orange-*, text-orange-*, border-orange-*, etc.
         * del proyecto heredan automáticamente la nueva paleta.
         */
        orange: {
          50:  '#F4FAD6',
          100: '#E8F5AC',
          200: '#D2EA70',
          300: '#B6D940',
          400: '#A2C420',
          500: '#8DB600',   // ← color principal (botones, hero, badges)
          600: '#7A9E00',   // ← hover
          700: '#628000',
          800: '#4A6000',
          900: '#324000',
        },

        /* ── Grape / Púrpura (acento secundario, footer) ── */
        grape: {
          50:  '#F5ECFF',
          100: '#EAD8FF',
          200: '#D4B2FF',
          300: '#B986E0',
          400: '#9D5FCE',
          500: '#7040A0',
          600: '#5C3288',
          700: '#4A2878',
          800: '#381E60',
          900: '#271448',
        },
      },

      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },

      boxShadow: {
        card:       '0 2px 16px rgba(0,0,0,0.07)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.13)',
      },
    },
  },
  plugins: [],
}
