---
phase: 03-mode-state-system-toggle
plan: 02
subsystem: mode-runtime
tags: [mode-toggle, runes, svelte5, no-flash, localStorage, data-mode, parity-guard, css-hooks]

# Dependency graph
requires:
  - phase: 03-mode-state-system-toggle
    plan: 01
    provides: "resolveMode() precedence source of truth; constants surface (STORAGE_KEY='did2:mode', DATA_ATTR, Mode); hasWebGL() probe"
provides:
  - "Svelte 5 runes mode store (mode.svelte.ts): getMode/isPremium/setMode/toggleMode, seeded from data-mode, write-through to did2:mode"
  - "Synchronous inline <head> no-flash script in app.html that stamps data-mode before first paint (MODE-04)"
  - "CSS substrate: .visually-hidden util, [data-mode] whole-site hooks, no-transition-until-ready + reduced-motion suppression"
  - "parity.spec.ts drift guard proving the inline script mirrors resolve.ts precedence + key and runs pre-paint"
affects: [03-03 ModeToggle component + layout wiring + E2E, all Phase 4+ mode-conditional styling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Runes store SEEDS from the pre-stamped data-mode attribute — never independently re-resolves (avoids FOUC + hydration drift)"
    - "Exported mutator functions (not a raw exported $state) so cross-module reactivity survives"
    - "Synchronous write-through inside setMode (no module-level $effect) — deterministic and testable"
    - "Structural parity spec turns the inline-script/resolver drift risk (Pitfall 5) into a CI regression gate"

key-files:
  created:
    - src/lib/mode/mode.svelte.ts
    - src/lib/mode/mode.svelte.spec.ts
    - src/lib/mode/parity.spec.ts
  modified:
    - src/app.html
    - src/app.css

key-decisions:
  - "Store consumes Wave-1 artifacts (STORAGE_KEY/DATA_ATTR/Mode from constants.ts) — zero re-derivation of key/precedence"
  - "SSR/prerender default = 'accessible' (zero-WebGL baseline ships if JS fails); client adopts stamped attribute"
  - "[data-mode] CSS hook selectors intentionally empty — Phase 4+ fills them (plan-sanctioned placeholders)"

patterns-established:
  - "No-flash inline head script is the canonical anti-FOUC method for adapter-static (no SSR request)"
  - "Parity spec pins the exact default expression + key + pre-paint order so the hand-mirrored inline copy cannot silently drift"

requirements-completed: [MODE-01, MODE-02, MODE-04]

# Metrics
duration: 9min
completed: 2026-07-05
---

# Phase 3 Plan 2: Runtime Mode Substrate Summary

**Svelte 5 runes store seeded from the pre-paint `data-mode` with write-through to the namespaced `did2:mode` key, plus the synchronous inline `<head>` no-flash script (mirroring `resolveMode`), CSS `[data-mode]` hooks, and a structural parity guard against inline/resolver drift.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-07-05T02:40:45Z
- **Completed:** 2026-07-05T02:49:50Z
- **Tasks:** 2
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments
- Landed the runes store (`mode.svelte.ts`) that mirrors the DOM `data-mode` and write-throughs the user's choice to `did2:mode` — consuming the Wave-1 constants/precedence (no duplication), verified by a 4-case client (chromium) spec.
- Added the synchronous inline `<head>` script in `app.html` that resolves and stamps `data-mode` before `%sveltekit.head%` / first paint (MODE-04), with precedence + key hand-mirrored verbatim from `resolve.ts`.
- Built the CSS substrate: `.visually-hidden` SR utility, empty `[data-mode]` whole-site hooks for Phase 4+, and the no-transition-until-ready + reduced-motion suppression guards — leaving the existing `:focus-visible` token ring untouched.
- Turned the inline-script/resolver drift risk (Pitfall 5) into a CI regression gate: `parity.spec.ts` asserts the key, both signal probes, the exact LOCKED default expression, and that the script runs BEFORE `%sveltekit.head%`.

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): failing client spec for runes store write-through** - `1456861` (test)
2. **Task 1 (GREEN): Svelte 5 runes mode store seeded from data-mode** - `1ff516b` (feat)
3. **Task 2: no-flash inline head script + CSS hooks + parity guard** - `1c6d261` (feat)

