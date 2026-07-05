---
phase: 04-accessible-section-components
plan: 05
subsystem: contact-accessibility-pages
tags: [contact, accessibility-statement, mailto, social-links, wcag-2.2-aa, seo]
requires:
  - "$lib/content barrel (contact, socialLinks, seo) — Phase 02"
  - "route stubs at /contact and /accessibility — Phase 04-01"
provides:
  - "src/lib/components/sections/Contact.svelte (mailto CTA + Slot-branched social links)"
  - "/contact real route (SECT-05)"
  - "/accessibility WCAG 2.2 AA statement route (SECT-06)"
affects:
  - "primary nav Accessibility Statement link now resolves to a real statement page"
tech-stack:
  added: []
  patterns:
    - "RESEARCH Pattern 6: mailto CTA with encodeURIComponent(subject)"
    - "RESEARCH Pattern 5: social Slot branch — published=<a>, pending=plain text (no dead anchor)"
    - "External social URLs use rel=noopener + scoped eslint-disable for no-navigation-without-resolve (resolve() is internal-only)"
    - "7-part scope.org.uk/GOV.UK accessibility-statement structure"
key-files:
  created:
    - src/lib/components/sections/Contact.svelte
    - src/lib/components/sections/Contact.svelte.spec.ts
  modified:
    - src/routes/contact/+page.svelte
    - src/routes/accessibility/+page.svelte
decisions:
  - "Pending social links render as plain <span> text (never href=# ) — honest, no dead links (CONT-03)"
  - "Published social handles treated as EXTERNAL absolute URLs (rel=noopener external, no resolve()) — scoped, justified eslint-disable"
  - "Accessibility feedback contact reuses contact.email from the barrel so it can never drift from the Contact page (CONT-01)"
metrics:
  duration_min: 12
  tasks: 3
  files: 4
  completed: 2026-07-05
---

# Phase 4 Plan 5: Contact & Accessibility Pages Summary

Built the SECT-05 Contact section and SECT-06 Accessibility Statement page. `Contact.svelte` renders a prominent `mailto:emanrimawi@gmail.com` "Let's Connect" CTA from the `contact` barrel and lists all four social platforms, branching on each `SocialLink.link` Slot — a published link becomes a real external `<a>`, a pending one renders as plain text with no dead anchor (all four are currently pending, so all four are text). Both `/contact` and `/accessibility` 04-01 placeholder stubs were fully replaced by their real pages; the accessibility route is a credible 7-part WCAG 2.2 AA statement whose feedback contact reuses `contact.email`.

## What Was Built

- **Task 1 (TDD):** `Contact.svelte` + client spec. RED spec first (import failure), then GREEN implementation. Spec pins: mailto CTA accessible name + href/encoded subject, all four barrel labels present as text, no `href="#"`, exactly one anchor (the mailto), no "click here". 6/6 GREEN.
- **Task 2:** Replaced `/contact` stub — single `<h1>`, `seo.contact` `<svelte:head>`, renders `<Contact />`.
- **Task 3:** Replaced `/accessibility` stub — single `<h1>` + seven `<section>`/`<h2>` blocks (commitment, conformance "WCAG 2.2 level AA", measures, known limitations, feedback via barrel email, how assessed, review date). `seo.accessibility` head.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ESLint `svelte/no-navigation-without-resolve` on the published social `<a>`**
- **Found during:** Task 1 (eslint acceptance gate)
- **Issue:** The `<a href={s.link.url}>` for a published social link tripped the internal-link `resolve()` rule, but social handles are external absolute `https://` profile URLs where `resolve()` (base-aware internal routing) does not apply.
- **Fix:** Added `rel="noopener noreferrer external" target="_blank"` and a single scoped, justified `eslint-disable-next-line svelte/no-navigation-without-resolve` on that anchor only. (This branch never renders today — all four links are pending — but the code path must lint clean.)
- **Files modified:** src/lib/components/sections/Contact.svelte
- **Commit:** fc2314d

**2. [Rule 3 - Blocking] Comment wording tripping acceptance greps**
- **Found during:** Tasks 1 & 2 (acceptance grep verification)
- **Issue:** Explanatory comments containing the literal `href="#"` and `<h1>` caused `grep -c` acceptance checks to over-count.
- **Fix:** Reworded comments (no functional change) so the dead-anchor and single-h1 greps read exactly as specified.
- **Files modified:** src/lib/components/sections/Contact.svelte, src/routes/contact/+page.svelte

## Verification

- Contact client spec: `pnpm exec vitest run --project client src/lib/components/sections/Contact.svelte.spec.ts` → 6/6 GREEN.
- `pnpm exec eslint` on all three plan files → clean.
- `pnpm check` produces zero errors for this plan's four files. (Transient errors in `About.svelte` / `SocialProof.svelte.spec.ts` belong to the concurrently-running 04-04 parallel executor and are out of scope; the orchestrator validates the full tree after all wave-2 agents complete.)
- Acceptance greps all pass: contact h1=1, accessibility h1=1, h2=7 (>=5), "WCAG 2.2" present, `contact.email` present, no `TODO(04-05)`, no dead anchor, no "click here", no inline `style=`.

## Notes for Next Plan (04-06)

- Route reachability (incl. `/accessibility/` in nav), axe WCAG 2.2 AA over `/contact/` + `/accessibility/`, and responsive checks are verified in 04-06.
- All four social links remain `pending` (content-dependent — awaiting Eman's confirmed handles); when published they will render as real external anchors with the existing rel/target hardening.

## Self-Check: PASSED

All 4 plan files and 1 SUMMARY present on disk; all 4 task commits (d310aa2, fc2314d, 19afb8b, 2278cba) present in history.
