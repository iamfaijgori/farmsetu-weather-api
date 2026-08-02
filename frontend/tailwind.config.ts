import type { Config } from 'tailwindcss';

/**
 * Only the type roles need config — every colour in the dashboard is an
 * arbitrary value pulled straight from Figma, so the components work even
 * against a stock Tailwind install. Merge this into your existing config.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Display face — headings and stat values.
        heading: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Body / UI face.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
