# src/lib/premium/ — the WebGL fence

ALL Threlte/three code lives inside this directory. The fence keeps the Accessible
bundle at ZERO WebGL bytes (PREM-03):

- **Nothing outside `src/lib/premium/` imports `$lib/premium/*`** — statically
  (ESLint `no-restricted-imports`) **or dynamically** (`no-restricted-syntax`
  `ImportExpression` selector; the core imports rule is blind to `import()`).
- **The SINGLE sanctioned crossing** is the dynamic-import entry gate in
  `src/routes/+layout.svelte` — `{#if browser && isPremium() && webglOk}` wrapping one
  `import('$lib/premium/PremiumLayer.svelte')` with a scoped
  `eslint-disable-next-line no-restricted-syntax`. Vite emits the whole premium graph
  as a separate lazy chunk; the accessible entry graph never references it.
- **Internal imports are RELATIVE** (`./state/motion.svelte`, `../state/tier`) — the
  fence patterns catch the `$lib/premium/*` alias from anywhere, including in here.
- **Budget gate:** the premium graph (incl. three) is size-gated by
  `scripts/check-premium-budget.mjs` (arrives in 05-04, CI-wired), which also proves
  the accessible entry/nodes graph stays WebGL-free at build level.

Allowed external imports inside the subtree: `three`, `@threlte/core`,
`@threlte/extras`, `$app/state`, `$app/paths`, `svelte` — no content/component
imports (D-16: the accessible DOM is untouched; the layer renders behind it).
