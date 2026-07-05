---
phase: 4
slug: accessible-section-components
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: 04-RESEARCH.md § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.9 (two projects: `client` = Playwright-browser Chromium; `server` = node) + Playwright 1.61 for E2E; `@axe-core/playwright` 4.12.1 for WCAG 2.2 AA |
| **Config file** | `vite.config.ts` (Vitest projects), `playwright.config.ts` (E2E; `webServer` builds+previews under `BASE_PATH=/diversityincludesdisability_two`) |
| **Quick run command** | `pnpm check && pnpm exec vitest run --project client src/lib/components` |
| **Full suite command** | `pnpm check && pnpm exec vitest run && pnpm exec playwright test` |
| **Estimated runtime** | ~90 seconds (full suite incl. build+preview for E2E) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm check` (must be 0 a11y warnings) + the touched component's `client` spec
- **After every plan wave:** Run `pnpm exec vitest run` (both projects) + `pnpm exec playwright test` (pages + a11y + keyboard + reflow)
- **Before `/gsd:verify-work`:** Full suite green + `@axe-core/playwright` WCAG 2.2 AA = 0 violations on all 5 routes + `pnpm exec eslint .` clean
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

> Task IDs are assigned by the planner. Rows below map each phase requirement to its automated command; the planner fills Task ID / Plan / Wave columns when authoring plans.

| Requirement | Behavior | Test Type | Automated Command | File Exists |
|-------------|----------|-----------|-------------------|-------------|
| SECT-01 | Home renders hero+mission+services+CTA from barrel | component | `pnpm exec vitest run --project client src/lib/components/sections/Hero.svelte.spec.ts` | ❌ W0 |
| SECT-02 | 4 service pillars render, each an h2 region | component | `pnpm exec vitest run --project client src/lib/components/sections/ServicesDetail.svelte.spec.ts` | ❌ W0 |
| SECT-03 | About renders bio paragraphs; pending mission not fabricated | component | `pnpm exec vitest run --project client src/lib/components/sections/About.svelte.spec.ts` | ❌ W0 |
| SECT-04 | Published MBP engagement shown; pending testimonials marked | component | `pnpm exec vitest run --project client src/lib/components/sections/SocialProof.svelte.spec.ts` | ❌ W0 |
| SECT-05 | mailto href built from barrel; published social = `<a>`, pending = text | component | `pnpm exec vitest run --project client src/lib/components/sections/Contact.svelte.spec.ts` | ❌ W0 |
| SECT-06 | /accessibility route renders statement + is in nav | e2e | `pnpm exec playwright test tests/pages.e2e.ts` | ❌ W0 |
| SECT-07 | reflow at 320px, no horizontal scroll | e2e (viewport) | `pnpm exec playwright test tests/reflow.e2e.ts` | ❌ W0 |
| A11Y-01 | skip link moves focus to `#main` | e2e (keyboard) | `pnpm exec playwright test tests/a11y-keyboard.e2e.ts` | ❌ W0 |
| A11Y-02 | single h1, ordered headings | axe + component | `pnpm exec playwright test tests/a11y.e2e.ts` (axe `heading-order`, `page-has-heading-one`) | ❌ W0 |
| A11Y-03 | descriptive link names, no "click here" | axe | axe `link-name` in `tests/a11y.e2e.ts` | ❌ W0 |
| A11Y-04 | disclosure `aria-expanded` toggles; Escape + focus-out close | component | `pnpm exec vitest run --project client src/lib/components/Nav.svelte.spec.ts` | ❌ W0 |
| A11Y-05 | all interactive elements keyboard-operable + visible focus | e2e (keyboard) | `pnpm exec playwright test tests/a11y-keyboard.e2e.ts` | ❌ W0 |
| A11Y-07 | usable at 200% zoom / resized text | e2e (viewport/reflow) | `pnpm exec playwright test tests/reflow.e2e.ts` (320px, assert no `scrollWidth > clientWidth`) | ❌ W0 |
| A11Y-08 | zero WebGL, no non-essential motion | lint + static | `pnpm exec eslint .` (no-restricted-imports guard) + grep build output for `three` | ✅ ESLint guard exists |
| — | Svelte compile-time a11y warnings clean | typecheck | `pnpm check` (must be 0 warnings) | ✅ script exists |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `pnpm add -D @axe-core/playwright` (v4.12.1) — the only missing dependency; enables the WCAG 2.2 AA gate
- [ ] `src/routes/{services,about,contact,accessibility}/+page.svelte` — routes do not exist yet (only `/` placeholder)
- [ ] Replace `src/routes/+page.svelte` placeholder (inline-styled) with the real Home composition
- [ ] `src/lib/components/{SkipLinks,Nav}.svelte` + `src/lib/components/sections/*.svelte` — none exist
- [ ] Extend `src/routes/+layout.svelte`: add SkipLinks + `<nav id="nav">`+`<Nav/>` + `<main id="main" tabindex="-1">` + footer, **keeping `<ModeToggle/>` unconditional**
- [ ] Test files: `tests/a11y.e2e.ts`, `tests/a11y-keyboard.e2e.ts`, `tests/reflow.e2e.ts`, `tests/pages.e2e.ts`, `*.svelte.spec.ts` per section (client project) + `Nav.svelte.spec.ts` (disclosure keyboard)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Screen-reader walkthrough of every page | A11Y-01..05 (residual) | Automated axe catches rule violations, not lived SR experience | One keyboard-only + one screen-reader (NVDA/VoiceOver) pass of all 5 routes; verify skip links, heading order, disclosure announce, focus order read sensibly. Formalized as QA-03 in Phase 6; smoke here since Core Value is declared met at Phase 4 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-07-05
