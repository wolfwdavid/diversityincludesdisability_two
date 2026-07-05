---
phase: 03-mode-state-system-toggle
plan: 03
subsystem: ui
tags: [mode-toggle, aria-switch, keyboard-a11y, aria-live, svelte5, playwright, e2e, sticky-header, no-flash]

# Dependency graph
requires:
  - phase: 03-mode-state-system-toggle
    plan: 02
    provides: "runes store mode.svelte.ts (isPremium/toggleMode/setMode/getMode); .visually-hidden + .mode-toggle__track + no-transition-until-ready guards in app.css; pre-paint data-mode stamp"
  - phase: 03-mode-state-system-toggle
    plan: 01
    provides: "constants surface (STORAGE_KEY did2:mode, DATA_ATTR, Mode); playwright webServer pinned to BASE_PATH subpath"
provides:
  - "ModeToggle.svelte: native <button role='switch' aria-checked={isPremium()}> driving toggleMode(), with a colocated visually-hidden aria-live='polite' announce region"
  - "Header-hosted toggle in +layout.svelte (sticky persistent header) + requestAnimationFrame data-mode-ready transition unlock"
  - "Component client spec (ARIA/keyboard/focus/live-region) + Playwright E2E (persistence-across-reload, no-flash, scroll+focus preserved)"
affects: [04-content-nav (builds full nav around the header slot + inherits the aria-checked hydration rule), all Phase 4+ mode-conditional UI]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Native <button role='switch' aria-checked> gets Enter/Space + focusability + real focus ring for free; role/aria-checked add binary switch semantics"
    - "aria-live region colocated INSIDE the toggle component and rendered unconditionally so it exists from first paint (never destroyed by a future {#if} nav mount)"
    - "E2E toggles via dispatchEvent('click') to bypass Playwright's actionability auto-scroll, isolating the component's own scroll/focus behavior"
    - "Persistent (sticky) header keeps the switch in-viewport while scrolled — the faithful implementation of MODE-01's 'persistent toggle'"

key-files:
  created:
    - src/lib/components/ModeToggle.svelte
    - src/lib/components/ModeToggle.svelte.spec.ts
    - tests/mode.e2e.ts
  modified:
    - src/routes/+layout.svelte

key-decisions:
  - "ModeToggle consumes the Wave-2 store only (isPremium/toggleMode) — zero re-derivation of precedence or the did2:mode key"
  - "Switch semantics chosen over aria-pressed (both allowed by criteria); role='switch'+aria-checked is the strongest binary on/off mapping (checked = Premium)"
  - "aria-live announce region lives in the component (colocated with the button), rendered unconditionally, so subsequent toggles always announce"
  - "Header made sticky (position:sticky;top:0) to honor MODE-01's 'persistent' toggle and make scroll-preservation genuinely testable"

patterns-established:
  - "Component-level client spec drives keyboard via userEvent.keyboard (vitest-browser), not page.keyboard"
  - "Real-browser E2E must not assume a starting mode — a fresh context resolves to the LOCKED premium default; capture-then-assert-flip instead of hard-coding a value"

requirements-completed: [MODE-01, MODE-05, MODE-06]

# Metrics
duration: 56min
completed: 2026-07-05
---

# Phase 3 Plan 3: Mode Toggle Switch + Layout Wiring + E2E Summary

**Accessible native `<button role="switch" aria-checked={isPremium()}>` mode toggle driving the Wave-2 runes store, mounted in a sticky persistent header with an `rAF` `data-mode-ready` unlock and a colocated `aria-live` announcer, proven by an 8-case client spec and a 3-case Playwright E2E (persistence-across-reload, no-flash, scroll+focus preserved).**

## Performance

