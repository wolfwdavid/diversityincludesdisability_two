---
phase: 01-foundation-tokens-live-deploy
plan: 03
subsystem: infra
tags: [github-pages, github-actions, ci-cd, deploy, sveltekit, adapter-static, pnpm, base-path]

# Dependency graph
requires:
  - phase: 01-01-scaffold-stack-static-config
    provides: Buildable adapter-static SvelteKit app, BASE_PATH-aware config, static/.nojekyll, trailingSlash 'always' + 404 fallback, scripts/check-three-pin.mjs lockfile gate
  - phase: 01-02-tokens-contrast-gate-premium-guard
    provides: scripts/check-contrast.mjs A11Y-06 gate, DID-token styled home placeholder (visible live proof)
provides:
  - .github/workflows/deploy.yml — official two-job (build + deploy) GitHub Pages pipeline gating on three-pin + contrast before build, BASE_PATH injected, deploy-pages@v5
  - Live site at https://wolfwdavid.github.io/diversityincludesdisability_two/ (HTTP 200, DID tokens render, _app/ assets serve from subpath, deep links resolve, SPA 404 fallback)
  - pnpm 11.6 allowBuilds fix (esbuild build-script approval) — the load-bearing change that made CI install/build green
affects: [phase-2-content, phase-3-mode-state, phase-4-sections, phase-5-premium-3d, phase-6-verification]

# Tech tracking
tech-stack:
  added:
    - "GitHub Actions Pages pipeline: checkout@v7, pnpm/action-setup@v6, setup-node@v6 (Node 24), upload-pages-artifact@v5, deploy-pages@v5"
  patterns:
    - "Two-job Pages deploy: build job runs both quality gates (three-pin, contrast) BEFORE building with BASE_PATH=/${{ github.event.repository.name }}; separate deploy job publishes the artifact via the official Pages Action (Jekyll never runs)"
    - "pnpm 11.6 build-script approval lives in pnpm-workspace.yaml `allowBuilds:` (package -> boolean map), NOT the renamed/ignored `onlyBuiltDependencies` list"
    - "CI gates are build-blocking on every push to main: a red gate step fails the deploy, not the site"

key-files:
  created:
    - .github/workflows/deploy.yml
  modified:
    - pnpm-workspace.yaml

key-decisions:
  - "pnpm 11.6 renamed `onlyBuiltDependencies` to the `allowBuilds` package->boolean map; the old key is silently ignored, so esbuild's postinstall never ran and CI `pnpm install --frozen-lockfile` failed with ERR_PNPM_IGNORED_BUILDS (vite build then could not find its esbuild binary). Approving esbuild via `allowBuilds: { esbuild: true }` is the load-bearing fix that made CI green — future plans adding any build-script dependency MUST use `allowBuilds`, not `onlyBuiltDependencies`."
  - "Deploy via the official GitHub Pages Action (deploy-pages@v5 + upload-pages-artifact@v5) rather than a gh-pages branch — bypasses Jekyll entirely and needs no committed build output; resolves the Phase-1 open blocker on deploy method."
  - "Pages source set to 'GitHub Actions' (build_type=workflow) via `gh api`, the one repo setting that cannot be scripted from the workflow itself."

patterns-established:
  - "Quality gates run in CI before build, blocking deploy on regression (three-pin lockfile pin + WCAG 2.2 AA contrast)"
  - "BASE_PATH injected only in CI from the repo name so local builds stay root-relative and Pages builds are subpath-aware"

requirements-completed: [FOUND-01, FOUND-02, FOUND-03]

# Metrics
duration: 35min
completed: 2026-07-04
---

# Phase 01 Plan 03: Pages Deploy Workflow — Live Summary

**Official two-job GitHub Pages pipeline (gates on three-pin + contrast, injects BASE_PATH, deploys via deploy-pages@v5) takes the DID-token site live at its repo subpath — FOUND-01/02/03 proven green on the real host, unblocked only after fixing pnpm 11.6's silent `onlyBuiltDependencies`→`allowBuilds` key rename.**

## Performance

- **Duration:** ~35 min (Task-1 commit through live-URL verification; per-task commits span 18:38–18:51 EDT)
- **Started:** 2026-07-04T18:38:14-04:00
- **Completed:** 2026-07-04
- **Tasks:** 2 (1 auto, 1 human-verify checkpoint — resolved with user authorization)
- **Files created/modified:** 2 (deploy.yml created, pnpm-workspace.yaml fixed)

## Accomplishments
- Authored `.github/workflows/deploy.yml` verbatim from RESEARCH: a `build` job (checkout@v7 → pnpm/action-setup@v6 → setup-node@v6 Node 24 → `pnpm install --frozen-lockfile` → `node scripts/check-three-pin.mjs` → `node scripts/check-contrast.mjs` → `pnpm build` with `BASE_PATH: '/${{ github.event.repository.name }}'` → upload-pages-artifact@v5) and a dependent `deploy` job publishing via deploy-pages@v5. Both gates run BEFORE the build; `permissions` grants `pages: write` + `id-token: write`; `concurrency.group: pages`.
- Took the site LIVE: public repo `wolfwdavid/diversityincludesdisability_two` created and `main` pushed, Pages source set to GitHub Actions, and the deploy run for `dc25825` is GREEN (build + deploy jobs both pass).
- Diagnosed and fixed a CI-blocking pnpm 11.6 gotcha (the `allowBuilds` key rename) that had left esbuild's postinstall un-run — the fix that turned the pipeline green and a real trap future phases must not regress.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the official GitHub Pages deploy workflow** - `90dd0ed` (feat)
2. **Deviation fix (during Task 2): pnpm 11.6 allowBuilds esbuild approval** - `dc25825` (fix)

