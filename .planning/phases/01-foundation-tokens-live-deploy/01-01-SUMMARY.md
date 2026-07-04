---
phase: 01-foundation-tokens-live-deploy
plan: 01
subsystem: infra
tags: [sveltekit, adapter-static, pnpm, three, threlte, github-pages, vite, prerender]

# Dependency graph
requires: []
provides:
  - Buildable SvelteKit app on the locked, version-pinned stack (Svelte 5 / Vite 7 / TS 5.9)
  - adapter-static config producing a fully prerendered static bundle for a GitHub Pages subpath
  - Global prerender + trailingSlash 'always' so deep links resolve to route/index.html
  - static/.nojekyll for Pages _app/ asset serving
  - Exact three@0.175.0 pin enforced in the lockfile (package.json + pnpm-workspace.yaml overrides)
  - scripts/check-three-pin.mjs CI-runnable gate asserting the pin
affects: [02-tokens-contrast-gate-premium-guard, 03-pages-deploy-workflow-live, phase-4-sections, phase-5-premium-3d]

# Tech tracking
tech-stack:
  added:
    - "@sveltejs/adapter-static@3.0.10"
    - "three@0.175.0 (exact) + @types/three@0.175.0"
    - "@threlte/core@8.5.16, @threlte/extras@9.21.0"
    - "vite@^7 (pinned down from scaffold's vite@^8)"
    - "typescript@^5.9 (pinned down from scaffold's typescript@^6)"
    - "vitest@4.1.x, @playwright/test@1.61.x (scaffold addons)"
  patterns:
    - "adapter-static + paths.base from process.env.BASE_PATH for env-driven subpath"
    - "prerender=true + trailingSlash='always' + fallback:'404.html' for Pages deep-link resolution"
    - "Two-layer three pin: exact package.json version + overrides in pnpm-workspace.yaml"
    - "Lockfile assertion gate script (check-three-pin.mjs) as a CI-runnable pin guard"

key-files:
  created:
    - svelte.config.js
    - src/routes/+layout.ts
    - src/app.css
    - static/.nojekyll
    - scripts/check-three-pin.mjs
    - .nvmrc
    - .npmrc
    - pnpm-workspace.yaml
  modified:
    - package.json
    - vite.config.ts
    - src/routes/+layout.svelte

key-decisions:
  - "Created svelte.config.js manually: sv 0.16.1 embeds SvelteKit config in vite.config.ts and emits no svelte.config.js; reverted vite.config.ts to plain sveltekit() so config lives in svelte.config.js (plan-expected layout)"
  - "Added pnpm-workspace.yaml: pnpm 11.6 no longer reads pnpm.overrides/onlyBuiltDependencies from package.json — moved effective overrides there while keeping package.json pnpm.overrides for plan parity"
  - "Pinned vite@^7 and typescript@^5.9 to match the locked CLAUDE.md stack (scaffold defaulted to vite@8 / typescript@6)"

patterns-established:
  - "Env-driven base path (BASE_PATH) — never hard-code /diversityincludesdisability_two"
  - "Exact three pin enforced by both dependency spec and a lockfile gate script"

requirements-completed: [FOUND-01, FOUND-02, FOUND-03, FOUND-04]

# Metrics
duration: 35min
completed: 2026-07-04
---

# Phase 01 Plan 01: Scaffold, Stack & Static Config Summary

**SvelteKit scaffolded on the locked stack (Svelte 5 / Vite 7 / TS 5.9) with adapter-static producing a fully prerendered, base-aware, Jekyll-safe Pages bundle and an exact three@0.175.0 lockfile pin guarded by a CI gate.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-07-04T21:37Z (approx)
- **Completed:** 2026-07-04T22:12Z
- **Tasks:** 3
- **Files modified/created:** ~30 (scaffold + config)

