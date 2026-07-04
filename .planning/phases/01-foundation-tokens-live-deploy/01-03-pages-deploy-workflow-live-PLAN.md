---
phase: 01-foundation-tokens-live-deploy
plan: 03
type: execute
wave: 3
depends_on: [01, 02]
files_modified:
  - .github/workflows/deploy.yml
autonomous: false
requirements: [FOUND-01, FOUND-02, FOUND-03]
user_setup:
  - service: github-pages
    why: "Publish the static build to the live subpath"
    dashboard_config:
      - task: "Set Pages source to GitHub Actions"
        location: "Repo → Settings → Pages → Build and deployment → Source: GitHub Actions"
must_haves:
  truths:
    - "Pushing to main runs a two-job Actions workflow that gates on three-pin + contrast, builds with BASE_PATH injected, and deploys to Pages"
    - "Visiting https://wolfwdavid.github.io/diversityincludesdisability_two/ loads the styled DID-token page with all _app/ assets served (no 404s)"
    - "Hard-refreshing / deep-linking a sub-route (with trailing slash) returns 200, not a 404"
  artifacts:
    - path: ".github/workflows/deploy.yml"
      provides: "official Pages Action pipeline (build + deploy jobs), runs both gate scripts before build"
      contains: "actions/deploy-pages@v5"
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "scripts/check-three-pin.mjs + scripts/check-contrast.mjs"
      via: "run steps before the build step"
      pattern: "check-(three-pin|contrast)"
    - from: ".github/workflows/deploy.yml"
      to: "BASE_PATH env"
      via: "env: BASE_PATH: /${{ github.event.repository.name }} on the build step"
      pattern: "BASE_PATH"
---

<objective>
Wire the official GitHub Pages deploy pipeline and take the site live at its subpath. The workflow runs both gate scripts (three-pin, contrast) before building with `BASE_PATH` injected, packages `build/` as a Pages artifact, and publishes it — proving FOUND-01/02/03 on the real host. A single human step (Pages source = GitHub Actions) and a live-URL verification close the phase.

Purpose: This is where the front-loaded deploy risk actually resolves — assets loading from the subpath and deep links surviving a hard refresh can only be proven live.
Output: `.github/workflows/deploy.yml` and a verified green live deploy.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md
@.planning/phases/01-foundation-tokens-live-deploy/01-VALIDATION.md

