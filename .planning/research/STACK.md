# Stack Research

**Domain:** Premium, accessible, static-hosted 3D marketing website (SvelteKit + Threlte → GitHub Pages) with a persistent Premium-WebGL ⇄ Accessible-no-WebGL mode toggle
**Researched:** 2026-07-04
**Confidence:** HIGH (all versions verified against the npm registry today; the one judgment call — the exact `three` pin — is flagged MEDIUM below)

---

## TL;DR (the load-bearing decisions)

1. **Threlte v8** is the current line (`@threlte/core@8.5.16`, `@threlte/extras@9.21.0`). It is Svelte-5/runes-native. Do **not** use v7 (Svelte 4).
2. **Pin `three` to an EXACT version** — `three@0.175.0` — and pin `@types/three` to the **same minor** (`0.175.x`). `three` has **no semver stability**; every `0.x` minor can break Threlte and its transitive deps. This is the single most common breakage point on this stack. (Details + rationale below.)
3. **`@sveltejs/adapter-static@3.0.10`** with `prerender = true`, correct **`paths.base`**, **`trailingSlash: 'always'`**, and a **`.nojekyll`** file. These four together are what make GitHub Pages under a repo subpath actually work.
4. **Zero-WebGL Accessible mode = dynamic `import()`** of every Threlte component. Static top-level imports would pull `three` into the shared bundle and defeat the whole promise. Vite code-splits dynamic imports into separate chunks the Accessible path never requests.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 24.x (installed) | Runtime/toolchain | LTS-class, already on the box; pin via `.nvmrc` + `engines` |
| pnpm | 11.x (installed) | Package manager | Fast, strict, `auto-install-peers` on by default (helps the `three` peer resolve) |
| SvelteKit | 2.69.1 (`^2`) | App framework / router / SSG | Current stable; peer-compatible with Svelte 5 and Vite 6/7/8 |
| Svelte | 5.56.4 (`^5`) | UI/reactivity (runes) | Required by Threlte v8; runes (`$state`, `$derived`, `$effect`) drive the mode toggle + reactive scenes |
| Vite | 7.x (`^7`) | Bundler/dev server | Threlte v8 is dev-tested against Vite 7; SvelteKit 2.69 also accepts Vite 8, but 7 is the conservative, proven pairing (see What NOT to Use) |
| `@sveltejs/adapter-static` | 3.0.10 | Static site generation | The **only** adapter that produces the fully static output GitHub Pages needs |
| `@threlte/core` | 8.5.16 | Declarative Three.js in Svelte | Svelte-native `<Canvas>`/`<T>` components; SSR-safe patterns; far less boilerplate than raw Three.js |
| `@threlte/extras` | 9.21.0 | GLTF/Draco loaders, controls, helpers | Provides `useGltf`, `useDraco`, `OrbitControls`, `<Environment>`, etc. — the practical building blocks for the Premium scenes |
| `three` | **0.175.0 (EXACT — no `^`)** | WebGL engine under Threlte | Threlte v8's dev-tested baseline; exact-pinning avoids the no-semver breakage (see Version Compatibility) |
| TypeScript | 5.9.x | Types | Threlte v8 baseline; strong types for scene graph safety |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/three` | **0.175.x (match `three` minor)** | Three.js type defs | Always, in dev deps — must track the `three` minor exactly or types drift/break |
| `@threlte/extras` → `three-mesh-bvh` | `^0.9.1` (transitive) | Raycasting/BVH accel | Comes with extras; constrains how far you can bump `three` |
| `@threlte/extras` → `camera-controls` | `^3.1.2` (transitive) | Smooth camera controls | Comes with extras; used if you add orbit/dolly interactions |
| `gltf-transform` (CLI) or `gltfpack` | latest CLI, dev-only | Optimize + Draco-compress GLB at build/prep time | Run once per asset to shrink models; output committed to `static/models/` |
| `svelte-check` | latest | Type/a11y checks on `.svelte` | CI + local `pnpm check` |
| `@sveltejs/enhanced-img` (optional) | latest | Responsive optimized images | For Accessible-mode static/2D equivalents of the 3D scenes |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Unit/component tests (v4.1.9) | Use `vitest-browser-svelte` + Playwright provider for components that mount Threlte, since WebGL needs a real browser context; keep pure-logic tests (toggle store, WebGL-detection util) in the fast node/jsdom project |
| Playwright (`@playwright/test`) | E2E / cross-browser (v1.61.1) | Drives the real mode toggle, verifies Accessible mode ships **no** `three` chunk (assert via network/coverage), tests keyboard nav + focus |
| `@axe-core/playwright` | Automated a11y assertions (v4.12.1, bundles `axe-core@4.12.1`) | Run WCAG 2.2 AA rule sets against **both** modes on every page; this is a hard project requirement, not optional |
| ESLint + `eslint-plugin-svelte` | Lint | Standard SvelteKit setup |
| Prettier + `prettier-plugin-svelte` | Format | Standard |

---

## Installation

```bash
# Scaffold (choose SvelteKit minimal + TypeScript + Vitest + Playwright)
pnpm create svelte@latest .

