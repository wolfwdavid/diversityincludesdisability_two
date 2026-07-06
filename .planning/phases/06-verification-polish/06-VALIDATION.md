---
phase: 6
slug: verification-polish
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-06
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.x (`server` node project + `client` browser project) + Playwright ^1.60 E2E (`**/*.e2e.{ts,js}`) + node gate scripts (contrast, premium-budget) |
| **Config file** | `vite.config.ts` (vitest projects), `playwright.config.ts` (port 4173, BASE_PATH pinned, reuseExistingServer — KNOWN TRAP: kill stale 4173 before every suite) |
| **Quick run command** | `pnpm lint && pnpm check` (~15s; lint is a standing gate again after 06-01) |
| **Full suite command** | `pnpm lint && pnpm check && pnpm exec vitest --run && pnpm exec playwright test && node scripts/check-contrast.mjs && node scripts/check-premium-budget.mjs` |
| **Estimated runtime** | quick ~15s; full ~5-7 min (build + preview-backed E2E, growing from 28 to 46 tests across the phase) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm lint && pnpm check` plus the task's own targeted Playwright file (each task's `<automated>` names it)
- **After every plan wave:** Run the full E2E suite single-shot (`pnpm exec playwright test`) after killing any stale 4173 server
- **Before `/gsd:verify-work`:** Full suite must be green with NO exceptions (the historical demo/playwright exception is deleted by 06-01)
- **Max feedback latency:** ~420 s (full E2E); ~15 s for the per-commit quick loop

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | QA-01/02/03 enabler (D-12 demo deletion) | type+lint+grep | `pnpm check && pnpm exec eslint .` + absence greps | ✅ tooling exists | ⬜ pending |
| 06-01-02 | 01 | 1 | QA-01/02/03 enabler (D-11 prettier re-baseline) | lint+unit | `pnpm lint && pnpm check && pnpm exec vitest --run` | ✅ | ⬜ pending |
| 06-01-03 | 01 | 1 | green baseline (all QA gates' substrate) | e2e full | `pnpm exec playwright test` → 28 passed | ✅ (suite exists) | ⬜ pending |
| 06-02-01 | 02 | 2 | QA-01 (D-05/07/10 matrix authoring) | e2e list+lint | `playwright test tests/a11y.e2e.ts --list` → 12 @ci tests | ❌ rewritten by task (extends existing file) | ⬜ pending |
| 06-02-02 | 02 | 2 | QA-01 (D-06 fix-in-phase to strict 0) | e2e+script | `playwright test tests/a11y.e2e.ts` → 12 passed + `check-contrast.mjs` all PASS | ✅ after 06-02-01 | ⬜ pending |
| 06-03-01 | 03 | 3 | QA-02 (network-level zero-WebGL, all routes) | e2e | `playwright test tests/premium.e2e.ts tests/mode.e2e.ts` → 10 passed | ❌ test added by task (SIG mirrored from budget script) | ⬜ pending |
| 06-03-02 | 03 | 3 | QA-02 (D-08/09 CI blocking gate) | awk order+e2e subset | awk step-order assertion + `playwright test --grep "@ci"` → 14 passed | ✅ deploy.yml exists | ⬜ pending |
| 06-04-01 | 04 | 4 | QA-03 (keyboard half, both modes) | e2e | `playwright test tests/a11y-keyboard.e2e.ts` → 6 passed | ❌ parameterized by task | ⬜ pending |
| 06-04-02 | 04 | 4 | QA-03 (D-01/03/04 SR proxies) | e2e | `playwright test tests/sr-parity.e2e.ts tests/a11y-keyboard.e2e.ts` → 12 passed | ❌ sr-parity.e2e.ts created by task | ⬜ pending |
| 06-05-01 | 05 | 5 | QA-03 (D-01 checklist artifact) | file+grep | `test -f 06-HUMAN-UAT.md` + section-count/literal greps | ❌ created by task | ⬜ pending |
| 06-05-02 | 05 | 5 | QA-03 (human half, D-01..D-04) | human checkpoint | manual NVDA walkthrough per 06-HUMAN-UAT.md | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — no framework install, no separate Wave 0 plan. The "❌ created by task" entries above are legitimate for a verification phase: the test files ARE the deliverables (E2E gates asserting already-shipped, Phase-3/4/5-verified behavior), not TDD scaffolds for new features. Same reasoning approved in 05-VALIDATION.md for the build-dependent gates. Two structural notes:

- [x] Wave 1 (06-01) deletes the one known-red test and restores `pnpm lint` BEFORE any gate is authored, so every later task inherits a green substrate and a working lint gate.
- [x] The @ci subset count (14) is frozen by 06-03 acceptance and re-asserted by 06-04 acceptance, preventing silent CI-scope drift.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| NVDA speaks the pages correctly: reading order, announcement audibility, canvas silence as HEARD by a human | QA-03 (D-01 human half, D-02 NVDA-only bar, D-03 parity, D-04 announcement) | Automation proves the accessible tree (06-04 aria snapshots) but cannot run NVDA or judge speech output; CI is headless Linux, NVDA is Windows-only | 06-05 Task 2 checkpoint: work through `.planning/phases/06-verification-polish/06-HUMAN-UAT.md` (2 global + 10 page-mode sections), fill sign-off block |

All other Phase-6 behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (06-05-02 is the phase's single sanctioned human checkpoint)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (every auto task carries a runnable `<automated>` command)
- [x] Wave 0 covers all MISSING references (structural — see rationale above)
- [x] No watch-mode flags (all vitest invocations use `--run`; playwright single-shot; `--list` for enumeration checks)
- [x] Feedback latency < 420s (quick loop ~15s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-07-06 (plan-phase)
