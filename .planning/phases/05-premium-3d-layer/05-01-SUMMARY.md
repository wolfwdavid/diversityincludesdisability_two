---
phase: 05-premium-3d-layer
plan: 01
subsystem: ui
tags: [design-tokens, wcag, contrast, dark-mode, css, scrim, premium-mode]

# Dependency graph
requires:
  - phase: 01-foundation-tokens-live-deploy
    provides: typed DID token source (colors.ts/pairs.ts/tokens.css) + culori WCAG gate (check-contrast.mjs)
  - phase: 03-mode-state-system-toggle
    provides: pre-paint data-mode stamp on <html> the premium selectors key off
  - phase: 04-accessible-section-components
    provides: .site-header/.site-main/.site-footer shell + section.hero DOM the scrim system styles
provides:
  - night '#071c33' palette entry + 7 dark-role semantic tokens (textOnDark, linkOnDark, headingOnDark, accentBorderOnDark, focusRingOnDark, surfaceDark, scrim)
  - 6 new machine-gated WCAG pairs — contrast gate now 12/12 PASS including the full dark skin
  - "[data-mode='premium']:not([data-webgl='no'])" token override block (light-on-dark remap + --color-scrim at 0.94 alpha)
  - premium shell CSS — z-index 1 DOM stacking above the future fixed canvas, per-section opaque night scrim panels, immersive full-viewport hero with tight text scrims
  - structural Pitfall-5 revert — every premium rule vanishes under data-webgl='no'
affects: [05-03 premium world entry gate, 05-05 premium E2E, 06 verification-hardening axe runs]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "every premium CSS rule gated :root[data-mode='premium']:not([data-webgl='no']) — the no-WebGL fallback is structural, not scripted"
    - "dark-skin pairs run through the same culori gate as the light skin — new fg/bg combos are unrepresentable without a PASS"

key-files:
  created:
    - .planning/phases/05-premium-3d-layer/deferred-items.md
  modified:
    - src/lib/tokens/colors.ts
    - src/lib/tokens/pairs.ts
    - src/lib/tokens/tokens.css
    - src/app.css

key-decisions:
  - "Scrim alpha locked at 0.94 (>= 0.92 floor) so Phase-6 axe has a computable background (Pitfall 6)"
  - "Pre-existing repo-wide prettier drift (78 files at HEAD) deferred, not fixed — parallel executors active; plan files formatted individually and verified clean"

patterns-established:
  - "Premium skin = token remap only; components untouched (D-16 same-DOM restyled shell)"
  - "Nested-section scrim reset (.site-main section section { background: transparent }) prevents double scrims in ServicesDetail"

requirements-completed: [PREM-01]

# Metrics
duration: 10min
completed: 2026-07-06
---

# Phase 5 Plan 01: Dark Skin & Scrims Summary

**Contrast-gated premium dark skin: night '#071c33' scrim tokens + light-on-dark remap behind `[data-mode='premium']:not([data-webgl='no'])`, with z-index-1 shell stacking, opaque per-section scrim panels, and a full-viewport immersive hero — zero 3D dependency.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-06T10:39:58Z
- **Completed:** 2026-07-06T10:49:43Z
- **Tasks:** 2
- **Files modified:** 4 (+1 deferred-items log)

## Accomplishments

- Dark skin exists entirely as token/CSS work: `night` palette entry, 7 dark-role semantic tokens, and a premium custom-property override block — accessible-mode rendering untouched (all rules premium-scoped)
- Contrast gate extended from 6 to 12 pairs, all PASS at the pre-verified ratios (white/blue900 14.54, orange500/blue900 4.77, white/night 17.17, orange500/night 5.63, orangeDeep/blue900 3.53 AA-ui, white/blue900 14.54 AA-ui)
- Premium shell system: header/main/footer stack at z-index 1 above the future fixed canvas (05-03); every top-level section sits on an effectively opaque (0.94 alpha) night scrim; hero goes transparent full-viewport grid with tight text-fitting scrims and a solid orange CTA (ink-on-orange500, gated pair 5.86)
- Pitfall-5 revert is structural: all 8 premium selectors carry the `:not([data-webgl='no'])` guard, so a stored-premium visitor on a WebGL-dead browser gets the light accessible presentation with zero premium styling

## Task Commits

Each task was committed atomically:

1. **Task 1: Dark-skin tokens — night hex, dark semantic roles, contrast pairs, premium token override** - `910c04a` (feat)
2. **Task 2: Premium shell CSS — stacking, per-section scrim panels, immersive hero** - `d87e80b` (feat)

