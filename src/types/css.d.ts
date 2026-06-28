// ─── Global CSS module declarations ────────────────────────────────────────
//
// Next.js ships ambient declarations for CSS Modules (`*.module.css`) in
// `next/types/global.d.ts`, but deliberately omits a declaration for plain
// global stylesheets (e.g. `import './globals.css'`). The TypeScript compiler
// normally tolerates this because it does not resolve side-effect-only imports
// — which is why `next build` / `tsc --noEmit` never report an error here.
//
// However, the VS Code TypeScript language service can surface a false-positive
// `Cannot find module './globals.css'` (TS2307) when its server state is stale
// or when `noUncheckedSideEffectImports` is in effect. Declaring the module
// ambient-side eliminates that editor warning permanently without affecting the
// build, bundling, or runtime behaviour.
declare module '*.css'
