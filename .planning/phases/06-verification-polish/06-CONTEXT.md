# Phase 6: Verification & Polish - Context

**Gathered:** 2026-07-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Convert every Core-Value promise into a verified, automated gate across both modes: axe accessibility in Premium AND Accessible (QA-01), the zero-WebGL guarantee enforced at the network level in CI (QA-02), and keyboard/screen-reader walkthroughs of every page in both modes (QA-03). Plus two logged debt cleanups (prettier re-baseline, demo-route deletion). No new features, no visual changes — the art direction was approved as-is on 2026-07-06. Milestone archiving is NOT part of this phase.

</domain>

<decisions>
## Implementation Decisions

### Screen-reader walkthrough (QA-03)
- **D-01:** Hybrid approach — automated assertions for everything a screen reader depends on (accessible names, roles, landmarks, heading order, aria-live announcements) as CI-provable regression protection, PLUS a step-by-step guided NVDA checklist (HUMAN-UAT file) for a one-time real walkthrough by the user.
- **D-02:** Pass bar = NVDA on Windows only for v1. VoiceOver noted as future verification when Mac/iOS access exists — do not block on it.
- **D-03:** Full parity sweep — every page gets the identical checklist in BOTH modes, proving the canvas backdrop is invisible to the screen reader (canvas ignored, same landmarks/headings/announcements in Premium as Accessible).
- **D-04:** Mode-toggle announcements verified both ways: an automated test asserts the aria-live region text updates on toggle, AND the NVDA checklist includes hearing the announcement and the switch state with the human ear.

### Premium-mode axe standard (QA-01)
- **D-05:** Strict 0 axe violations (WCAG 2.2 AA, any severity) in BOTH modes — same bar as Phase 4's Accessible gate, exceeding QA-01's literal "no serious/critical" wording. All 5 routes × both modes = 10 gated combinations. Rationale: one standard, Core Value ("an inaccessible disability-equity site is a contradiction"), and the Phase-5 scrims were contrast-gated precisely to make this achievable.
- **D-06:** Violations found in Premium during this phase are Phase 6 work — fix scrim/token/markup in-phase until the gate is 0. No triage-and-defer.
- **D-07:** Scan coverage = steady-state (each route in each mode after settle) PLUS one scan immediately after toggling on each mode's landing page — catches skin/scrim application races without exploding the matrix.

