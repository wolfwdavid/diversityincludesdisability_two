# Diversity Includes Disability — Premium Website (v2)

## What This Is

A modern, premium marketing website for **Diversity Includes Disability (DID)**, the
intersectional disability-equity venture founded by **Eman Rimawi** (trainings & facilitation,
disability consulting, modeling for representation, speaking & panels). The site ships with a
persistent **in-page mode toggle** that swaps between a **full-3D "Premium" experience** (nearly
every section rendered as an interactive WebGL scene, maximum visual impact) and a **fully
WCAG-accessible "Accessible" experience** (no WebGL, static/2D equivalents, high contrast, low
motion). Built with SvelteKit + Threlte, deployed as a static site to GitHub Pages. It is a
rebuild/replacement for the current Wix site at diversityincludesdisability.org.

## Core Value

**Every visitor gets a first-class experience of DID's work — the toggle guarantees that the
premium 3D showcase never comes at the cost of accessibility, and the accessible mode is a
genuine peer, not a degraded fallback.** If everything else fails, the mode toggle + accessible
mode must work, because an inaccessible disability-equity site is a contradiction.

## Requirements

### Validated

- [x] Static build deploys to GitHub Pages under the repo base path — *Validated in Phase 1 (live green at https://wolfwdavid.github.io/diversityincludesdisability_two/, FOUND-01/02/03)*
- [x] DID blue/orange brand palette applied via design tokens, contrast-checked (WCAG AA+) — *Validated in Phase 1 (6/6 token pairs pass WCAG 2.2 AA via automated gate, A11Y-06)*
- [x] Single-source, no-fabrication content layer (`$lib/content` barrel) that makes cross-mode parity structural — *Validated in Phase 2 (CONT-01/02/03; `Slot<T>` type contract, 4 invariant specs GREEN, single barrel is the sole import surface; unconfirmed bio/mission/social handles ship as explicit `pending` slots — nothing fabricated). Pages consume the barrel in Phase 3+.*
- [x] Persistent mode toggle (Premium 3D ⇄ Accessible), state saved to localStorage — *Validated in Phase 3 (MODE-01/02/04/05/06; accessible `role="switch"` toggle in a sticky header drives a Svelte 5 runes store, persists to `did2:mode`, applied pre-paint via inline head script — no flash, aria-live announce, focus/scroll preserved; E2E 3/3 GREEN)*
- [x] Toggle defaults to Accessible when `prefers-reduced-motion: reduce` is set — *Validated in Phase 3 (MODE-03/07; pure `resolveMode()` precedence ladder `stored > reduced-motion > no-WebGL > premium`, 7/7 truth-table specs GREEN, parity guard prevents inline-script drift)*
- [x] Accessible mode: no WebGL, static/2D equivalents of every section — *Validated in Phase 4 (A11Y-08; static prerender of all 5 routes, independent runtime scan of `build/_app` for `WebGLRenderer|@threlte|'three'|THREE.` = 0 matches)*
- [x] Home page (hero, mission, services overview, CTA) — *Validated in Phase 4 (SECT-01; Hero/Mission/ServicesOverview from the `$lib/content` barrel, single `<h1>`, mailto CTA)*
- [x] Services detail (trainings & facilitation, consulting, modeling, speaking) — *Validated in Phase 4 (SECT-02; ServicesDetail four-pillar section, all copy from the barrel)*
- [x] About Eman Rimawi page — *Validated in Phase 4 (SECT-03; 3 attributable bio paragraphs, pending mission renders nothing — no fabrication)*
- [x] Contact / "Let's Connect" + social links — *Validated in Phase 4 (SECT-05; mailto CTA, all 4 social platforms Slot-branched published→link / pending→text, currently all pending so no dead anchors)*
- [x] Accessibility statement page, linked from primary nav (scope.org.uk model) — *Validated in Phase 4 (SECT-06; 7-part WCAG 2.2 AA statement, in primary nav)*
- [x] Skip links, semantic heading hierarchy, descriptive link text, ARIA-expanded menus — *Validated in Phase 4 (A11Y-01/03/04/05; SkipLinks to `#main`/`#nav`, runes disclosure with `aria-expanded`/Escape/focus-restore; axe WCAG 2.2 AA = 0 violations on all 5 routes, keyboard E2E 3/3)*
- [x] Responsive layout (mobile → desktop) — Accessible mode — *Validated in Phase 4 (SECT-07/A11Y-07; 320px reflow E2E 5/5, no horizontal scroll). Premium-mode responsive pending Phase 5.*

- [x] Premium mode: full-3D hero + 3D scenes across most content sections (Threlte/Three.js) — *Validated in Phase 5 (PREM-01/02; fully procedural crystalline world on ONE shared Canvas in `src/lib/premium/`, per-route world configs for all 5 routes incl. the quiet-room Accessibility page, camera scroll easing + pointer parallax; human art-direction checkpoint approved 2026-07-06)*
- [x] Content parity — both modes present the same information and CTAs, nothing hidden in one — *Validated in Phase 5 (the Premium layer is a fixed backdrop behind the SAME barrel-sourced DOM; content is never forked, scrims keep text readable — 12/12 contrast pairs pass WCAG AA)*
- [x] 3D assets lazy-loaded and code-split so Accessible mode never downloads WebGL payload — *Validated in Phase 5 (PREM-03/04/05; exactly one dynamic `import()` behind `premium && webgl`, accessible static-import closure proven WebGL-free by `scripts/check-premium-budget.mjs` in CI, premium chunk 187.7 KB gzip ≤ 500 KB budget, dispose-on-toggle proven by 20-flip stress E2E)*
- [x] Responsive layout in Premium mode — *Validated in Phase 5 (viewport-fixed backdrop canvas with resize-reactive camera; content reflow unchanged from Phase 4 gates; PRM pause + no-WebGL skin-revert degrade paths E2E-proven, PREM-06)*

### Active

- [ ] Screen-reader tested (NVDA/VoiceOver smoke walkthrough) — deferred to Phase 6 QA (QA-03)

### Out of Scope

- Authentication / member login — the Wix site's "Log In" is not needed for a marketing site
- CMS / dynamic backend — static content, no server; content lives in the repo
- E-commerce / donations checkout — may come later; v1 links out (Zeffy/PayPal) at most, no in-site payment
- Any credentials, EINs, portal logins, or personal address — SECURITY: never enter this repo
- Grant tracker — lives separately in `Websites/Rimawi/`, not part of this site
- Blog / CMS-driven news feed — defer; not in the current Wix site

## Context

- **Source of content:** current Wix site diversityincludesdisability.org (services, headshots,
  Eman's bio, socials). Brand reads professional; DID blue/orange palette; low-vision-friendly
  intent already present in prior DID work.
- **Accessibility model:** scope.org.uk — skip links (content/search/nav), semantic headings,
  descriptive anchor text, ARIA-expanded disclosure menus, prominent accessibility statement in
  primary nav, progressive enhancement, keyboard-first.
- **Prior work in this org:** a self-contained accessible grant-tracker was delivered in
  `Websites/Rimawi/` (separate track). The org is an S-corp LLC with **501(c)(3) pending** — not
  relevant to the marketing site's content but noted for tone (no "donate, tax-deductible" claims).
- **Sibling dir:** `diversityincludesdisability_one/` exists but is an empty git repo; this is the
  real build (`_two`).
- **Design intelligence:** use the `ui-ux-pro-max` skill for palette, type pairing, layout, and
  a11y guidance during UI phases.

## Constraints

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

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single site + in-page mode toggle (not two deployed sites) | One codebase, guaranteed content parity, one deploy | ✓ Validated in Phase 3 (one runes store + header toggle drives whole-site `data-mode`) |
| Full-3D Premium mode (not accent-only) | User wants maximum visual impact | ✓ Validated in Phase 5 (full-viewport crystalline world across all 5 routes, art direction approved) |
| Threlte over raw Three.js | Svelte-native, declarative, less boilerplate, SSR-safe patterns | ✓ Validated in Phase 5 (Threlte 8 on-demand rendering + auto-disposal delivered pause/dispose requirements with no custom loop code) |
| adapter-static + GitHub Pages | Free hosting, no backend needed for marketing content | ✓ Validated in Phase 1 (live green); Phase 5 adds the premium-budget CI gate to the same Pages deploy |
| Accessible mode = zero WebGL, not "3D with reduced motion" | True peer experience; reliable on any device/AT | ✓ Validated in Phase 4 (all 5 routes prerendered, `build/_app` runtime scan = 0 WebGL/Three/Threlte references) |
| Default to Accessible when prefers-reduced-motion set | Respects OS-level user intent; ethical default | ✓ Validated in Phase 3 (`resolveMode` precedence; stored choice still wins) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-06 — Phase 5 complete (Premium 3D layer: fully procedural crystalline world behind ONE dynamic import, dark skin + scrims, CI budget/zero-WebGL gate, 6 premium E2E tests; verification passed 5/5, art direction human-approved; 93/93 unit + 28/29 E2E green, sole failure is pre-existing Phase-4 demo debt. Next: Phase 6 verification-&-polish.)*
