---
phase: 3
slug: mode-state-system-toggle
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-05
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (2-project split: `server` node env + `client` jsdom env — from Phase 2) |
| **Config file** | `vite.config.ts` / `vitest-setup-*.ts` (existing) |
| **Quick run command** | `pnpm exec vitest run --project server src/lib/mode` |
| **Full suite command** | `pnpm exec vitest run` |
| **Estimated runtime** | ~15 seconds |

*Note: `package.json` `test` script currently calls `npm run` internally — a Wave 0 task switches it to `pnpm` (flagged in RESEARCH.md).*

---

## Sampling Rate

- **After every task commit:** Run `pnpm exec vitest run --project server src/lib/mode`
- **After every plan wave:** Run `pnpm exec vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

> Populated by gsd-planner during planning (Wave 0 seeds RED specs, later waves turn them GREEN).

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | — | 0 | MODE-* | unit | `pnpm exec vitest run --project server src/lib/mode` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/mode/resolveMode.spec.ts` — precedence truth table (stored > reduced-motion > no-WebGL > default) for MODE-02/03
- [ ] `src/lib/mode/store.spec.ts` — store hydration + localStorage write-through (namespaced key `did2:mode`) for MODE-01/04
- [ ] `src/lib/mode/toggle.a11y.spec.ts` — switch semantics (`role="switch"`/`aria-checked`), aria-live region, focus for MODE-05/06/07
- [ ] No new framework install — Vitest 2-project split already present from Phase 2

*Manual/e2e (no-flash before first paint) may need a Playwright check — planner to confirm.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No flash of wrong mode before first paint | MODE-03 | FOUC timing is pre-hydration; hard to assert in unit env | Load page with a stored non-default mode; confirm `<html data-mode>` is correct in initial HTML (view-source / Playwright first-paint screenshot) |
| Screen-reader announcement of mode change | MODE-06 | Requires AT | Toggle with NVDA/VoiceOver; confirm the `aria-live` region announces the new mode |

*Automated coverage targets the resolver, store, and ARIA attributes; the two rows above are the residual manual checks.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
