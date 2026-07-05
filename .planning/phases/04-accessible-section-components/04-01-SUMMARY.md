---
phase: 04-accessible-section-components
plan: 01
subsystem: ui
tags: [sveltekit, svelte5-runes, accessibility, wcag22aa, skip-links, disclosure-nav, axe-core, vitest-browser]

# Dependency graph
requires:
  - phase: 02-content-layer
    provides: "$lib/content barrel (nav, footer) — the single source of nav copy + routes"
  - phase: 03-mode-state-system-toggle
    provides: "ModeToggle.svelte with colocated aria-live region + sticky header slot"
provides:
  - "SkipLinks.svelte — two visually-hidden-until-focus skip links (#main, #nav)"
  - "Nav.svelte — primary nav over the 5 barrel routes + runes mobile disclosure (aria-expanded, Escape/focus-out close, aria-current)"
  - "Full accessible shell in +layout.svelte: SkipLinks -> header(nav + ModeToggle) -> main#main -> footer"
  - "Four placeholder route stubs (/services, /about, /contact, /accessibility) registering all five RouteIds"
  - "@axe-core/playwright dev dependency for the 04-06 WCAG 2.2 AA gate"
  - "app.css: .skip-link + scroll-margin-top (WCAG 2.4.11) + .site-main responsive shell"
affects: [04-02-home-page, 04-03-services-page, 04-04-about-social-proof, 04-05-contact-accessibility-pages, 04-06-a11y-responsive-verification]

# Tech tracking
tech-stack:
  added: ["@axe-core/playwright@4.12.1 (dev)"]
  patterns:
    - "APG Disclosure (Show/Hide) mobile nav via Svelte 5 runes ($state open flag, Escape + focusout close, no focus trap)"
    - "Active-route detection strips base + trailing slash before comparing to barrel route keys"
    - "Route stubs registered FIRST so typed resolve() (closed RouteId union) compiles with zero casts"
    - "Component specs mock $app/state to mount route-aware components in isolation"

key-files:
  created:
    - src/lib/components/SkipLinks.svelte
    - src/lib/components/Nav.svelte
    - src/lib/components/Nav.svelte.spec.ts
    - src/routes/services/+page.svelte
    - src/routes/about/+page.svelte
    - src/routes/contact/+page.svelte
    - src/routes/accessibility/+page.svelte
  modified:
    - src/routes/+layout.svelte
    - src/app.css
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Wrapping <div> in Nav carries role=presentation: the real nav landmark is the layout's <nav id=nav>, so the disclosure group wrapper (which only delegates Escape/focus-out) declares no semantics — clears svelte-check a11y_no_static_element_interactions with zero landmark duplication"
  - "Nav component specs mock $app/state to { page: { url: new URL('http://localhost/') } } so the aria-current active-route contract is deterministic without a running router; $app/paths left real (base='' -> resolve(route)===route)"
  - "Disclosure link assertions open the menu first because the vitest browser viewport is mobile-width (menu collapsed/display:none until disclosed)"

patterns-established:
  - "Skip links: first focusable content, off-screen-until-focus, targets tabindex=-1 + scroll-margin-top so focus (not just scroll) moves and clears the sticky header"
  - "Mobile disclosure nav: native <button aria-expanded aria-controls>, desktop CSS always shows the menu so keyboard users never depend on the toggle"
  - "Chrome built around ModeToggle (never unmounted) to preserve its aria-live region"

requirements-completed: [A11Y-01, A11Y-03, A11Y-04, A11Y-05, SECT-07]

# Metrics
duration: 12min
completed: 2026-07-05
---

# Phase 4 Plan 01: Accessibility Chrome & Nav Summary

**Accessible site chrome — skip links to #main/#nav, a runes-driven mobile disclosure nav over the 5 barrel routes with aria-current, and a full SkipLinks -> header(nav+ModeToggle) -> main -> footer layout — plus four route stubs that make typed resolve() compile with zero casts and @axe-core/playwright for the WCAG 2.2 AA gate.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-05T09:18:00Z
- **Completed:** 2026-07-05T09:30:11Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- SkipLinks.svelte + Nav.svelte + full accessible `+layout.svelte` shell (skip links first, sticky header hosting the Primary nav and the unconditional ModeToggle, focusable `#main`/`#nav` skip targets, footer from the barrel).
- Runes mobile disclosure (A11Y-04): `aria-expanded` toggles, Escape closes and returns focus to the toggle, focus leaving the nav closes it — proven by a 5-case client spec (GREEN).
- Four placeholder route stubs register all five `RouteId`s so `resolve(item.route)` over the barrel `nav` typechecks with **zero** casts; `@axe-core/playwright` installed for the 04-06 gate.
- ModeToggle aria-live region preserved through the header refactor (spec still 8/8); `pnpm check` 0/0, `eslint` clean across all three tasks.

