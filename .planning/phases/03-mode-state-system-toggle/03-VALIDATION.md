---
phase: 3
slug: mode-state-system-toggle
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-05
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (2-project split: `server` node env + `client` chromium browser env — from Phase 2) + Playwright (E2E) |
| **Config file** | `vite.config.ts` (defines server + client projects) / `playwright.config.ts` (testMatch `**/*.e2e.ts`) |
| **Quick run command** | `pnpm exec vitest run --project server src/lib/mode` |
| **Full unit command** | `pnpm exec vitest run` |
| **E2E command** | `pnpm exec playwright test tests/mode.e2e.ts` |
| **Estimated runtime** | ~15 seconds (unit); E2E adds a build+preview |

*Note: `package.json` `test` and `playwright.config.ts` `webServer` both called `npm run` internally — plan 03-01 Task 1 switches them to `pnpm` (flagged in RESEARCH.md).*

---

## Sampling Rate

- **After every task commit:** `pnpm exec vitest run --project server src/lib/mode` (precedence + parity — sub-second)
- **After every plan wave:** `pnpm exec vitest run` (both projects) then `pnpm check`
- **Before `/gsd:verify-work`:** full unit suite green + `pnpm exec playwright test tests/mode.e2e.ts` + `pnpm check` exit 0
- **Max feedback latency:** ~15 seconds (unit)

---

## Per-Task Verification Map

> Wave 1 seeds the precedence RED spec; later waves author + turn each behavior GREEN in the same task (task-level TDD, RED→GREEN).

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File | Status |
|---------|------|------|-------------|-----------|-------------------|------|--------|
| 03-01-T1 | 03-01 | 1 | (tooling) | node assert | `node -e` package.json/playwright pnpm check | package.json, playwright.config.ts | ⬜ pending |
| 03-01-T2 | 03-01 | 1 | MODE-02, MODE-03, MODE-07 | unit (server) | `pnpm exec vitest run --project server src/lib/mode/resolve.spec.ts` | src/lib/mode/resolve.spec.ts | ⬜ pending |
| 03-02-T1 | 03-02 | 2 | MODE-01, MODE-02 | unit (client) | `pnpm exec vitest run --project client src/lib/mode/mode.svelte.spec.ts` | src/lib/mode/mode.svelte.spec.ts | ⬜ pending |
| 03-02-T2 | 03-02 | 2 | MODE-04, MODE-02 | unit (server) | `pnpm exec vitest run --project server src/lib/mode/parity.spec.ts` | src/lib/mode/parity.spec.ts | ⬜ pending |
| 03-03-T1 | 03-03 | 3 | MODE-01, MODE-05, MODE-06 | component (client) | `pnpm exec vitest run --project client src/lib/components/ModeToggle.svelte.spec.ts` | src/lib/components/ModeToggle.svelte.spec.ts | ⬜ pending |
| 03-03-T2 | 03-03 | 3 | MODE-01 | type gate | `pnpm check` | src/routes/+layout.svelte | ⬜ pending |
| 03-03-T3 | 03-03 | 3 | MODE-02, MODE-04, MODE-05 | E2E (Playwright) | `pnpm exec playwright test tests/mode.e2e.ts` | tests/mode.e2e.ts | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Truth-table spec (03-01-T2, `resolve.spec.ts`, node project) — asserted cases:**

| stored | reducedMotion | webgl | expected |
|--------|---------------|-------|----------|
| `'premium'` | true | false | premium (stored wins) |
| `'accessible'` | false | true | accessible (stored wins) |
| `null` | true | true | accessible |
| `null` | false | false | accessible |
| `null` | false | true | **premium** (LOCKED default) |
| `'garbage'` | false | true | premium (invalid stored ignored) |

---

## Wave 0 / Seed Requirements

Task-level TDD (`tdd="true"`) means each code task authors its RED spec first, then implements to GREEN — the
spec files are created inside the same wave that consumes them, so there is no separate Wave 0 plan. The
seeded spec artifacts across the phase are:

- [ ] `src/lib/mode/resolve.spec.ts` — precedence truth table (stored > reduced-motion > no-WebGL > premium) — MODE-02/03/07 — **03-01-T2**
- [ ] `src/lib/mode/mode.svelte.spec.ts` — store seed + localStorage write-through (namespaced `did2:mode`) — MODE-01/02 — **03-02-T1**
- [ ] `src/lib/mode/parity.spec.ts` — inline-script ↔ resolver drift guard + pre-paint ordering — MODE-04 — **03-02-T2**
- [ ] `src/lib/components/ModeToggle.svelte.spec.ts` — switch semantics/keyboard/aria-live/focus — MODE-01/05/06 — **03-03-T1**
- [ ] `tests/mode.e2e.ts` — persistence-across-reload + no-flash + scroll-preserved — MODE-02/04/05 — **03-03-T3**
- [ ] No new framework install — Vitest 2-project split + Playwright already present from Phase 1/2

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Screen-reader announcement of mode change | MODE-05 | Requires AT | Toggle with NVDA/VoiceOver; confirm the `aria-live="polite"` region announces "Premium mode enabled" / "Accessible mode enabled" |
| No perceptible flash on a real device | MODE-04 | FOUC timing is pre-hydration; E2E asserts `data-mode` correctness but not perceptual smoothness | Load with a stored non-default mode on a throttled connection; confirm no visible flip (E2E `tests/mode.e2e.ts` covers the attribute-level guarantee) |

*Automated coverage targets the resolver, store, inline-script parity, ARIA attributes, and E2E persistence/no-flash/scroll; the rows above are the residual manual checks deferred to `/gsd:verify-work`.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or seed their own spec in-wave (task-level TDD)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Every MISSING reference is created within the same phase (no dangling test dependency)
- [x] No watch-mode flags
- [x] Feedback latency < 15s (unit)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready for execution
