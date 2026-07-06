---
phase: 5
slug: premium-3d-layer
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-06
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.x (`server` node project + `client` browser project) + Playwright ^1.60 E2E (`**/*.e2e.{ts,js}`) + node gate scripts |
| **Config file** | `vite.config.ts` (vitest projects), `playwright.config.ts` (port 4173, BASE_PATH pinned, reuseExistingServer) |
| **Quick run command** | `pnpm exec vitest --run --project=server` |
| **Full suite command** | `pnpm check && pnpm lint && pnpm exec vitest --run && pnpm build && node scripts/check-contrast.mjs && node scripts/check-premium-budget.mjs && pnpm exec playwright test` |
| **Estimated runtime** | quick ~5s; full ~4-6 min (build + preview-backed E2E) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm exec vitest --run --project=server && pnpm check`
- **After every plan wave:** Run full unit (both projects) + `pnpm build && node scripts/check-contrast.mjs` (+ `node scripts/check-premium-budget.mjs` once it exists, Wave 3)
- **Before `/gsd:verify-work`:** Full suite must be green (known exception: pre-existing `src/routes/demo/playwright` base-path failure, logged in Phase-4 deferred-items.md — not Phase-5 debt)
- **Max feedback latency:** ~360 s (full E2E); ~10 s for the per-commit quick loop

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PREM-01 (dark skin, A11Y-06 continuity) | script | `node scripts/check-contrast.mjs` (12 pairs) | ✅ script exists; pairs added by task | ⬜ pending |
| 05-01-02 | 01 | 1 | PREM-01 (scrim/stacking shell) | lint+build | `pnpm lint && pnpm build` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 1 | PREM-03 (dynamic-import fence) | lint probe | `pnpm exec eslint .` + probe-file negative test | ✅ eslint present | ⬜ pending |
| 05-02-02 | 02 | 1 | PREM-04, PREM-06 (motion truth table), D-08 (tier) | unit (node) | `pnpm exec vitest --run --project=server` (tier.spec, motion-logic.spec) | ❌ created RED-first in task | ⬜ pending |
| 05-02-03 | 02 | 1 | PREM-02 (route→world map, Pitfall 8) | unit (node) | `pnpm exec vitest --run --project=server` (worldState.spec) | ❌ created RED-first in task | ⬜ pending |
| 05-03-01 | 03 | 2 | PREM-01/02/04/05/06 (host, rig, world state) | type+lint | `pnpm check && pnpm exec eslint src/lib/premium/` | ✅ | ⬜ pending |
| 05-03-02 | 03 | 2 | PREM-01 (procedural objects), D-01/03/05 | type+lint | `pnpm check && pnpm exec eslint src/lib/premium/` | ✅ | ⬜ pending |
| 05-03-03 | 03 | 2 | PREM-03 (the one gate), Pitfall 5 stamp | build grep | `pnpm build` + entry/nodes signature-free + chunk exists | ✅ (bash one-liner in plan) | ⬜ pending |
| 05-04-01 | 04 | 3 | PREM-03, D-07 (budget + partition) | build script | `pnpm build && node scripts/check-premium-budget.mjs` | ❌ script IS the deliverable | ⬜ pending |
| 05-04-02 | 04 | 3 | PREM-03 (CI enforcement) | lint+awk | `pnpm lint` + step-order awk assertion | ✅ | ⬜ pending |
| 05-05-01 | 05 | 3 | PREM-01/03/04 + Success Criteria 5 | e2e | `pnpm exec playwright test tests/premium.e2e.ts` (tests 1-3) | ❌ created by task | ⬜ pending |
| 05-05-02 | 05 | 3 | PREM-02/05/06 | e2e | `pnpm exec playwright test tests/premium.e2e.ts tests/mode.e2e.ts` (tests 4-6) | ❌ created by task | ⬜ pending |
| 05-05-03 | 05 | 3 | D-01/02/03/13/14 (art direction) | human checkpoint | manual walkthrough (see plan) | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 gaps from 05-RESEARCH.md are satisfied structurally by the plan design rather than a separate Wave 0 plan:

- [x] `src/lib/premium/state/*.spec.ts` — created RED-first inside the TDD tasks of 05-02 (Wave 1, before any Svelte/Three code)
- [x] `eslint.config.js` no-restricted-syntax guard — 05-02 Task 1 (Wave 1, before the gate exists)
- [x] `pairs.ts` dark-pair entries — 05-01 Task 1 (Wave 1, before any dark CSS ships)
- [x] `scripts/check-premium-budget.mjs` — 05-04 (cannot run earlier: Vite only emits the premium chunk once the 05-03 gate references it; the script asserts the premium set is NON-EMPTY, so it would fail vacuously in Waves 1-2)
- [x] `tests/premium.e2e.ts` — 05-05 (same build-dependency reasoning; the DOM contracts it asserts — `.premium-backdrop`, `data-motion`, `data-webgl` — are specified in the 05-03 plan text, so the tests verify a contract, not an implementation accident)
- [x] `deploy.yml` budget step — 05-04 Task 2
- Framework install: none — all tooling present

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Crystalline art direction reads as calm/dignified in the DID palette | D-01/D-02/D-03 (under PREM-01) | Aesthetic judgment — automation can prove a canvas renders, not that it looks right | 05-05 Task 3 checkpoint: preview walkthrough of all 5 routes in Premium, scroll + pointer, quiet-room check |
| 60fps feel on mid-range hardware | D-07 (perf half) | Frame pacing perception; CI runs SwiftShader (software GL, unrepresentative) | During the same checkpoint: scroll Home + Services watching for stutter; report if visibly choppy |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (see rationale above for the two build-dependent gates)
- [x] No watch-mode flags (all vitest invocations use `--run`; playwright is single-shot)
- [x] Feedback latency < 360s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-07-06 (plan-phase)