Task 2 was a `checkpoint:human-verify` gate (repo Pages setting + live-URL verification) — no source commit of its own; resolved by the orchestrator with the user's authorization.

**Plan metadata:** this SUMMARY + STATE/ROADMAP/REQUIREMENTS docs commit.

## Files Created/Modified
- `.github/workflows/deploy.yml` - two-job Pages pipeline: gates (three-pin, contrast) → build with BASE_PATH → upload artifact → deploy via deploy-pages@v5
- `pnpm-workspace.yaml` - replaced the ignored `onlyBuiltDependencies` list with `allowBuilds: { esbuild: true }` so esbuild's build script runs under pnpm 11.6 (kept the existing `overrides: three: 0.175.0` pin)

## Decisions Made
- **`allowBuilds`, not `onlyBuiltDependencies`.** pnpm 11.6 renamed the build-script allow-list to a package→boolean map and silently ignores the old key. The stale key meant esbuild never linked its binary, so CI `pnpm install --frozen-lockfile` errored `ERR_PNPM_IGNORED_BUILDS` and `vite build` could not find esbuild. `allowBuilds: { esbuild: true }` is the load-bearing fix. Any future plan that adds a dependency with a postinstall/build script must register it under `allowBuilds`. See deviation below.
- **Official Pages Action over a gh-pages branch.** deploy-pages@v5 + upload-pages-artifact@v5 skip Jekyll and need no committed `build/` output — resolves the Phase-1 "decide deploy method" blocker.
- **Pages source = GitHub Actions** set via `gh api` (build_type=workflow) — the single repo setting the workflow cannot set for itself.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] pnpm 11.6 silently ignored `onlyBuiltDependencies`, breaking CI install/build**
- **Found during:** Task 2 (first live CI run of the new deploy workflow)
- **Issue:** pnpm 11.6 RENAMED the build-script allow-list from the `onlyBuiltDependencies` array to an `allowBuilds` package→boolean map. The old key carried over from Phase-01-01 was silently ignored, so esbuild's postinstall never ran. In CI, `pnpm install --frozen-lockfile` failed with `ERR_PNPM_IGNORED_BUILDS` and the build step could not locate esbuild's binary — the deploy job could never go green.
- **Fix:** Replaced the ignored key in `pnpm-workspace.yaml` with `allowBuilds:\n  esbuild: true` (documented inline), preserving the existing `overrides: three: 0.175.0` pin.
- **Files modified:** pnpm-workspace.yaml
- **Verification:** The deploy run for commit `dc25825` is GREEN — build job installs with esbuild built and `pnpm build` produces the static bundle; deploy job publishes it.
- **Committed in:** `dc25825` (fix)
- **Forward guidance:** Future phases adding any build-script dependency MUST register it under `allowBuilds` (NOT `onlyBuiltDependencies`), or pnpm 11.6 will silently skip the build and CI will fail the same way.

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking, required to complete the live deploy).
**Impact on plan:** The workflow landed verbatim as specified; the only additional change is the pnpm 11.6 key rename, which was a hard prerequisite for a green CI run. No scope creep.

## Issues Encountered
- The pnpm 11.6 `allowBuilds` rename above was the sole blocker; once fixed, the pipeline went green on the next push. No gate-step (three-pin / contrast) failures occurred — both quality gates passed in CI.

## Live Verification

Live URL: **https://wolfwdavid.github.io/diversityincludesdisability_two/**

| Check | Result |
|-------|--------|
| Home page (`/`) | HTTP 200 — DID blue heading + orange CTA render (tokens live, no unstyled flash) |
| Asset `/_app/immutable/entry/start.BqgOy_LD.js` | HTTP 200 — `_app/` assets serve from the subpath via base-aware relative `./_app/` URLs |
| Deep link `/demo/` (trailing slash) | HTTP 200 — deep links resolve on hard refresh |
| Nonexistent route | Serves `404.html` — correct SPA fallback |

This proves FOUND-01 (static prerendered bundle deployed), FOUND-02 (subpath assets load, `.nojekyll` honored), and FOUND-03 (deep links / refreshes resolve without a 404) on the real host.

## User Setup Required
**One-time repo setting performed:** Repo → Settings → Pages → Build and deployment → Source = **GitHub Actions** (set via `gh api`, build_type=workflow). No secrets or environment variables required — the workflow uses the default `GITHUB_TOKEN` with `pages: write` + `id-token: write`.

## Next Phase Readiness
- Phase 1 is complete: all three plans done, the site is live and green, and every push to `main` now re-gates (three-pin + contrast) and re-deploys automatically. Phase 2 (Content Source of Truth) can build on a proven live-deploy foundation — new content will ship to the subpath on merge with no deploy risk remaining.
- **Carry-forward gotcha:** any new build-script dependency must be added to `allowBuilds` in `pnpm-workspace.yaml`.

## Self-Check: PASSED

`.github/workflows/deploy.yml` present (contains deploy-pages@v5, upload-pages-artifact@v5, both gate scripts, BASE_PATH, node-version 24); `pnpm-workspace.yaml` contains `allowBuilds: esbuild: true`. Both commits exist in git history (`90dd0ed`, `dc25825`) and are pushed to origin/main. Live URL returns HTTP 200 with DID tokens rendered.

---
*Phase: 01-foundation-tokens-live-deploy*
*Completed: 2026-07-04*
