## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: eslint, prettier, vitest, playwright

---

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Diversity Includes Disability — Premium Website (v2)**

A modern, premium marketing website for **Diversity Includes Disability (DID)**, the
intersectional disability-equity venture founded by **Eman Rimawi** (trainings & facilitation,
disability consulting, modeling for representation, speaking & panels). The site ships with a
persistent **in-page mode toggle** that swaps between a **full-3D "Premium" experience** (nearly
every section rendered as an interactive WebGL scene, maximum visual impact) and a **fully
WCAG-accessible "Accessible" experience** (no WebGL, static/2D equivalents, high contrast, low
motion). Built with SvelteKit + Threlte, deployed as a static site to GitHub Pages. It is a
rebuild/replacement for the current Wix site at diversityincludesdisability.org.

**Core Value:** **Every visitor gets a first-class experience of DID's work — the toggle guarantees that the
premium 3D showcase never comes at the cost of accessibility, and the accessible mode is a
genuine peer, not a degraded fallback.** If everything else fails, the mode toggle + accessible
mode must work, because an inaccessible disability-equity site is a contradiction.

### Constraints

- **Tech stack**: SvelteKit + Threlte (Svelte wrapper over Three.js) + `@sveltejs/adapter-static` —
  because the deploy target is static GitHub Pages and 3D is a hard requirement.
- **Deployment**: GitHub Pages, repo `wolfwdavid/diversityincludesdisability_two`. Requires correct
  `paths.base` for the repo subpath and a `.nojekyll` file so `_app/` assets serve.
- **Accessibility**: WCAG 2.2 AA minimum across BOTH modes; Accessible mode targets AAA where
  feasible. Non-negotiable given the org's mission.
- **Performance**: 3D must be lazy-loaded/code-split; Accessible mode must ship zero WebGL bytes.
  Premium mode must degrade gracefully on low-end GPUs / no-WebGL browsers.
- **Security**: no credentials/PII in the repo (plaintext creds exist in the org's Notion source —
  excluded by design).
- **Tooling**: Node 24, pnpm 11 available locally. Windows dev environment (Git Bash + PowerShell).
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## TL;DR (the load-bearing decisions)
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
## Installation
# Scaffold (choose SvelteKit minimal + TypeScript + Vitest + Playwright)
# Static adapter
# Threlte v8 + EXACT three pin (note: no caret on three)
# Types must match the three minor
# Testing + accessibility
# Asset pipeline (dev-only CLI; pick one)
- Root `+layout.ts`: `export const prerender = true;` and `export const trailingSlash = 'always';` (so `/about/` → `about/index.html`, which Pages serves without a server rewrite).
- Put an empty **`static/.nojekyll`** so Pages does not strip the `_app/` directory (Jekyll ignores leading-underscore dirs).
- **Every** internal link and asset URL must be prefixed with `base` from `$app/paths` — including the Draco decoder path and GLB URLs (`` `${base}/draco/` ``, `` `${base}/models/hero.glb` ``). Forgetting this is the #1 "works locally, 404s on Pages" failure.
## GLTF / Draco asset pipeline (static hosting)
## Zero-WebGL Accessible mode — lazy-load / code-split strategy
- **Never** statically `import HeroScene from '$lib/premium/HeroScene.svelte'` at the top of a route — that hoists `@threlte/core` + `three` into the shared entry bundle for **all** visitors.
- Instead, dynamically import behind the mode gate so Vite emits a **separate chunk**:
- Keep a tiny **WebGL-detection util** and the **toggle store** (Svelte 5 runes + `localStorage`) in the main bundle — they are Three-free.
- **Default to Accessible** when `matchMedia('(prefers-reduced-motion: reduce)')` matches or WebGL is unavailable, so the heavy chunk is never even requested for those users.
- Use `import type { ... } from 'three'` for any typing — `import type` is fully erased and never pulls runtime bytes.
- **Verify in CI:** a Playwright test loads the page in Accessible mode and asserts no request/coverage entry matches `three` or the `_app` 3D chunk. This turns the requirement into a regression gate.
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Threlte (Svelte wrapper) | Raw `three` + manual `onMount` | Only if you need an obscure Three feature Threlte hasn't wrapped; costs SSR-safety + far more boilerplate |
| `three@0.175.0` exact | Newer `three` (0.180–0.185) | Acceptable **only** after confirming `@threlte/extras`' `three-mesh-bvh@0.9.x` + `camera-controls@3.x` still resolve/run against it; bump one minor at a time, exact-pinned, with the E2E suite green |
| Vite 7 | Vite 8.1.3 (latest) | If you want the newest bundler and accept that Threlte v8 wasn't dev-tested against it; SvelteKit 2.69 does accept `vite@^8` |
| `adapter-static` | `adapter-static` with SPA `fallback` | Only if you later add non-prerenderable client routes; a pure marketing site should stay fully prerendered for SEO + a11y |
| Self-hosted Draco decoder | Default CDN decoder | Prototyping only; ship self-hosted for privacy, reliability, and offline resilience |
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
## Stack Patterns by Variant
- Use `actions/upload-pages-artifact` + `actions/deploy-pages`; `.nojekyll` is still cheap insurance, keep it.
- Set `paths.base` from the repo name (or `process.env.BASE_PATH`) so previews and prod agree.
- pnpm 11 has `auto-install-peers=true` by default, which usually resolves it. If a hoist issue appears, add `.npmrc` with `public-hoist-pattern[]=*three*` rather than `shamefully-hoist=true` (keep hoisting narrow).
- Split per-section scenes into their own dynamic imports so each 3D section is its own chunk, loaded on scroll/interaction — the Accessible path still requests none of them.
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
## Sources
- npm registry `@threlte/core/latest` → v8.5.16, peers `svelte >=5`, `three >=0.160`, dev-tested `three@0.175.0` / `svelte@5.53` / `vite@7.1` / `vitest@4.1` — HIGH
- npm registry `@threlte/extras/latest` → v9.21.0, dep `@threlte/core@8.5.16`, `three-mesh-bvh@^0.9.1`, `camera-controls@^3.1.2` — HIGH
- npm registry `three/latest` (0.185.1) and `@types/three/latest` (0.185.0) — HIGH (informs the "latest ≠ what to pin" call)
- npm registry `@sveltejs/kit/latest` (2.69.1), `@sveltejs/adapter-static/latest` (3.0.10), `svelte/latest` (5.56.4), `vite/latest` (8.1.3) — HIGH
- npm registry `vitest/latest` (4.1.9), `@playwright/test/latest` (1.61.1), `@axe-core/playwright/latest` (4.12.1 → axe-core 4.12.1) — HIGH
- SvelteKit docs, "Static site generation / adapter-static" (svelte.dev/docs/kit/adapter-static) — `paths.base`, `trailingSlash`, `.nojekyll` guidance — HIGH
- Threlte docs, installation + `useGltf`/`useDraco` reference (threlte.xyz) — Draco decoder self-hosting for static sites; no pinned `three` version stated on the install page (hence the exact-pin recommendation is our judgment) — MEDIUM on the exact `three` pin, HIGH on the mechanism
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