- **Duration:** ~56 min (wall clock; dominated by repeated E2E build+preview cycles)
- **Started:** 2026-07-05T02:56:51Z
- **Completed:** 2026-07-05T03:52:21Z
- **Tasks:** 3
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments
- Shipped `ModeToggle.svelte` — a native `<button role="switch">` whose `aria-checked` mirrors `isPremium()`, that flips the whole-site `<html data-mode>` on click, is keyboard-operable (Enter/Space), keeps focus on itself after toggling, and announces the new mode via a colocated visually-hidden `aria-live="polite"` region. It consumes only the Wave-2 store (`isPremium`/`toggleMode`) — no re-derived precedence or storage key.
- Wired the toggle into `+layout.svelte`: rendered unconditionally in a minimal sticky `<header>` (Phase 4 builds the nav around this slot), plus an `onMount(requestAnimationFrame(...))` that stamps `data-mode-ready` after first paint to lift the app.css no-transition guard.
- Proved the browser-only behaviors with a Playwright E2E: the chosen mode survives a full reload (via `did2:mode` localStorage), a seeded `did2:mode=premium` is stamped on `<html>` before first paint (no FOUC), and a toggle preserves both `scrollY` and focus on the switch.
- 8-case component client spec (chromium) green: switch role + accessible name, `aria-checked` reflection, click + Enter + Space activation, focus-stays-put, and the two-value aria-live announcement.

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): failing switch/keyboard/live-region spec** - `582dcb5` (test)
2. **Task 1 (GREEN): ModeToggle accessible switch driving the runes store** - `dc7fee9` (feat)
3. **Task 2: mount ModeToggle in header slot + data-mode-ready unlock** - `8efc324` (feat)
4. **Task 3: Playwright E2E (persistence, no-flash, scroll+focus) + sticky header** - `9155ab6` (test)

_TDD Task 1 produced test → feat commits; implementation clean on first pass (no refactor commit)._

## Files Created/Modified
- `src/lib/components/ModeToggle.svelte` - Native `<button role="switch" aria-checked={isPremium()}>` calling `toggleMode()`; colocated `.visually-hidden` `aria-live="polite"` announcer; scoped pill styling with a ≥24px target (WCAG 2.5.8) that reuses the app.css transition guards; global `:focus-visible` ring preserved (no `outline:none`)
- `src/lib/components/ModeToggle.svelte.spec.ts` - Client (chromium) spec: 8 cases covering role/name, `aria-checked` reflection, click + keyboard (Enter/Space via `userEvent.keyboard`), focus-not-moved, and the aria-live announcement text
- `src/routes/+layout.svelte` - Imports and renders `<ModeToggle/>` unconditionally in a sticky `.site-header`; `onMount(requestAnimationFrame(...))` stamps `data-mode-ready`; preserves the existing app.css import, favicon link, and `{@render children()}`
- `tests/mode.e2e.ts` - Playwright E2E: persistence-across-reload, no-flash-on-first-paint (via `addInitScript` seeding `did2:mode`), and scroll+focus preservation across a toggle (base-path-aware URL)

## Decisions Made
- **Store-only consumption:** ModeToggle imports `isPremium`/`toggleMode` from `$lib/mode/mode.svelte` and nothing else — the storage key and precedence live solely in the Wave-1/2 artifacts (grep-verified `from '$lib/mode/mode.svelte'`, no `three`/`@threlte`).
- **Switch over toggle-button:** `role="switch"` + `aria-checked` (checked = Premium) is the strongest binary semantic; the accessible name "Premium 3D mode" states what is controlled.
- **aria-live colocated + unconditional:** the announcer lives in the component and is never behind an `{#if}`, so Phase 4's nav work can't destroy the live region and silence announcements.
- **Sticky persistent header:** honors MODE-01's "persistent header toggle" and is what makes the scroll-preservation assertion meaningful (switch stays in-viewport while scrolled).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Made the header sticky (persistent toggle)**
- **Found during:** Task 3 (E2E scroll-preservation test)
- **Issue:** The plan's Task 2 built a minimal static `<header>`. With a static header the toggle scrolls out of view, so any real interaction (Playwright click / `focus()`) scrolls the page back to the top — making the MODE-05 "scroll preserved" behavior impossible to exercise faithfully, and leaving MODE-01's "persistent" toggle only partially realized.
- **Fix:** Added `position: sticky; top: 0; z-index: 10` (plus flex end-alignment + surface background) to `.site-header` in `+layout.svelte`. Keeps the switch in the viewport while scrolled; no nav content added (still deferred to Phase 4).
- **Files modified:** src/routes/+layout.svelte
- **Verification:** E2E scroll+focus test green (scrollY stays 300, activeElement is the switch); `pnpm check` 0/0; the `{#if}`-free unconditional-render acceptance still holds.
- **Committed in:** 9155ab6 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 missing-critical)
**Impact on plan:** The sticky change completes MODE-01's "persistent" intent and is required for the MODE-05 scroll assertion to be genuine. No scope creep — still just a header + the toggle.

