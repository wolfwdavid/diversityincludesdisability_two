---
phase: 01-foundation-tokens-live-deploy
plan: 02
subsystem: ui
tags: [design-tokens, wcag, culori, contrast, eslint, sveltekit, accessibility, css-custom-properties]

# Dependency graph
requires:
  - phase: 01-01-scaffold-stack-static-config
    provides: Buildable SvelteKit app (adapter-static), src/app.css base reset, eslint flat config, base-aware paths
provides:
  - Single typed DID palette source (src/lib/tokens/colors.ts) with semantic role tokens
  - fg×bg pairs manifest (pairs.ts) tagged with required WCAG 2.2 AA level
  - CSS custom properties (tokens.css) mirroring colors.ts exactly, imported by app.css
  - Home placeholder rendering with DID blue/orange tokens (visible palette proof)
  - scripts/check-contrast.mjs — CI-runnable culori WCAG 2.2 AA gate (A11Y-06)
  - src/lib/premium/ directory invariant + ESLint no-restricted-imports guard (zero-WebGL baseline lock)
affects: [01-03-pages-deploy-workflow-live, phase-2-content, phase-4-sections, phase-5-premium-3d]

# Tech tracking
tech-stack:
  added:
    - "culori@4.0.2 (zero-dep WCAG contrast + color parsing)"
  patterns:
    - "Single typed token source (colors.ts) → CSS custom properties (tokens.css) mirrored, gated against drift"
    - "fg×bg pairs manifest tagged with per-pair WCAG level; culori gate is the arbiter that drives hex selection"
    - "Node 24 native TS type-stripping: .mjs gate imports .ts token source directly (explicit .ts extension)"
    - "ESLint no-restricted-imports as an architecture-invariant guard (lib/premium off-limits in phases 1-4)"
    - "Base-aware internal links via resolve() from $app/paths (satisfies svelte/no-navigation-without-resolve)"

key-files:
  created:
    - src/lib/tokens/colors.ts
    - src/lib/tokens/pairs.ts
    - src/lib/tokens/tokens.css
    - scripts/check-contrast.mjs
    - src/lib/premium/.gitkeep
    - src/lib/premium/README.md
  modified:
    - src/app.css
    - src/routes/+page.svelte
    - eslint.config.js
    - package.json

key-decisions:
  - "Ran the contrast gate directly with `node` (no tsx): Node 24 strips TS types natively, so check-contrast.mjs imports colors.ts/pairs.ts by explicit .ts path with zero extra tooling"
  - "Used resolve('/') from $app/paths for the home CTA instead of the plan's literal {base}/ — the pinned eslint-plugin-svelte recommended rule svelte/no-navigation-without-resolve flags manual base concatenation; resolve() is base-path-aware and lint-clean"
  - "Proved the contrast gate is real by breaking a foreground token (orangeDeep→#ffcc66 → FAIL 1.49, exit 1), not the plan's #ffcc66-on-orange500 example — orange500 is only ever a background under dark ink, so lightening it raises contrast and cannot demonstrate a failure for this manifest"

patterns-established:
  - "Design tokens: one typed source of truth mirrored into CSS vars, drift-gated by the contrast script"
  - "A11Y-06 is a build-blocking automated gate, not a hope — every declared token pair proven >= its WCAG 2.2 AA threshold"
  - "lib/premium/ zero-WebGL invariant is structural (ESLint), not conventional"

requirements-completed: [A11Y-06]

# Metrics
duration: 12min
completed: 2026-07-04
---

# Phase 01 Plan 02: Design Tokens, Contrast Gate & Premium Guard Summary

**DID blue/orange palette as one typed source mirrored into CSS custom properties, rendering on the home placeholder and gated by a culori WCAG 2.2 AA contrast script (all six pairs pass), plus an ESLint-enforced `lib/premium/` no-import invariant.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-07-04T22:20:44Z
- **Completed:** 2026-07-04T22:32:03Z
- **Tasks:** 3
- **Files modified/created:** 10 (+ pnpm-lock.yaml, deferred-items.md)

## Accomplishments
- Authored the single typed DID palette (`colors.ts`: blue900 `#0b2a4a`, orange500 `#e8730c`, orangeDeep `#c85f08`, ink `#12181f`, white) + semantic role tokens, mirrored verbatim into `tokens.css` `:root` custom properties and wired through `app.css`. The home placeholder now renders a token-styled heading, body text, and orange CTA (verified present in the prerendered `build/index.html`).
- Built the A11Y-06 gate: `scripts/check-contrast.mjs` reads `colors.ts` + `pairs.ts` via Node 24 type-stripping and asserts each fg×bg pair meets its WCAG 2.2 AA level. All six pairs PASS (17.85 / 14.54 / 14.54 / 5.86 / 14.54 / 4.12) and the script exits 0; proven real by a temporary failing hex that drove it to exit 1.
- Planted the `src/lib/premium/` architecture invariant (`.gitkeep` + README) and an ESLint `no-restricted-imports` guard blocking `$lib/premium/*` / `**/lib/premium/*` outside `premium/`. Verified the guard fires on a temp import, then removed it; `eslint .` is clean tree-wide including the new rule.

## Task Commits

Each task was committed atomically:

1. **Task 1: Typed token source + CSS custom properties + styled home placeholder** - `ed31466` (feat)
2. **Task 2: culori WCAG contrast gate (A11Y-06)** - `8547444` (feat)
3. **Deviation fix: base-aware resolve() for home CTA** - `b6dd378` (fix)
4. **Task 3: lib/premium invariant + ESLint import guard** - `22bb715` (feat)

