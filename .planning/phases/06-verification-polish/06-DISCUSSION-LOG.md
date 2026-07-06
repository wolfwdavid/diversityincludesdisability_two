# Phase 6: Verification & Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-06
**Phase:** 06-verification-polish
**Areas discussed:** Screen-reader walkthrough (QA-03), Premium-mode axe standard (QA-01), CI scope for E2E gates (QA-02), Polish scope

---

## Screen-reader walkthrough (QA-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid: automated + guided NVDA | Automated ARIA/landmark/live-region assertions as CI-proof + step-by-step NVDA checklist (HUMAN-UAT) for a one-time real walkthrough | ✓ |
| Manual NVDA only | Guided checklist, no new automated assertions | |
| Automated proxy only | Aria-snapshot assertions stand in for the human pass | |

| Option | Description | Selected |
|--------|-------------|----------|
| NVDA on Windows only | One thorough walkthrough; VoiceOver deferred until Mac access | ✓ |
| NVDA + Windows Narrator | Second engine cheaply, less representative | |
| NVDA + VoiceOver | Original QA-03 wording; requires Apple hardware | |

| Option | Description | Selected |
|--------|-------------|----------|
| Full parity sweep | Identical checklist on every page in BOTH modes — proves canvas silence | ✓ |
| Spot-check premium | Full Accessible walkthrough; Premium spot-checks only | |

| Option | Description | Selected |
|--------|-------------|----------|
| Both: automated + human ear | Automated aria-live text assertion + NVDA listening step | ✓ |
| Automated only | Trust Phase-3 aria-live implementation | |

**User's choice:** All recommended options.

---

## Premium-mode axe standard (QA-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Strict 0 violations, same as Accessible | One standard, 5 routes × 2 modes = 10 gated combinations | ✓ |
| Serious/critical only in Premium | QA-01's literal wording; two-tier standard | |

| Option | Description | Selected |
|--------|-------------|----------|
| Fix in-phase until 0 | Premium axe findings are Phase 6 work | ✓ |
| Triage: fix critical, log minor | Faster completion, leaves debt | |

| Option | Description | Selected |
|--------|-------------|----------|
| Steady-state + post-toggle | 10 settled scans + post-toggle scan per mode landing page | ✓ |
| Steady-state only | 10 scans; toggling covered functionally elsewhere | |

**User's choice:** All recommended options.

---

## CI scope for E2E gates (QA-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Gate subset in CI | Tagged critical subset in deploy.yml (zero-WebGL network assert, axe both modes, toggle smoke); full suite stays local | ✓ |
| Full suite in CI | ~30 min per deploy, more flake surface | |
| Static gate only | Keep CI as-is; E2E local-only | |

| Option | Description | Selected |
|--------|-------------|----------|
| Blocking, before upload | Same pattern as contrast/budget gates | ✓ |
| Separate non-blocking workflow | Faster iteration, weaker guarantee | |

| Option | Description | Selected |
|--------|-------------|----------|
| Extend tests/a11y.e2e.ts | Parameterize existing axe test over both modes | ✓ |
| Separate audit script | Standalone axe runner outside the test suite | |

**User's choice:** All recommended options.

---

## Polish scope

| Option | Description | Selected |
|--------|-------------|----------|
| Prettier re-baseline | .planning/ into .prettierignore + one mechanical format commit; pnpm lint green again | ✓ |
| Delete demo/playwright route | Remove scaffold leftover + its broken base-path E2E | ✓ |
| Neither — QA gates only | Debt stays logged | |

| Option | Description | Selected |
|--------|-------------|----------|
| No — verification only | Art direction approved as-is; no visual pass | ✓ |
| Light perf/UX audit | Lighthouse scores recorded, no hard gate | |
| I have specific tweaks | User-described polish tasks | |

| Option | Description | Selected |
|--------|-------------|----------|
| No — stop at phase complete | Milestone archiving is its own explicit step | ✓ |
| Yes — include milestone wrap-up | Fold audit + completion into the phase | |

**User's choice:** Both debt items folded in; verification only; stop at phase complete.

---

## Claude's Discretion

- SR proxy assertion vocabulary (aria snapshots vs targeted role/name/landmark assertions)
- CI subset tagging/selection mechanism and browser caching
- NVDA checklist structure/granularity
- Plan ordering (debt cleanup vs gates first)

## Deferred Ideas

- VoiceOver walkthrough (needs Apple hardware)
- Lighthouse audit (post-v1 candidate)
- Milestone wrap-up (separate step)
- Content-capture pass from Eman (standing blocker, not QA)