## Files Created/Modified

- `src/lib/tokens/colors.ts` - `night: '#071c33'` palette entry + dark-role semantic entries (textOnDark, linkOnDark, headingOnDark, accentBorderOnDark, focusRingOnDark, surfaceDark, scrim)
- `src/lib/tokens/pairs.ts` - 6 new dark-skin contrast pairs (AA-normal x4, AA-ui x2); TYPE-ONLY palette import preserved (0 runtime imports)
- `src/lib/tokens/tokens.css` - `--did-night` mirror + `[data-mode='premium']:not([data-webgl='no'])` token override with `--color-scrim: rgb(7 28 51 / 0.94)`
- `src/app.css` - premium shell rules: z-index 1 stacking, section scrim panels, nested-section reset, immersive hero (100svh grid, text scrims, orange CTA)
- `.planning/phases/05-premium-3d-layer/deferred-items.md` - pre-existing repo-wide prettier drift logged for a later `/gsd:quick` pass

## Decisions Made

- Replaced the empty `:root[data-mode='premium']` hook block outright with the guarded system (an unguarded premium selector may not exist — Pitfall 5 acceptance grep enforces this)
- Kept the empty `:root[data-mode='accessible']` hook block untouched per plan
- Scoped the prettier fix to plan-touched files only; repo-wide reformat deferred (parallel executors share this worktree — a 78-file mechanical commit would collide with them)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Two new pairs.ts entries exceeded printWidth 100**

- **Found during:** Task 2 (`pnpm lint` verification)
- **Issue:** The plan's verbatim single-line pair entries for 'link/accent on premium dark surface' and 'orange-deep border on premium dark surface' exceed the project's 100-char prettier limit
- **Fix:** `prettier --write src/lib/tokens/pairs.ts` (entries wrapped multi-line, ratio comments preserved); re-ran contrast gate (12/12 PASS) and `pnpm check` (0/0)
- **Files modified:** src/lib/tokens/pairs.ts
- **Verification:** `prettier --check` clean on all 4 plan files; acceptance greps still hold (bg:'night' x2, bg:'blue900' x4, 0 runtime imports)
- **Committed in:** d87e80b (Task 2 commit)

### Deferred (not fixed — out of scope)

**2. Repo-wide `prettier --check .` failure (78 files) pre-existing at HEAD**

- **Found during:** Task 2 (`pnpm lint`)
- **Issue:** `pnpm lint` fails on 78 files untouched by this plan (all `.planning/**` docs, CLAUDE.md, ModeToggle.svelte, app.html, several specs) — reproduces before any 05-01 edit; likely prettier/prettier-plugin-svelte formatting drift on a later install plus never-formatted planning docs
- **Action:** Logged to `.planning/phases/05-premium-3d-layer/deferred-items.md` with a suggested one-commit fix; the 4 plan files were formatted and verified clean individually, and eslint reports no errors — this plan introduces zero new lint failures
- **Impact:** The plan's `pnpm lint` verification is green for everything this plan owns; the standing repo gate needs a re-baseline pass when no parallel executors are active

---

**Total deviations:** 1 auto-fixed (Rule 1), 1 deferred (pre-existing, out of scope)
**Impact on plan:** Formatting-only; no behavior or scope change.

## Issues Encountered

- `pnpm lint` cannot pass repo-wide at HEAD (see deferred item above). Verified my changes are not the cause by checking the failure set against untouched files and confirming plan files pass `prettier --check` + `eslint` individually.

## Known Stubs

None functional. The `data-webgl` attribute the premium selectors guard against is intentionally not yet stamped — the 05-03 entry gate owns writing it ('ok'|'no'); this plan only ships the CSS that keys off it, exactly as specified in the plan's interfaces block. Absent the attribute, `:not([data-webgl='no'])` matches, so premium styling is active for `data-mode='premium'` today.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dark skin + scrim system complete and machine-verified — 05-03 can mount the fixed canvas at z-index 0 knowing the DOM shell already stacks above it and text contrast is AA-proven
- `--color-scrim` is defined only inside the premium override block, exactly where the shell rules consume it
- Phase 6 axe runs inherit no contrast debt: every text surface in premium mode sits on blue900 (header/footer via `--color-surface`) or the 0.94-alpha night scrim
- Deferred: repo-wide prettier re-baseline (`deferred-items.md`) — recommend running after Wave 1-3 executors finish

## Self-Check: PASSED

---

_Phase: 05-premium-3d-layer_
_Completed: 2026-07-06_