## Accomplishments
- Scaffolded SvelteKit (minimal + TS) with eslint, prettier, vitest, and playwright addons on the exact locked stack; adapter-auto swapped for `@sveltejs/adapter-static@3.0.10`.
- Wired the static-deploy foundation: `adapter-static` (`fallback:'404.html'`, `strict:true`), `paths.base` from `BASE_PATH`, global `prerender=true` + `trailingSlash='always'`, and `static/.nojekyll`. `pnpm build` emits `build/{index.html,404.html,.nojekyll,_app/}` and `build/demo/index.html` with no `build/server/`.
- Enforced the exact `three@0.175.0` pin two ways (package.json exact version + `pnpm-workspace.yaml` override) — `pnpm why three` reports a single 0.175.0 — and added `scripts/check-three-pin.mjs`, a real lockfile gate that passes (`three pin OK: 0.175.0`) and would fail on any drift.

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold SvelteKit on the pinned stack + enforce three pin** - `997b9d1` (chore)
2. **Task 2: Configure adapter-static for the Pages subpath** - `1b83b62` (feat)
3. **Task 3: Write the three-pin lockfile gate (FOUND-04)** - `15e9e16` (feat)

**Plan metadata:** (docs commit — this SUMMARY + STATE/ROADMAP)

## Files Created/Modified
- `svelte.config.js` - adapter-static with `fallback:'404.html'`, `strict:true`, `paths.base = process.env.BASE_PATH ?? ''`
- `src/routes/+layout.ts` - `export const prerender = true; export const trailingSlash = 'always';`
- `src/app.css` - global base reset (extended with DID tokens in plan 02)
- `src/routes/+layout.svelte` - imports app.css + keeps base-safe bundled favicon; renders `{@render children()}`
- `static/.nojekyll` - empty; keeps Pages from stripping `_app/`
- `scripts/check-three-pin.mjs` - lockfile assertion gate for FOUND-04
- `package.json` - `packageManager pnpm@11.6.0`, `engines`, exact `three@0.175.0`, `@types/three@0.175.0`, threlte pins, `vite@^7`, `typescript@^5.9`, `pnpm.overrides.three`, `check:three-pin` script
- `pnpm-workspace.yaml` - effective `overrides.three: 0.175.0` + `onlyBuiltDependencies: [esbuild]` (pnpm 11.6 config home)
- `vite.config.ts` - reduced to `plugins: [sveltekit()]` (+ vitest projects); adapter/config moved to svelte.config.js
- `.nvmrc` (24), `.npmrc` (`public-hoist-pattern[]=*three*`)