### CI scope (QA-02)
- **D-08:** A tagged critical E2E subset runs in GitHub Actions in deploy.yml: the zero-WebGL network assertion (QA-02's literal requirement), axe both modes (QA-01), and the mode-toggle smoke. The full ~30-min suite stays local. Use browser caching to keep the added CI time ~3-5 min.
- **D-09:** The CI subset is BLOCKING, ordered before the Pages upload step (same pattern as the contrast and premium-budget gates) — a regression can never reach the live site.
- **D-10:** Axe checks live in `tests/a11y.e2e.ts` — parameterize the existing 5-route axe test over both modes and add the post-toggle scans. No separate audit script, no new tooling beyond the existing @axe-core/playwright.

### Polish scope
- **D-11:** Prettier re-baseline IS in scope: add `.planning/` to `.prettierignore`, format the drifted source files in one mechanical commit, and restore `pnpm lint` as a green standing gate (per deferred-items.md item 1).
- **D-12:** Delete `src/routes/demo/playwright` (SvelteKit scaffold leftover) and its broken base-path E2E — makes a bare `playwright test` run fully green (Phase-4 logged debt).
- **D-13:** NO visual/UX pass — verification only. Art direction approved as-is 2026-07-06; no Lighthouse gate, no visual tweaks. Milestone wrap-up (/gsd:complete-milestone, audits) is a separate user-triggered step after this phase.

### Claude's Discretion
- Exact automated-assertion vocabulary for the SR proxy tests (aria snapshots vs targeted role/name/landmark assertions)
- How the CI subset is tagged/selected (grep tag, separate project, file list)
- Browser caching mechanism in Actions
- NVDA checklist structure and granularity (must cover every page × both modes, toggle announcement, and skip-link/nav/disclosure operation)
- Order of plans (debt cleanup first vs gates first)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements & prior gates
- `.planning/ROADMAP.md` — Phase 6 goal + 3 success criteria
- `.planning/REQUIREMENTS.md` — QA-01, QA-02, QA-03 definitions
- `.planning/phases/05-premium-3d-layer/deferred-items.md` — the two debt items folded into this phase (prettier drift details incl. suggested fix; demo-route failure)
- `.planning/phases/05-premium-3d-layer/05-VERIFICATION.md` — what Phase 5 already proved (avoid re-proving; extend)

### Existing test & gate surfaces (extend, don't duplicate)
- `tests/a11y.e2e.ts` — existing 5-route axe gate (Accessible) — D-10 extends this over both modes
- `tests/a11y-keyboard.e2e.ts` — existing keyboard E2E (Accessible mode)
- `tests/premium.e2e.ts` — 6 premium tests incl. the lazy-gate/zero-premium-JS network assertion (QA-02's seed) and PRM/toggle coverage
- `tests/mode.e2e.ts` — toggle persistence/announcement seed for D-04's automated half
- `scripts/check-premium-budget.mjs` + `.github/workflows/deploy.yml` — the static zero-WebGL CI gate and the gate ordering pattern D-09 must follow (three-pin → contrast → build → premium-budget → [new E2E subset] → upload)
- `playwright.config.ts` — port 4173, BASE_PATH pinned, reuseExistingServer (KNOWN TRAP: a stale server on 4173 — even IPv6-only — poisons runs; kill before suites)

### Mode & premium systems under test
- `src/lib/mode/mode.svelte.ts`, `src/lib/mode/resolve.ts`, `src/lib/mode/constants.ts` — mode store, precedence, `did2:mode` storage key, `data-mode` attr
- `src/lib/premium/README.md` — fence contract
- `src/routes/+layout.svelte` — the single premium gate + `data-webgl` stamp + aria-live announce region

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- @axe-core/playwright already installed and wired in `tests/a11y.e2e.ts` — mode parameterization is a loop, not new tooling
- E2E mode-seeding pattern (localStorage `did2:mode` via init script) established in `tests/premium.e2e.ts` — reuse for both-modes matrices
- `getByRole('switch')` + dispatchEvent('click') actionability pattern (Phase 3) for toggle-driven tests
- deploy.yml already has the blocking-gate-before-upload pattern (contrast, premium-budget) — the E2E subset slots into the same chain

### Established Patterns
- All vitest invocations use `--run`; Playwright single-shot; no watch modes (Nyquist rule)
- Executors must keep touched files prettier-clean; after D-11 the whole repo is clean and `pnpm lint` becomes a hard gate again
- Premium CSS is gated `:not([data-webgl='no'])`; `data-motion` reflects pause state — SR/axe tests can key off these attributes

### Integration Points
- `deploy.yml` step chain (D-09 inserts the E2E subset before `upload-pages-artifact`)
- `.prettierignore` (D-11 adds `.planning/`)
- Deleting `src/routes/demo/playwright` also removes its `page.svelte.e2e.ts` from the testMatch glob

</code_context>

<specifics>
## Specific Ideas

- One quality bar, not two: Premium mode is held to the identical 0-violation axe standard as Accessible — the org's mission makes a two-tier standard unacceptable.
- The SR walkthrough must prove a specific claim: the WebGL canvas is *silent* — an NVDA user in Premium mode gets the exact same experience as in Accessible mode.

</specifics>

<deferred>
## Deferred Ideas

- VoiceOver (macOS/iOS) walkthrough — future verification when Apple hardware is available (D-02)
- Lighthouse perf/best-practices audit — declined for this phase (D-13); candidate for a post-v1 pass
- Milestone wrap-up (/gsd:audit-milestone, /gsd:complete-milestone, README) — separate user-triggered step after Phase 6
- Content-capture pass (mission/testimonials/press/socials from Eman) — standing blocker, not a QA concern

</deferred>

---

*Phase: 06-verification-polish*
*Context gathered: 2026-07-06*