**Plan metadata:** docs commit (this SUMMARY + STATE/ROADMAP/REQUIREMENTS + deferred-items).

## Files Created/Modified
- `src/lib/tokens/colors.ts` - single typed palette (5 hexes) + semantic role tokens
- `src/lib/tokens/pairs.ts` - six fg×bg pairs with WCAG level tags; palette reference is type-only (erased)
- `src/lib/tokens/tokens.css` - `:root` custom properties mirroring colors.ts exactly + semantic aliases
- `src/app.css` - `@import` tokens.css; applies color/surface/link/`:focus-visible` tokens over the existing reset
- `src/routes/+page.svelte` - token-styled home placeholder (heading/body/CTA), base-aware via `resolve('/')`
- `scripts/check-contrast.mjs` - culori WCAG 2.2 AA gate over colors.ts + pairs.ts
- `src/lib/premium/.gitkeep` - zero-byte placeholder reserving the Phase 5 directory
- `src/lib/premium/README.md` - states the Phases 1-4 no-import invariant (PREM-03)
- `eslint.config.js` - `no-restricted-imports` premium guard (applies to ts/js/mjs/svelte)
- `package.json` - `culori@4.0.2` devDep + `check:contrast` script

## Decisions Made
- **Node, not tsx, runs the gate.** Node 24.18 strips TS types natively, so `check-contrast.mjs` imports the `.ts` token source directly by explicit `.ts` path — no `tsx`/`vite-node` needed. Keeps the token source single and typed.
- **`resolve('/')` over `{base}/`.** The pinned `eslint-plugin-svelte` recommended ruleset flags manual base concatenation (`svelte/no-navigation-without-resolve`); `resolve` from `$app/paths` is base-path-aware and lint-clean, and is strictly more correct for Pages deep-linking. See deviation below.
- **Gate-is-real proof via a foreground token.** The plan's suggested failing example (orange500 = `#ffcc66`) does not fail this manifest — orange500 only appears as a *background* under dark ink, so lightening it raises contrast. Demonstrated the gate with `orangeDeep = #ffcc66` (a foreground-on-white AA-ui pair) → FAIL at 1.49, exit 1; restored to green.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Home CTA href tripped svelte/no-navigation-without-resolve**
- **Found during:** Task 3 (running `pnpm lint` to prove the premium guard loads)
- **Issue:** The plan's Task 1 `+page.svelte` used `import { base }` + `href="{base}/"`. The pinned `eslint-plugin-svelte@3.19` recommended ruleset errors on manual base-path concatenation, so `eslint .` failed (1 error) — blocking the Task 3 lint verify gate.
- **Fix:** Switched to `import { resolve } from '$app/paths'` and `href={resolve('/')}` — base-path-aware and the ESLint-recommended pattern. Preserves the plan's base-awareness intent (arguably more correct).
- **Files modified:** src/routes/+page.svelte
- **Verification:** `eslint .` exits 0 tree-wide; `pnpm build` succeeds; CTA renders in `build/index.html`.
- **Committed in:** `b6dd378`

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug/lint gate). Plus one gate-verification method adjustment (documented under Decisions, not a code change).
**Impact on plan:** Minimal. The token values, pairs manifest, contrast gate, and premium guard all landed exactly as specified. The only code change from the plan's literal listing is `resolve()` instead of `base` in the placeholder CTA, forced by the pinned lint ruleset. No scope creep.

## Issues Encountered
- **Pre-existing repo-wide `prettier --check` debt.** `pnpm lint` = `prettier --check . && eslint .`. The `eslint .` half is GREEN (including the new premium guard). The `prettier --check` half fails on **21 files that all predate this plan and are unrelated to it** — the 16 `.planning/**` GSD docs, `CLAUDE.md`, `.prettierrc`, `.vscode/extensions.json`, plan-01's `scripts/check-three-pin.mjs`, and the scaffold's `src/lib/vitest-examples/Welcome.svelte.spec.ts`. **None of this plan's own files** are flagged (all were `prettier --write` formatted). Per the executor scope-boundary rule these were NOT reformatted (reformatting GSD planning docs + `CLAUDE.md`, which carries an unrelated pending edit, is out of scope and risks churning generated artifacts). Logged to `deferred-items.md` with a recommended one-plan fix (add `.planning/`+`.vscode/` to `.prettierignore`, then `pnpm format` the genuine source/config files). The ESLint gate — the actual deliverable of this plan — loads and passes cleanly.

## Deferred Issues
None from fix-attempt exhaustion. The single deferred item is the pre-existing prettier debt above (out of scope, logged to `deferred-items.md`).

## User Setup Required
None - no external service configuration required. (The one-time Repo → Settings → Pages → "GitHub Actions" step surfaces in plan 03, the deploy plan.)

## Next Phase Readiness
- The DID token system is live and contrast-gated; plan 03 can wire `scripts/check-contrast.mjs` into `.github/workflows/deploy.yml` alongside `check-three-pin.mjs` as build-blocking CI gates before deploy.
- `src/lib/premium/` + the ESLint guard lock the zero-WebGL Accessible baseline invariant, ready for phases 2-4 content and the Phase 5 dynamic-import gate (which will override the guard for exactly one entry file).

## Self-Check: PASSED

All created files present and all four commits (ed31466, 8547444, b6dd378, 22bb715) exist in git history. `node scripts/check-contrast.mjs` exits 0 (six PASS); `eslint .` exits 0; `pnpm build` emits `build/index.html` with tokens rendered.

---
*Phase: 01-foundation-tokens-live-deploy*
*Completed: 2026-07-04*