<interfaces>
<!-- Gate scripts these steps invoke (created in plans 01 + 02): -->
scripts/check-three-pin.mjs  → exits 0 when lockfile resolves three to only 0.175.0
scripts/check-contrast.mjs   → exits 0 when all token pairs pass WCAG 2.2 AA
<!-- Verified action majors (GitHub Releases API, 2026-07-04): checkout@v7, pnpm/action-setup@v6, -->
<!-- setup-node@v6, upload-pages-artifact@v5, deploy-pages@v5. Node 24. pnpm reads packageManager field. -->
Repo: wolfwdavid/diversityincludesdisability_two
Live URL: https://wolfwdavid.github.io/diversityincludesdisability_two/
BASE_PATH in CI: /${{ github.event.repository.name }} → /diversityincludesdisability_two
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add the official GitHub Pages deploy workflow</name>
  <files>.github/workflows/deploy.yml</files>
  <read_first>
    - .planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md (§ Code Examples: full deploy.yml verbatim; § Standard Stack: Deploy toolchain action versions; deploy-method decision)
    - .planning/phases/01-foundation-tokens-live-deploy/01-VALIDATION.md (Manual-Only Verifications; Sampling Rate → phase gate)
    - package.json (confirm `packageManager: pnpm@11.6.0` so pnpm/action-setup resolves pnpm 11)
  </read_first>
  <action>
    Create `.github/workflows/deploy.yml` with EXACTLY this content (verbatim from RESEARCH § Code Examples — do NOT change action versions; they were verified 2026-07-04):
    ```yaml
    name: Deploy to GitHub Pages
    on:
      push:
        branches: [main]
      workflow_dispatch:

    permissions:
      contents: read
      pages: write
      id-token: write

    concurrency:
      group: pages
      cancel-in-progress: false

    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v7
          - uses: pnpm/action-setup@v6
          - uses: actions/setup-node@v6
            with:
              node-version: 24
              cache: pnpm
          - run: pnpm install --frozen-lockfile
          - name: Verify three pin
            run: node scripts/check-three-pin.mjs
          - name: Contrast gate (A11Y-06)
            run: node scripts/check-contrast.mjs
          - name: Build
            env:
              BASE_PATH: '/${{ github.event.repository.name }}'
            run: pnpm build
          - uses: actions/upload-pages-artifact@v5
            with:
              path: build/
      deploy:
        needs: build
        runs-on: ubuntu-latest
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        steps:
          - id: deployment
            uses: actions/deploy-pages@v5
    ```
    Notes for the executor:
    - If `pnpm/action-setup@v6` errors on version resolution in CI, add `with: { version: 11 }` under that step (the `packageManager` field should make this unnecessary).
    - Do NOT commit any `build/` output — the workflow builds in CI.
    - Confirm `git` remote `origin` points at `wolfwdavid/diversityincludesdisability_two`; if this is the first commit, ensure the default branch is `main` (the workflow triggers on `main`).
    - Commit and push all of Phases 01–03's files so the workflow can run. The push itself triggers the `build` job.
  </action>
  <verify>
    <automated>test -f .github/workflows/deploy.yml && grep -q "actions/deploy-pages@v5" .github/workflows/deploy.yml && grep -q "actions/upload-pages-artifact@v5" .github/workflows/deploy.yml && grep -q "check-three-pin.mjs" .github/workflows/deploy.yml && grep -q "check-contrast.mjs" .github/workflows/deploy.yml && grep -q "BASE_PATH" .github/workflows/deploy.yml && grep -q "node-version: 24" .github/workflows/deploy.yml</automated>
  </verify>
  <acceptance_criteria>
    - `.github/workflows/deploy.yml` exists and matches the RESEARCH verbatim workflow (two jobs `build`/`deploy`)
    - It contains both gate steps (`node scripts/check-three-pin.mjs`, `node scripts/check-contrast.mjs`) BEFORE the build step
    - The build step sets `env.BASE_PATH: '/${{ github.event.repository.name }}'`
    - Action versions are exactly checkout@v7, pnpm/action-setup@v6, setup-node@v6, upload-pages-artifact@v5, deploy-pages@v5
    - `permissions` grants `pages: write` and `id-token: write`; `concurrency.group: pages`
  </acceptance_criteria>
  <done>The CI pipeline exists: it gates on the three-pin + contrast scripts, builds with the subpath injected, and deploys via the official Pages Action — no committed build output, Jekyll never runs.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Set Pages source and verify the live deploy</name>
  <files>(none — repo settings + live verification)</files>
  <what-built>
    A two-job GitHub Actions workflow that gates (three-pin + contrast), builds the SvelteKit static bundle with `BASE_PATH=/diversityincludesdisability_two`, and publishes it to GitHub Pages via the official `deploy-pages@v5` action. The home page renders the DID blue/orange tokens; `static/.nojekyll` and base-aware asset URLs keep `_app/` serving from the subpath; `trailingSlash: 'always'` + `404.html` make deep links resolve.
  </what-built>
  <action>
    This step is a blocking human checkpoint — one repo setting cannot be scripted, and final proof is a live-URL visual + network check.
    1. ONE-TIME (cannot be scripted): In GitHub, go to Repo → Settings → Pages → "Build and deployment" → set Source = **GitHub Actions** (NOT "Deploy from a branch"). Save.
    2. Confirm the "Deploy to GitHub Pages" workflow run for the latest push to `main` is GREEN (Actions tab). If it is red on the gate steps, that is a real failure to fix in plan 01/02, not here.
    3. Visit `https://wolfwdavid.github.io/diversityincludesdisability_two/`. Confirm: the styled placeholder home renders with the DID blue heading + orange CTA (no unstyled flash), and the browser Network tab shows `_app/...` requests returning **200** (URLs include the `/diversityincludesdisability_two/` segment — NOT bare `/_app/`).
    4. Deep-link test: hard-refresh (or open in a new tab) the trailing-slash URL and confirm 200 (no GitHub 404). Optionally run `curl -o /dev/null -w '%{http_code}' https://wolfwdavid.github.io/diversityincludesdisability_two/` and confirm `200`.
  </action>
  <how-to-verify>
    1. ONE-TIME (cannot be scripted): Repo → Settings → Pages → Source = **GitHub Actions**. Save.
    2. Confirm the latest `main` "Deploy to GitHub Pages" run is GREEN (Actions tab).
    3. Visit `https://wolfwdavid.github.io/diversityincludesdisability_two/`; confirm styled DID tokens render and Network `_app/...` requests return 200 with the subpath segment.
    4. Hard-refresh the URL / run the curl above; confirm 200 (no GitHub 404).
  </how-to-verify>
  <verify>
    <automated>curl -fsSL -o /dev/null -w '%{http_code}' https://wolfwdavid.github.io/diversityincludesdisability_two/ | grep -q 200</automated>
  </verify>
  <acceptance_criteria>
    - Repo Pages Source is set to "GitHub Actions"
    - The latest `main` workflow run is green (build + deploy jobs both pass)
    - The live URL loads a styled DID-token page with `_app/` assets returning 200 from the subpath
    - A hard refresh / deep link returns 200 (not a 404); `curl ... -w '%{http_code}'` prints `200`
  </acceptance_criteria>
  <done>The site is live at the subpath with all `_app/` assets loading and deep links resolving — FOUND-01/02/03 proven on the real host.</done>
  <resume-signal>Type "approved" once the live URL loads with styled tokens, `_app/` 200s, and a refreshed sub-route returns 200 — or describe what 404'd / looked wrong.</resume-signal>
</task>

</tasks>

<verification>
- `grep 'deploy-pages@v5' .github/workflows/deploy.yml` and `grep 'BASE_PATH' .github/workflows/deploy.yml` match.
- Actions run on `main` is green.
- Live: `curl -fsSL -o /dev/null -w '%{http_code}' https://wolfwdavid.github.io/diversityincludesdisability_two/` returns `200`; `_app/` assets return 200 in the Network tab.
</verification>

<success_criteria>
FOUND-01/02/03 are proven live: a fully static bundle is deployed to `wolfwdavid.github.io/diversityincludesdisability_two/`, all `_app/` assets load from the subpath, and deep links/refreshes resolve without a 404 — with the three-pin and contrast gates enforced in CI on every push.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-tokens-live-deploy/01-03-SUMMARY.md`.
</output>