# Static adapter
pnpm add -D @sveltejs/adapter-static

# Threlte v8 + EXACT three pin (note: no caret on three)
pnpm add @threlte/core@8 @threlte/extras@9 three@0.175.0

# Types must match the three minor
pnpm add -D @types/three@0.175

# Testing + accessibility
pnpm add -D vitest @playwright/test @axe-core/playwright
pnpm add -D vitest-browser-svelte           # component tests that mount WebGL
pnpm exec playwright install --with-deps

# Asset pipeline (dev-only CLI; pick one)
pnpm add -D @gltf-transform/cli              # or install gltfpack separately
```

**Pin the toolchain** in `package.json`:

```jsonc
{
  "packageManager": "pnpm@11",
  "engines": { "node": ">=24" }
}
```
Add a `.nvmrc` containing `24`.

**GitHub Pages critical config** — `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');
const REPO = '/diversityincludesdisability_two'; // repo subpath

export default {
  kit: {
    adapter: adapter(),                 // fully static; no fallback for a marketing site
    paths: { base: dev ? '' : REPO },   // serves under /<repo>/ on Pages
    prerender: { entries: ['*'] },
  },
};
```
- Root `+layout.ts`: `export const prerender = true;` and `export const trailingSlash = 'always';` (so `/about/` → `about/index.html`, which Pages serves without a server rewrite).
- Put an empty **`static/.nojekyll`** so Pages does not strip the `_app/` directory (Jekyll ignores leading-underscore dirs).
- **Every** internal link and asset URL must be prefixed with `base` from `$app/paths` — including the Draco decoder path and GLB URLs (`` `${base}/draco/` ``, `` `${base}/models/hero.glb` ``). Forgetting this is the #1 "works locally, 404s on Pages" failure.

---

## GLTF / Draco asset pipeline (static hosting)

1. **Prep (once per asset, dev machine):** run `gltf-transform optimize in.glb out.glb --compress draco` (or `gltfpack -i in.glb -o out.glb -cc`) to dedupe, resize textures, and Draco-compress geometry. Commit the optimized `.glb` to `static/models/`.
2. **Self-host the Draco decoder** — do **not** rely on the default CDN for a privacy-conscious, offline-resilient a11y site. Copy the decoder from `three/examples/jsm/libs/draco/` into `static/draco/` and point at it:
   ```svelte
   const dracoLoader = useDraco(`${base}/draco/`);
   const gltf = useGltf(`${base}/models/hero.glb`, { dracoLoader });
   ```
3. Because the whole 3D subtree is dynamically imported (below), the loaders, decoder, and model bytes are all in the Premium-only chunk path.

---

## Zero-WebGL Accessible mode — lazy-load / code-split strategy

The promise "Accessible mode ships zero Three.js bytes" is enforced by **module boundaries**, not runtime flags:

- **Never** statically `import HeroScene from '$lib/premium/HeroScene.svelte'` at the top of a route — that hoists `@threlte/core` + `three` into the shared entry bundle for **all** visitors.
- Instead, dynamically import behind the mode gate so Vite emits a **separate chunk**:
  ```svelte
  {#if mode === 'premium' && webglSupported}
    {#await import('$lib/premium/HeroScene.svelte') then { default: HeroScene }}
      <HeroScene />
    {/await}
  {:else}
    <HeroStatic />   <!-- 2D/static peer, no three -->
  {/if}
  ```
- Keep a tiny **WebGL-detection util** and the **toggle store** (Svelte 5 runes + `localStorage`) in the main bundle — they are Three-free.
- **Default to Accessible** when `matchMedia('(prefers-reduced-motion: reduce)')` matches or WebGL is unavailable, so the heavy chunk is never even requested for those users.
- Use `import type { ... } from 'three'` for any typing — `import type` is fully erased and never pulls runtime bytes.
- **Verify in CI:** a Playwright test loads the page in Accessible mode and asserts no request/coverage entry matches `three` or the `_app` 3D chunk. This turns the requirement into a regression gate.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Threlte (Svelte wrapper) | Raw `three` + manual `onMount` | Only if you need an obscure Three feature Threlte hasn't wrapped; costs SSR-safety + far more boilerplate |
| `three@0.175.0` exact | Newer `three` (0.180–0.185) | Acceptable **only** after confirming `@threlte/extras`' `three-mesh-bvh@0.9.x` + `camera-controls@3.x` still resolve/run against it; bump one minor at a time, exact-pinned, with the E2E suite green |
| Vite 7 | Vite 8.1.3 (latest) | If you want the newest bundler and accept that Threlte v8 wasn't dev-tested against it; SvelteKit 2.69 does accept `vite@^8` |
| `adapter-static` | `adapter-static` with SPA `fallback` | Only if you later add non-prerenderable client routes; a pure marketing site should stay fully prerendered for SEO + a11y |
| Self-hosted Draco decoder | Default CDN decoder | Prototyping only; ship self-hosted for privacy, reliability, and offline resilience |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@sveltejs/adapter-auto` / `-node` / `-vercel` / `-cloudflare` | Produce server/edge output GitHub Pages cannot run — build "succeeds" then 404s or needs a runtime | `@sveltejs/adapter-static@3.0.10` |
| Threlte v7 (`@threlte/core@7`) | Svelte 4 only; no runes; being phased out | Threlte v8 (`@threlte/core@8`) |
| `three` with a caret range (`^0.175`) | `three` has **no semver** — a "patch/minor" bump routinely breaks Threlte and `three-mesh-bvh`. `pnpm update` could silently break the build | Exact pin `three@0.175.0`, bump deliberately |
| `@types/three` not matched to `three` | Type errors / phantom API mismatches when the def minor drifts from the runtime minor | Pin `@types/three@0.175.x` to the same minor |
| SSR/prerender-time WebGL instantiation | `three`'s renderer touches `window`/`document`; instantiating it during prerender crashes the build | Mount scenes browser-side only (dynamic `import()` inside `{#if}` / `onMount`); Threlte's `<Canvas>` already guards context creation |
| Global `export const ssr = false` (SPA mode) | Kills prerendering → hurts SEO **and** the guaranteed-accessible HTML that must exist even if JS fails | Keep `prerender = true`; gate only the 3D subtree client-side |
| Static top-level import of Threlte components | Bundles `three` into the shared entry → Accessible mode downloads WebGL bytes anyway | Dynamic `import()` so Vite code-splits it into a Premium-only chunk |
| Omitting `.nojekyll` | Pages' Jekyll strips the `_app/` dir → all JS/CSS assets 404 | Empty `static/.nojekyll` |
| React Three Fiber / `drei` / `@react-three/*` | Wrong framework (React), irrelevant to a Svelte codebase | Threlte + `@threlte/extras` |

---

## Stack Patterns by Variant

**If deploying via GitHub Actions (recommended):**
- Use `actions/upload-pages-artifact` + `actions/deploy-pages`; `.nojekyll` is still cheap insurance, keep it.
- Set `paths.base` from the repo name (or `process.env.BASE_PATH`) so previews and prod agree.

**If `pnpm` strictness complains about the `three` peer:**
- pnpm 11 has `auto-install-peers=true` by default, which usually resolves it. If a hoist issue appears, add `.npmrc` with `public-hoist-pattern[]=*three*` rather than `shamefully-hoist=true` (keep hoisting narrow).

**If Premium scenes get heavy:**
- Split per-section scenes into their own dynamic imports so each 3D section is its own chunk, loaded on scroll/interaction — the Accessible path still requests none of them.

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@threlte/core@8.5.16` | `svelte >=5`, `three >=0.160` | **Dev-tested against `three@0.175.0`, `svelte@5.53`, `vite@7.1`, `vitest@4.1`** — mirror this baseline |
| `@threlte/extras@9.21.0` | `@threlte/core@8.5.16` (exact dep), `three >=0.160` | Pulls `three-mesh-bvh@^0.9.1` + `camera-controls@^3.1.2`; these transitively cap how far `three` can safely bump |
| `three@0.175.0` | `@types/three@0.175.x` | **No semver** — pin exact; keep types on the same minor |
| `@sveltejs/kit@2.69.1` | `svelte ^5`, `vite ^5 \|\| ^6 \|\| ^7 \|\| ^8` | Vite 7 recommended (matches Threlte's tested toolchain); Vite 8 allowed |
| `@sveltejs/adapter-static@3.0.10` | `@sveltejs/kit ^2` | The static adapter for the whole SvelteKit 2 line |
| `@axe-core/playwright@4.12.1` | `axe-core@~4.12.1`, `@playwright/test@1.61.1` | Version parity with bundled `axe-core`; WCAG 2.2 rule sets available |
| `vitest@4.1.9` | `vite@7`, `vitest-browser-svelte` | Use the browser provider (Playwright) for tests that mount WebGL |

---

## Sources

- npm registry `@threlte/core/latest` → v8.5.16, peers `svelte >=5`, `three >=0.160`, dev-tested `three@0.175.0` / `svelte@5.53` / `vite@7.1` / `vitest@4.1` — HIGH
- npm registry `@threlte/extras/latest` → v9.21.0, dep `@threlte/core@8.5.16`, `three-mesh-bvh@^0.9.1`, `camera-controls@^3.1.2` — HIGH
- npm registry `three/latest` (0.185.1) and `@types/three/latest` (0.185.0) — HIGH (informs the "latest ≠ what to pin" call)
- npm registry `@sveltejs/kit/latest` (2.69.1), `@sveltejs/adapter-static/latest` (3.0.10), `svelte/latest` (5.56.4), `vite/latest` (8.1.3) — HIGH
- npm registry `vitest/latest` (4.1.9), `@playwright/test/latest` (1.61.1), `@axe-core/playwright/latest` (4.12.1 → axe-core 4.12.1) — HIGH
- SvelteKit docs, "Static site generation / adapter-static" (svelte.dev/docs/kit/adapter-static) — `paths.base`, `trailingSlash`, `.nojekyll` guidance — HIGH
- Threlte docs, installation + `useGltf`/`useDraco` reference (threlte.xyz) — Draco decoder self-hosting for static sites; no pinned `three` version stated on the install page (hence the exact-pin recommendation is our judgment) — MEDIUM on the exact `three` pin, HIGH on the mechanism

---
*Stack research for: SvelteKit + Threlte static 3D site with dual Premium/Accessible modes on GitHub Pages*
*Researched: 2026-07-04*
