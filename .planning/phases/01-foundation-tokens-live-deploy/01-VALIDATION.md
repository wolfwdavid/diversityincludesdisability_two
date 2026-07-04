---
phase: 1
slug: foundation-tokens-live-deploy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 1 requirements are mostly build/deploy/CI gates rather than component unit tests, so the validation map leans on Node gate scripts + build-output asserts + a post-deploy live smoke check. See `01-RESEARCH.md` → Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.9 (from scaffold) + Node gate scripts in `scripts/`; Playwright 1.61.1 reserved for later phases |
| **Config file** | `vitest.config.ts` (scaffolded); gate scripts `scripts/check-three-pin.mjs`, `scripts/check-contrast.mjs` |
| **Quick run command** | `node scripts/check-three-pin.mjs && node scripts/check-contrast.mjs` |
| **Full suite command** | `pnpm build && test -f build/index.html && node scripts/check-three-pin.mjs && node scripts/check-contrast.mjs` |
| **Estimated runtime** | ~30 seconds (build dominates; gate scripts are sub-second) |

---

## Sampling Rate

- **After every task commit:** Run `node scripts/check-three-pin.mjs && node scripts/check-contrast.mjs` (fast, no build)
- **After every plan wave:** Run `pnpm build` + the two gate scripts + `build/` structure asserts
- **Before `/gsd:verify-work`:** Full suite green + live smoke (deployed URL loads with `_app/` 200s, deep-linked sub-route returns 200 on hard refresh, `pnpm-lock.yaml` shows `three@0.175.0` only)
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

Task IDs are assigned by the planner; this map lists the requirement → automated command binding the plans must honor.

| Requirement | Wave | Test Type | Automated Command | File Exists | Status |
|-------------|------|-----------|-------------------|-------------|--------|
| FOUND-01 | 1 | smoke | `pnpm build && test -f build/index.html && test ! -d build/server` | ❌ W0 | ⬜ pending |
| FOUND-02 | 1 | smoke | `test -f build/.nojekyll && test -d build/_app`; live: `curl -fsSL <site>/_app/... == 200` | ❌ W0 | ⬜ pending |
| FOUND-03 | 1 | smoke | `test -f build/<route>/index.html && test -f build/404.html`; live: `curl -o /dev/null -w '%{http_code}' <site>/<route>/ == 200` | ❌ W0 | ⬜ pending |
| FOUND-04 | 1 | unit | `node scripts/check-three-pin.mjs` | ❌ W0 | ⬜ pending |
| A11Y-06 | 1 | unit | `node scripts/check-contrast.mjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/check-three-pin.mjs` — FOUND-04 lockfile assertion (asserts `pnpm-lock.yaml` resolves `three` to only `0.175.0`)
- [ ] `scripts/check-contrast.mjs` — A11Y-06 culori WCAG gate over `src/lib/tokens/colors.ts` + `pairs.ts`
- [ ] `src/lib/tokens/{colors,pairs}.ts` (+ `tokens.css`) — single token source the contrast gate reads
- [ ] `.github/workflows/deploy.yml` — FOUND-01/02/03 build + deploy pipeline (runs both gate scripts before build)
- [ ] `static/.nojekyll` — FOUND-02 `_app/` asset serving
- [ ] `svelte.config.js` (`adapter-static`, `fallback: '404.html'`, `paths.base`) + `src/routes/+layout.ts` (`prerender = true`, `trailingSlash = 'always'`)
- [ ] Framework/tooling install: `pnpm add -D @sveltejs/adapter-static culori` (Vitest/Playwright from scaffold selection)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pages source set to "GitHub Actions" | FOUND-02 | Repo Settings toggle cannot be scripted from the workflow | Repo → Settings → Pages → Source: **GitHub Actions** (not "Deploy from a branch"), once |
| Styled page renders with DID tokens on the live URL | A11Y-06 / FOUND-02 | Visual confirmation the token palette applied and reads correctly | Visit `https://wolfwdavid.github.io/diversityincludesdisability_two/`, confirm the placeholder home renders with DID blue/orange tokens and no unstyled flash |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify command or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (gate scripts + token source + workflow)
- [ ] No watch-mode flags in any command
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter once plans encode the per-task map

**Approval:** pending
