---
phase: 2
slug: content-source-of-truth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (installed) + svelte-check (installed) |
| **Config file** | vite.config.ts (vitest workspace) / tsconfig.json |
| **Quick run command** | `pnpm vitest run src/lib/content` |
| **Full suite command** | `pnpm vitest run && pnpm check` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/lib/content`
- **After every plan wave:** Run `pnpm vitest run && pnpm check`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-xx | 01 | 1 | CONT-01 | unit (type) | `pnpm vitest run src/lib/content` | ❌ W0 | ⬜ pending |
| 02-01-xx | 01 | 1 | CONT-03 | unit (invariant) | `pnpm vitest run src/lib/content` | ❌ W0 | ⬜ pending |
| 02-02-xx | 02 | 2 | CONT-02 | unit (parity) | `pnpm vitest run src/lib/content` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky · Concrete task IDs filled by planner.*

---

## Wave 0 Requirements

- [ ] `src/lib/content/content.spec.ts` — parity + no-fabrication invariant tests for CONT-01/02/03
- [ ] Content-pending invariant: every `ContentPending` slot has no attribution; every `Published` slot has required `attribution` — a "quote without source" must fail typecheck OR test
- [ ] Parity invariant: the single content barrel is the only content import surface (no per-mode content duplication)

*Existing infrastructure (vitest + svelte-check) covers the framework — no install needed. Wave 0 authors the spec stubs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Copy matches the live Wix site (nav, services, bio, mission, contact) | CONT-01 | Wix is client-rendered; real wording must be captured by a human from diversityincludesdisability.org | Open the live site, compare each string in `src/lib/content/*.ts` against the rendered page; confirm no invented copy |
| Social handles are real, not Wix placeholders | CONT-03 | Handles must be confirmed with Eman; unverifiable ones marked `pending` | Verify each social URL resolves to DID/Eman's actual account, or is marked `status: 'pending'` |
| Only real social-proof is published (MBP training); all else pending | CONT-03 | Judgment call on what counts as attributable | Confirm no fabricated testimonials/press/logos; empty slots render as "content pending" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
