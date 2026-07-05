# Roadmap: Diversity Includes Disability â Premium Website (v2)

## Overview

A dual-mode marketing site for Eman Rimawi's disability-equity practice, built as a prerendered accessible baseline plus a client-only 3D enhancement. The journey deliberately front-loads risk and satisfies the Core Value early: Phase 1 proves a green live GitHub Pages deploy while the site is empty and cheap to fix; Phase 2 establishes a single typed content source so parity is structural, not hand-maintained; Phase 3 lands the mode-state system and accessible toggle that gate all 3D work; Phase 4 completes a fully live, WCAG 2.2 AA site with ZERO WebGL â the Core Value is met here; Phase 5 layers the Premium 3D experience as a pure code-split enhancement that can never regress the accessible peer; Phase 6 turns every Core-Value promise into a verified gate.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation, Tokens & Live Deploy** - Green GitHub Pages subpath deploy, pinned stack, contrast-checked DID tokens, shell
- [ ] **Phase 2: Content Source of Truth** - Typed, mode-agnostic content modules both renderers consume
- [ ] **Phase 3: Mode State System & Toggle** - No-flash mode resolution, localStorage, accessible switch, WebGL fallback
- [ ] **Phase 4: Accessible Section Components** - Complete, live, WCAG 2.2 AA site with zero WebGL (Core Value met)
- [ ] **Phase 5: Premium 3D Layer** - Code-split Threlte enhancement on a single shared Canvas, lazy assets, GPU disposal
- [ ] **Phase 6: Verification & Polish** - axe/Lighthouse both modes, zero-WebGL network assertion, keyboard + SR pass

## Phase Details

### Phase 1: Foundation, Tokens & Live Deploy
**Goal**: A scaffolded SvelteKit app on the pinned stack deploys green to the live GitHub Pages subpath with all assets loading, plus contrast-checked DID design tokens.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, A11Y-06
**Success Criteria** (what must be TRUE):
  1. Visiting `wolfwdavid.github.io/diversityincludesdisability_two/` loads a styled page with all `_app/` assets served (no 404s, `.nojekyll` present)
  2. Deep-linking to or hard-refreshing a sub-route resolves without a 404 (trailingSlash/fallback handled)
  3. `pnpm build` produces a fully static, prerendered bundle via `adapter-static`, with `three` exact-pinned in the lockfile against Threlte v8
  4. Text and UI colors from the DID blue/orange token set pass an automated WCAG 2.2 AA contrast check
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md â Scaffold SvelteKit on the pinned stack; adapter-static config, trailingSlash/fallback, .nojekyll, exact three@0.175.0 + lockfile gate (FOUND-01/02/03/04)
- [x] 01-02-PLAN.md â DID design tokens (single typed source + CSS), culori WCAG contrast gate, lib/premium ESLint import guard (A11Y-06)
- [x] 01-03-PLAN.md â Official GitHub Pages deploy workflow + human UAT (set Pages source, verify live subpath) (FOUND-01/02/03)

### Phase 2: Content Source of Truth
**Goal**: All site copy and data live in one typed, mode-agnostic source so content parity between modes is a structural property, not a maintenance chore.
**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. Editing a single typed content module (`lib/content/*.ts`) is the only change needed to update that copy â no per-mode duplication exists
  2. Every user-facing string and CTA (nav, services, bio, contact, SEO) is sourced from the typed modules, populated from the current Wix site
  3. Unfilled social-proof slots are explicitly marked "content pending" in data; no testimonial or engagement is fabricated
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md â Type contracts (Slot<T> anti-fabrication union) + Nyquist invariant spec harness (CONT-01/02/03)
- [x] 02-02-PLAN.md â Real marketing/structural content: site identity, nav model, 4 services, per-route SEO (CONT-01/02)
- [x] 02-03-PLAN.md â People & social-proof: contact, pending social links, MBP engagement, About scaffold + human content-capture (CONT-02/03)
- [x] 02-04-PLAN.md â Single content barrel ($lib/content) + full parity/type gate (CONT-01/02/03)

### Phase 3: Mode State System & Toggle
**Goal**: A persistent, accessible mode toggle switches the whole site between Premium and Accessible with no flash, correct default precedence, and full keyboard/screen-reader support â before any 3D exists.
**Depends on**: Phase 2
**Requirements**: MODE-01, MODE-02, MODE-03, MODE-04, MODE-05, MODE-06, MODE-07
**Success Criteria** (what must be TRUE):
  1. A header toggle flips the whole site between Premium and Accessible; the choice persists across page loads and revisits via localStorage
  2. With no stored choice, the site defaults to Accessible when the OS signals `prefers-reduced-motion: reduce` or WebGL is unavailable; an explicit stored choice always wins
  3. The resolved mode is applied before first paint â there is no flash of the wrong mode on load
  4. Toggling announces the change via `aria-live`, keeps keyboard focus placed deliberately, and preserves scroll position
  5. The toggle is keyboard-operable with correct switch semantics (`aria-pressed`/role) and a visible focus state
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md â Precedence source of truth (resolveMode truth table) + pnpm tooling fix (MODE-02/03/07)
- [x] 03-02-PLAN.md â Runes store + no-flash inline head script + CSS hooks + resolver-parity guard (MODE-01/02/04)
- [x] 03-03-PLAN.md â ModeToggle switch (ARIA/keyboard/aria-live) + header slot + Playwright E2E (MODE-01/05/06)