## Task Commits

Each task was committed atomically:

1. **Task 1: Route stubs + @axe-core/playwright + SkipLinks + skip/responsive CSS** - `814d269` (feat)
2. **Task 2: Nav.svelte primary nav + mobile disclosure (TDD RED→GREEN)** - `6a90b68` (feat)
3. **Task 3: Extend +layout.svelte into the full accessible shell** - `94c2003` (feat)

_TDD note: Task 2's RED (spec written first, failing on the missing component) and GREEN (implementation) were consolidated into one commit after the spec was corrected for the mobile-collapsed viewport._

## Files Created/Modified
- `src/lib/components/SkipLinks.svelte` - Two skip links (#main, #nav), first focusable content.
- `src/lib/components/Nav.svelte` - Primary nav + runes mobile disclosure; base/trailing-slash-aware `aria-current`.
- `src/lib/components/Nav.svelte.spec.ts` - Client spec: 5 links, aria-expanded toggle, Escape+focus return, focus-out close, aria-current (5/5).
- `src/routes/{services,about,contact,accessibility}/+page.svelte` - Placeholder stubs registering the four barrel RouteIds (Wave-2 replaces each).
- `src/routes/+layout.svelte` - Full shell: SkipLinks -> header(nav + ModeToggle) -> main#main -> footer.copyright.
- `src/app.css` - `.skip-link` styles + reduced-motion guard + `scroll-margin-top` (WCAG 2.4.11) + `.site-main` responsive container.
- `package.json` / `pnpm-lock.yaml` - `@axe-core/playwright@4.12.1` dev dependency.

## Decisions Made
- **Nav wrapper `role="presentation"`:** the disclosure group `<div>` only delegates Escape/focus-out handling; the navigation landmark is the layout's `<nav id="nav">`. Declaring no semantics clears svelte-check `a11y_no_static_element_interactions` without duplicating the nav landmark.
- **Mock `$app/state` in the Nav spec:** mounts the route-aware component at `/` deterministically (no running router); `$app/paths` left real since `base=''` makes `resolve(route)===route`.
- **Disclosure specs open the menu first:** the vitest browser viewport is mobile-width, so the menu is `display:none` until disclosed — asserting links requires opening it, which also exercises the disclosure.

## Deviations from Plan

None - plan executed exactly as written. The `role="presentation"` on the Nav wrapper and the `$app/state` mock in the spec are implementation details anticipated by the plan/RESEARCH (svelte-check a11y is a declared phase gate; the spec explicitly needed to mount "at /"), not scope changes.

## Issues Encountered
- **svelte-check a11y warning** on the Nav wrapper `<div>` with a keydown handler (`a11y_no_static_element_interactions`). Resolved by adding `role="presentation"` (the real landmark is the layout `<nav>`), reaching 0 warnings per RESEARCH Pitfall 3.
- **Two Nav spec cases initially timed out** querying links: the vitest browser viewport is mobile-width, so the collapsed menu (`display:none`) hid the links from the a11y tree. Fixed by opening the disclosure before asserting — the correct way to exercise a mobile disclosure.
- **A comment containing the literal `{#if}`** in `+layout.svelte` tripped the "ModeToggle unconditional" grep guard; reworded the comment so the file contains no `{#if`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chrome + nav + shell are the foundation the Wave-2 page plans (04-02 home, 04-03 services, 04-04 about, 04-05 contact/accessibility) compose into. Each replaces its placeholder route stub with the real page (single `<h1>` per route; sections start at `<h2>`).
- `@axe-core/playwright` is installed and ready for the 04-06 WCAG 2.2 AA E2E gate.
- Known-intentional stubs: the four route `+page.svelte` files are placeholders (single `<h1>` + TODO marker) by design — each is explicitly slated for replacement by its Wave-2 plan (tracked in Known Stubs below).

## Known Stubs
These are intentional, plan-mandated placeholders (Task 1 registers the RouteIds so `resolve()` typechecks); each is replaced by a named Wave-2 plan:
- `src/routes/services/+page.svelte` — `<h1>Services</h1>` + `TODO(04-03)` — replaced by plan 04-03.
- `src/routes/about/+page.svelte` — `<h1>About</h1>` + `TODO(04-04)` — replaced by plan 04-04.
- `src/routes/contact/+page.svelte` — `<h1>Contact</h1>` + `TODO(04-05)` — replaced by plan 04-05.
- `src/routes/accessibility/+page.svelte` — `<h1>Accessibility Statement</h1>` + `TODO(04-05)` — replaced by plan 04-05.

## Self-Check: PASSED

All 10 created/modified files verified present on disk; all three task commits (`814d269`, `6a90b68`, `94c2003`) verified in git history.

---
*Phase: 04-accessible-section-components*
*Completed: 2026-07-05*