## Decisions Made
- **svelte.config.js authored manually.** The current Svelte CLI (`sv` 0.16.1) minimal template embeds SvelteKit config inside `vite.config.ts` and ships no `svelte.config.js`. To match the plan's expected layout (and Task 1's `test -f svelte.config.js` gate), I created `svelte.config.js` with the adapter-static Pattern-1 config and reverted `vite.config.ts` to a plain `sveltekit()` call so configuration lives in one place.
- **pnpm-workspace.yaml added.** pnpm 11.6 (activated via the `packageManager` field + corepack) no longer reads the `pnpm` field from package.json (it warns and ignores `pnpm.overrides`). The effective `overrides.three: 0.175.0` and esbuild build approval were moved to `pnpm-workspace.yaml`; the `pnpm.overrides` block is kept in package.json for the plan's parity/documentation requirement.
- **vite@^7 / typescript@^5.9 pinned.** The scaffold defaulted to `vite@^8` and `typescript@^6`; both were pinned down to the CLAUDE.md-locked majors (Vite 7 is Threlte v8's dev-tested pairing).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created svelte.config.js absent from the newer scaffold**
- **Found during:** Task 1 → Task 2 (scaffold produced no svelte.config.js; `svelte-kit sync`/`prepare` failed resolving the removed adapter-auto referenced inside vite.config.ts)
- **Issue:** `sv` 0.16.1 embeds SvelteKit config in `vite.config.ts`; the plan and Task 1's verify require a `svelte.config.js`.
- **Fix:** Authored `svelte.config.js` (adapter-static Pattern 1) and simplified `vite.config.ts` to `plugins: [sveltekit()]`, removing the inline adapter + forced-runes compilerOptions (Svelte 5 auto-detects runes per file).
- **Files modified:** svelte.config.js (created), vite.config.ts
- **Verification:** `svelte-kit sync` clean; `pnpm build` succeeds; Task 1 + Task 2 verify blocks pass.
- **Committed in:** 997b9d1 (Task 1) / 1b83b62 (Task 2)

**2. [Rule 3 - Blocking] Moved pnpm overrides + build approval to pnpm-workspace.yaml**
- **Found during:** Task 1 (pnpm 11.6 warned `pnpm.overrides` in package.json is ignored)
- **Issue:** The plan assumes `pnpm.overrides` in package.json enforces the transitive three pin, but pnpm 11.6 relocated these settings to `pnpm-workspace.yaml`.
- **Fix:** Created `pnpm-workspace.yaml` with `overrides.three: 0.175.0` and `onlyBuiltDependencies: [esbuild]`; kept the package.json `pnpm.overrides` block for plan parity.
- **Files modified:** pnpm-workspace.yaml (created), package.json
- **Verification:** warning cleared; `pnpm why three` → single 0.175.0; `check-three-pin.mjs` exits 0.
- **Committed in:** 997b9d1 (Task 1)

**3. [Rule 3 - Blocking] Pinned vite and typescript to the locked majors**
- **Found during:** Task 1 (scaffold pulled vite@^8, typescript@^6)
- **Issue:** CLAUDE.md locks Vite 7 (Threlte v8 dev-tested) and TypeScript 5.9.x.
- **Fix:** `pnpm add -D vite@^7 typescript@^5.9`; resolved to vite@7.3.6, typescript@5.9.3.
- **Files modified:** package.json, pnpm-lock.yaml
- **Verification:** `pnpm why vite` → single 7.3.6; build passes.
- **Committed in:** 997b9d1 (Task 1)

---

**Total deviations:** 3 auto-fixed (all Rule 3 - blocking/config-reality)
**Impact on plan:** All three reconcile the plan (written against an older scaffold + pnpm behavior) with current tool reality. No scope creep; the plan's structural goals (FOUND-01/02/03/04) are met exactly.

## Issues Encountered
- The `sv` scaffold left a `prepare` (svelte-kit sync) error mid-install because it referenced the removed `adapter-auto` from `vite.config.ts`; resolved by authoring `svelte.config.js` and simplifying `vite.config.ts`. The esbuild "ignored build script" warning was non-fatal — esbuild's native binary ships via the `@esbuild/win32-x64` optional package and runs (`0.28.1`); it is still approved in `pnpm-workspace.yaml`.

## Known Stubs
- `src/routes/+page.svelte` is the scaffold "Welcome to SvelteKit" placeholder, and `src/routes/demo/**` + `src/lib/vitest-examples/**` are scaffold examples. These are expected at the foundation stage — this plan's goal is deploy/foundation config, not content. Home/section content lands in phases 2 and 4; the demo/example routes are candidate cleanup for a later plan (logged to `deferred-items.md`). None block FOUND-01/02/03/04.

## User Setup Required
None in this plan. (Note for plan 03: Repo → Settings → Pages → Source must be set to "GitHub Actions" once — a manual step surfaced in the deploy plan, not here.)

## Next Phase Readiness
- Buildable static foundation is in place; plan 02 can add `src/lib/tokens/{colors,pairs}.ts` + `tokens.css`, extend `src/app.css`, add `scripts/check-contrast.mjs`, and the `src/lib/premium/` guard.
- Plan 03 can add `.github/workflows/deploy.yml` (BASE_PATH-injected) and go live.

## Self-Check: PASSED

All created files present (svelte.config.js, src/routes/+layout.ts, src/app.css, static/.nojekyll, scripts/check-three-pin.mjs, pnpm-workspace.yaml, .nvmrc, .npmrc, SUMMARY.md) and all three task commits (997b9d1, 1b83b62, 15e9e16) exist in git history.

---
*Phase: 01-foundation-tokens-live-deploy*
*Completed: 2026-07-04*