## Issues Encountered
- **Vitest-browser keyboard API:** the component spec's first draft used `page.keyboard.press(...)` (Playwright API); vitest-browser exposes keyboard via `userEvent.keyboard(...)`. Switched to `userEvent`; 8/8 green. Component itself unchanged (native button — the keyboard behavior was never in doubt).
- **E2E starting-mode assumption:** the scroll test initially hard-coded `aria-checked='true'` after a toggle. A fresh Playwright context has no stored choice, so the inline script resolves to the LOCKED `premium` default (WebGL-capable, no reduced-motion) → the switch starts checked and a toggle flips it to `false`. Reworked the test to capture the initial `data-mode` and assert it *flipped*, then toggle via `dispatchEvent('click')` (bypasses Playwright's actionability auto-scroll) to isolate scroll/focus. All 3 E2E green.
- **Port 4173 contention:** stale preview servers repeatedly held the Playwright port between runs; freed via PowerShell `Get-NetTCPConnection … Stop-Process` before each run. Environment-only; no source impact.
- Pre-existing `[WARN] The "pnpm" field in package.json is no longer read by pnpm` still appears (documented in STATE.md — effective `three@0.175.0` override lives in `pnpm-workspace.yaml`). Out of scope, not touched.

## User Setup Required

None - no external service configuration required.

## Verification
- `pnpm exec vitest run --project client src/lib/components/ModeToggle.svelte.spec.ts` → 8/8 GREEN
- `pnpm exec vitest run` (both projects) → 39/39 GREEN
- `pnpm exec playwright test tests/mode.e2e.ts` → 3/3 GREEN (persistence, no-flash, scroll+focus; EXIT:0)
- `pnpm check` → 0 errors, 0 warnings
- Manual residual (deferred to /gsd:verify-work): NVDA/VoiceOver read-out of the aria-live announcement.

## Known Stubs
None - the toggle is fully wired to the runes store and drives the whole-site `data-mode`. The minimal header intentionally hosts only the toggle; the full navigation is a plan-sanctioned Phase 4 deliverable (LOCKED decision #6), not a stub.

## Next Phase Readiness
- The header slot + sticky persistent toggle are ready for Phase 4 to build full navigation AROUND the toggle without unmounting it (the aria-live region must stay mounted).
- Phase 4 inherits the `aria-checked` hydration rule: SSR default is `accessible`, the client adopts the pre-stamped attribute; any mode-divergent content added in Phase 4 follows the same seed-from-attribute discipline.
- The E2E harness (base-path-aware, preview-pinned) is established for future mode/nav regression tests.

---
*Phase: 03-mode-state-system-toggle*
*Completed: 2026-07-05*

## Self-Check: PASSED

All created/modified files present on disk (ModeToggle.svelte, ModeToggle.svelte.spec.ts, +layout.svelte, tests/mode.e2e.ts, 03-03-SUMMARY.md) and all task commits (582dcb5, dc7fee9, 8efc324, 9155ab6) verified in git history.
