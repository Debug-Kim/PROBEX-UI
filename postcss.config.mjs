/**
 * PostCSS configuration — required for Tailwind CSS v3.
 *
 * Tailwind is a PostCSS plugin: without this file neither Turbopack (dev) nor
 * webpack (`next build`) runs the Tailwind transform, so `@tailwind` directives
 * and `@apply` rules in `globals.css` are emitted unprocessed and every utility
 * class is inert. Restoring this file recovers the original styled UI.
 *
 * Dependencies already present in package.json: tailwindcss, autoprefixer, postcss.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