### Phase 4: Accessible Section Components
**Goal**: The entire site â Home, Services, About, Contact, Accessibility Statement â is live, responsive, and WCAG 2.2 AA in Accessible mode with zero WebGL in existence. The Core Value is met at this phase.
**Depends on**: Phase 3
**Requirements**: SECT-01, SECT-02, SECT-03, SECT-04, SECT-05, SECT-06, SECT-07, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-07, A11Y-08
**Success Criteria** (what must be TRUE):
  1. A visitor can reach and read every page â Home (hero/mission/services/CTA), Services (4 pillars), About Eman Rimawi, Contact (`mailto` + FB/X/LinkedIn/IG), and the nav-linked Accessibility Statement â with a real social-proof engagement shown and future slots marked pending
  2. A keyboard-only user can operate the whole site: skip links to content/nav work, focus is always visible, and disclosure menus expose `aria-expanded` and close on Escape/blur
  3. Each page has a single `h1` with an ordered heading hierarchy and descriptive link text (no "click here")
  4. The layout stays usable and functional from mobile to desktop and at 200% zoom / resized text
  5. In Accessible mode the delivered site ships zero WebGL and no non-essential motion
**Plans**: 6 plans

Plans:
- [x] 04-01-PLAN.md — Accessibility chrome & primary nav: axe install, SkipLinks, runes disclosure Nav, layout shell (A11Y-01/03/04/05, SECT-07)
- [ ] 04-02-PLAN.md — Home page: Hero + Mission + ServicesOverview, single h1 + seo.home (SECT-01, A11Y-02)
- [ ] 04-03-PLAN.md — Services detail: 4 pillars as labelled h2 regions (SECT-02)
- [ ] 04-04-PLAN.md — About + SocialProof: bio + published MBP engagement + pending markers (SECT-03, SECT-04)
- [ ] 04-05-PLAN.md — Contact + Accessibility Statement: mailto CTA + Slot social links + WCAG 2.2 AA statement (SECT-05, SECT-06)
- [ ] 04-06-PLAN.md — A11y & responsive verification: pages/reflow/axe/keyboard E2E + zero-WebGL gate (SECT-06/07, A11Y-02/03/05/07/08)

### Phase 5: Premium 3D Layer
**Goal**: Premium mode adds an interactive WebGL experience across the main sections as a pure client-only enhancement, entered by exactly one dynamic import so the Accessible bundle ships zero WebGL bytes.
**Depends on**: Phase 4
**Requirements**: PREM-01, PREM-02, PREM-03, PREM-04, PREM-05, PREM-06
**Success Criteria** (what must be TRUE):
  1. In Premium mode a visitor sees an interactive WebGL hero and 3D-enhanced content across the main sections, all hosted on a single shared Canvas
  2. Loading the site in Accessible mode requests no `three`/threlte/`.glb` bytes â the 3D layer is dynamically imported only behind `premium && webgl`
  3. 3D assets are lazy-loaded, the render loop pauses when the tab is hidden or mode is Accessible, and WebGL resources are disposed on unmount so repeated toggling does not leak or lose context
  4. When `prefers-reduced-motion` is set, Premium mode reduces/limits motion even if Premium was chosen manually
  5. On a browser without WebGL support, Premium content gracefully falls back to the accessible presentation
**Plans**: TBD

Plans:
- [ ] 05-01: TBD during plan-phase

### Phase 6: Verification & Polish
**Goal**: Every Core-Value promise is converted into a verified, automated gate across both modes â accessibility, the zero-WebGL guarantee, and keyboard/screen-reader usability.
**Depends on**: Phase 5
**Requirements**: QA-01, QA-02, QA-03
**Success Criteria** (what must be TRUE):
  1. Automated axe checks report no serious/critical accessibility violations in either Premium or Accessible mode
  2. An automated (Playwright) test asserts Accessible mode loads no `three`/WebGL chunk, gating regressions in CI
  3. A keyboard-only and screen-reader walkthrough of every page passes in both modes
**Plans**: TBD

Plans:
- [ ] 06-01: TBD during plan-phase

## Progress

**Execution Order:**
Phases execute in numeric order: 1 â 2 â 3 â 4 â 5 â 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Tokens & Live Deploy | 3/3 | Complete | 2026-07-04 |
| 2. Content Source of Truth | 0/4 | Planned | - |
| 3. Mode State System & Toggle | 0/3 | Planned | - |
| 4. Accessible Section Components | 0/6 | Planned | - |
| 5. Premium 3D Layer | 0/TBD | Not started | - |
| 6. Verification & Polish | 0/TBD | Not started | - |