_TDD Task 1 produced test → feat commits; implementation clean on first pass (no refactor commit). Task 2 was non-TDD but authored its parity spec alongside the source._

## Files Created/Modified
- `src/lib/mode/mode.svelte.ts` - Runes store: `getMode/isPremium/setMode/toggleMode`; seeds `current` from stamped `data-mode` on client; write-through to `did2:mode` via imported `STORAGE_KEY`; `try/catch` storage; no module-level `$effect`
- `src/lib/mode/mode.svelte.spec.ts` - Client (chromium) spec: write-through + attribute reflection + toggle return value + namespaced-key regression guard (4 tests)
- `src/lib/mode/parity.spec.ts` - Node/server drift guard: key, reduced-motion + experimental-webgl probes, exact default expression, and pre-paint index order (5 tests)
- `src/app.html` - Inline `<head>` script (before `%sveltekit.head%`) stamping `data-mode` pre-paint, mirroring `resolve.ts` precedence + `did2:mode` key
- `src/app.css` - `.visually-hidden`, `[data-mode]` hooks, `:root:not([data-mode-ready])` no-flash guard, reduced-motion suppression (`:focus-visible` preserved)

## Decisions Made
- **Store never re-resolves** — it adopts the attribute the inline script already stamped, keeping store == DOM and honoring the SSR default `accessible` if JS fails.
- **Constants imported, not duplicated** — `STORAGE_KEY`/`DATA_ATTR`/`Mode` come only from `constants.ts`; `did2:mode` is never hard-coded in the store (grep-verified 0 occurrences).
- **Empty `[data-mode]` selectors are intentional** per plan — placeholders Phase 4+ populates with mode-conditional styling.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Reworded the inline-script comment so the parity index-order test passes**
- **Found during:** Task 2
- **Issue:** My first draft of the `app.html` leading comment contained the literal token `%sveltekit.head%`. The parity spec's "runs before `%sveltekit.head%`" assertion uses `indexOf('%sveltekit.head%')`, which then matched the comment mention (earlier in the file) instead of the real marker, making the order assertion fail (396 </ 279).
- **Fix:** Reworded the comment to describe placement without embedding the literal marker token; the `indexOf` now targets the real placeholder only. Inline script content/precedence unchanged.
- **Files modified:** src/app.html
- **Commit:** 1c6d261

## Issues Encountered
- The pre-existing `[WARN] The "pnpm" field in package.json is no longer read by pnpm ... pnpm.overrides ignored` message still appears (documented in STATE.md: effective `three@0.175.0` override lives in `pnpm-workspace.yaml`). Out of scope — not touched.

## Verification
- `pnpm exec vitest run --project client src/lib/mode/mode.svelte.spec.ts` → 4/4 GREEN (store write-through)
- `pnpm exec vitest run --project server src/lib/mode/parity.spec.ts` → 5/5 GREEN (inline/resolver parity)
- `pnpm exec vitest run` (both projects) → 31/31 GREEN
- `pnpm build` → exit 0; `did2:mode` inline script present in `build/index.html`
- `pnpm check` → 0 errors, 0 warnings (603 files)

## Known Stubs
- `:root[data-mode='premium'] {}` / `:root[data-mode='accessible'] {}` in `src/app.css` are intentionally empty whole-site hook selectors. This is plan-sanctioned (Task 2 action: "empty hook selectors that Phase 4+ will fill") — they exist so the attribute surface is in place; mode-conditional styling arrives with the Phase 4 content/nav work. Not a blocker for this plan's goal (the runtime substrate).

## Next Phase Readiness
- The runes store is ready for the Plan 03 `ModeToggle.svelte` to drive (`isPremium()` for `aria-checked`, `toggleMode()` on click) and for the layout's `aria-live` announce region + `data-mode-ready` transition unlock.
- `data-mode` is guaranteed on `<html>` before first paint, so Plan 03's Playwright no-flash + persistence-across-reload smoke has a stable substrate.
- The parity guard will fail CI if a future edit drifts the inline script from `resolve.ts`.

---
*Phase: 03-mode-state-system-toggle*
*Completed: 2026-07-05*

## Self-Check: PASSED

All created/modified files present on disk (mode.svelte.ts, mode.svelte.spec.ts, parity.spec.ts, app.html, app.css, 03-02-SUMMARY.md) and all task commits (1456861, 1ff516b, 1c6d261) verified in git history.
