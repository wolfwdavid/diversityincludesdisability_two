# Phase 1: Foundation, Tokens & Live Deploy - Research

**Researched:** 2026-07-04
**Domain:** SvelteKit static site generation, GitHub Pages subpath deployment, pnpm version pinning, WCAG 2.2 AA contrast tooling
**Confidence:** HIGH (stack/config/tooling verified against npm + GitHub API + official SvelteKit docs today); LOW only on the exact DID hex values, which this phase must choose

## Summary

This phase is deployment-and-foundation risk, deliberately front-loaded while the site is empty and cheap to fix. The stack is already locked and version-verified (see `CLAUDE.md` → Technology Stack, researched 2026-07-04). Research here is about *how to correctly wire the five requirements*, not what to pick.

The load-bearing findings: (1) The official SvelteKit `adapter-static` → GitHub Pages recipe is a two-job GitHub Actions workflow using `actions/upload-pages-artifact@v5` + `actions/deploy-pages@v5` with `BASE_PATH` injected at build time — this is the recommended deploy method and it bypasses Jekyll entirely (resolving the open STATE blocker in favor of the official action over a `gh-pages` branch). (2) `trailingSlash: 'always'` + global `prerender = true` emits `route/index.html` for every route so deep links resolve on Pages, and a `fallback: '404.html'` is the belt-and-suspenders custom-404/SPA safety net for FOUND-03. (3) The `three` pin is enforced with an exact `package.json` version **plus** a `pnpm.overrides` entry so the transitive copy pulled by `@threlte/extras` cannot drift — verifiable in `pnpm-lock.yaml` in CI. (4) `culori@4.0.2` (zero-dependency, MIT) parses any CSS color and exposes `wcagContrast()` — a single-dependency, CI-runnable contrast gate keyed off the same token source the CSS uses.

**Primary recommendation:** Scaffold SvelteKit minimal + TS on the pinned stack; configure `adapter-static` with `fallback: '404.html'` + `paths.base = process.env.BASE_PATH ?? ''`; set `prerender = true` and `trailingSlash = 'always'` in the root `+layout.ts`; deploy via the official Pages Actions workflow (source = "GitHub Actions"); enforce `three@0.175.0` via exact version + `pnpm.overrides`; gate A11Y-06 with a `culori`-based `check-contrast.mjs` reading a single typed token source.

<user_constraints>
## User Constraints (locked decisions from STATE.md / PROJECT.md)

No `CONTEXT.md` exists for this phase (no `/gsd:discuss-phase` run). The following are locked decisions from STATE.md and PROJECT.md — the planner MUST honor these; do NOT re-litigate, only implement.

### Locked Decisions
- **Deploy:** `@sveltejs/adapter-static` → GitHub Pages, repo `wolfwdavid/diversityincludesdisability_two`, live URL `https://wolfwdavid.github.io/diversityincludesdisability_two/`.
- **SvelteKit config:** lock `paths.base` to the repo subpath, `trailingSlash: 'always'`, and ship `static/.nojekyll`.
- **Three.js pin:** exact `three@0.175.0` (NO caret) against Threlte v8, enforced via the lockfile.
- **Package manager:** pnpm (11.x).
- **Architecture invariant (spans phases 1–4):** Accessible mode is the prerendered baseline; Premium is a client-only enhancement behind exactly ONE dynamic import. **Nothing in phases 1–4 may import from `lib/premium/`.** Phase 1 must create the directory/structure so this invariant holds later.
- **Full stack + exact versions:** already fixed in `CLAUDE.md` → Technology Stack (SvelteKit 2.69.1, Svelte 5, Vite 7, `@threlte/core@8.5.16`, `@threlte/extras@9.21.0`, `@types/three@0.175.x`, TypeScript 5.9, Vitest 4.1.9, Playwright 1.61.1, `@axe-core/playwright@4.12.1`).

### Claude's Discretion (research + recommend within the locks)
- Deploy method mechanics: official Pages Action vs `gh-pages` branch (STATE blocker) — resolved below in favor of the official Action.
- `adapter-static` `fallback` choice (SPA `404.html` vs none), `strict`, and exact `svelte.config.js` shape.
- Contrast-check tooling and token file structure.
- Node/pnpm version-pinning mechanism (`.nvmrc`, `packageManager`, `engines`).
- Exact DID blue/orange hex values (must be *driven by* the contrast gate).

### Deferred Ideas (OUT OF SCOPE for this phase)
- Mode toggle / localStorage / no-flash (Phase 3), content modules (Phase 2), section components (Phase 4), actual Threlte scenes (Phase 5), axe/Lighthouse/Playwright verification suite (Phase 6). Phase 1 installs the *toolchain* for these but implements none of them.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Site builds as a fully static, prerendered bundle via `@sveltejs/adapter-static` | `adapter-static` config + root `+layout.ts` `prerender = true`; verify `build/` has `index.html` and no server output (§ Architecture Patterns, § Code Examples) |
| FOUND-02 | Deploys to Pages at repo subpath with all assets (incl. `_app/`) loading (`paths.base`, `.nojekyll`) | `paths.base = process.env.BASE_PATH`, `static/.nojekyll`, official Pages Action injects `BASE_PATH=/repo-name` at build (§ Standard Stack: Deploy, § Pitfalls) |
| FOUND-03 | Deep links / refreshes resolve without 404 (trailingSlash / fallback) | `trailingSlash: 'always'` → `route/index.html` per route; `fallback: '404.html'` SPA/404 safety net (§ Pattern 2) |
| FOUND-04 | `three` exact-pinned compatible with Threlte v8, enforced via lockfile | exact `package.json` version + `pnpm.overrides.three` + `pnpm-lock.yaml` assertion script (§ Pattern 3, § Don't Hand-Roll) |
| A11Y-06 | Text/UI meet WCAG 2.2 AA contrast against DID blue/orange palette | `culori.wcagContrast()` CI script over a single typed token source + a foreground×background pairs manifest with per-pair required level (§ Pattern 4, § Validation Architecture) |
</phase_requirements>

## Standard Stack

The application stack is already locked and version-verified in `CLAUDE.md`. This section covers only what Phase 1 *adds* on top of that (deploy + tooling), all verified today (2026-07-04).

### Deploy toolchain (GitHub Actions, verified via GitHub Releases API 2026-07-04)
| Action | Version (latest major) | Purpose |
|--------|------------------------|---------|
| `actions/checkout` | `v7` (v7.0.0) | Checkout repo |
| `pnpm/action-setup` | `v6` (v6.0.9) | Install pnpm (reads `packageManager` field; supports pnpm 11) |
| `actions/setup-node` | `v6` (v6.4.0) | Node + `cache: pnpm` |
| `actions/upload-pages-artifact` | `v5` (v5.0.0) | Package `build/` as a Pages artifact |
| `actions/deploy-pages` | `v5` (v5.0.0) | Publish artifact to Pages (needs `upload-pages-artifact@v3+`) |
| `actions/configure-pages` | `v6` (v6.0.0) | Optional — can auto-derive base path; not required with the `BASE_PATH` env approach |

### Contrast-check tooling
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `culori` | `4.0.2` | Parse any CSS color (hex/rgb/hsl/oklch/named) + `wcagContrast()` / `wcagLuminance()` | **Zero dependencies**, MIT, actively maintained (257 versions), does parse *and* contrast in one lib — no second dep needed |

**Alternatives considered (contrast):**
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `culori` | `wcag-contrast@3.0.0` | Simpler API but only takes hex/rgb arrays — you still need a parser for `hsl()`/`oklch()` tokens; last published 2022 (math is stable, so fine, but two-lib solution) |
| `culori` | `color-contrast-checker@2.1.0` | OOP wrapper, heavier API surface; no advantage over culori |
| WCAG 2.x ratio | APCA / WCAG 3.0 (`a11y-color-contrast`) | APCA is more perceptually accurate but WCAG 3.0 is a **draft**; the requirement is WCAG **2.2 AA**, which uses the classic ratio — use ratio, note APCA as future |

### Deploy method decision (resolves STATE blocker)
| Instead of | Could Use | Recommendation |
|------------|-----------|----------------|
| **Official Pages Action** (`upload-pages-artifact` + `deploy-pages`, Pages source = "GitHub Actions") | `gh-pages` branch (commit or bot-push built output) | **Use the official Action.** It builds from source in CI, commits no build artifacts to git, deploys straight from the artifact (Jekyll never runs, so `_app/` is safe regardless), and is the method the SvelteKit docs document. The `gh-pages` branch approach pollutes history with built output, still needs `.nojekyll`, and requires a deploy token/bot push. Keep `static/.nojekyll` anyway as cheap insurance. |

**One-time manual step:** Repo → Settings → Pages → **Source: GitHub Actions** (not "Deploy from a branch"). This is the only click that cannot be scripted from the workflow; the plan should call it out as a human/UAT step.

**Installation (Phase-1 additions on top of the scaffold):**
```bash
# scaffold (SvelteKit minimal + TypeScript + Vitest + Playwright), then:
pnpm add -D @sveltejs/adapter-static culori
# stack packages (three EXACT — no caret):
pnpm add three@0.175.0
pnpm add -D @types/three@0.175.0 @threlte/core@8.5.16 @threlte/extras@9.21.0
```

**Version verification (already run 2026-07-04):** `three@latest` = 0.185.1 (do NOT use — pin 0.175.0 per Threlte v8 dev-tested baseline), `@threlte/core` = 8.5.16, `@threlte/extras` = 9.21.0, `@sveltejs/adapter-static` = 3.0.10, `culori` = 4.0.2.

## Architecture Patterns

### Recommended Project Structure
```
src/
  app.html              # use %sveltekit.assets% for any hard-coded asset (favicon)
  app.css               # @import the token stylesheet
  routes/
    +layout.ts          # export const prerender = true; trailingSlash = 'always';
    +layout.svelte      # shell placeholder (header/footer stubs — real content in Phase 4)
    +page.svelte        # styled home placeholder proving tokens render
  lib/
    tokens/
      colors.ts         # SINGLE SOURCE: raw palette + semantic fg/bg tokens
      pairs.ts          # foreground×background pairs + required WCAG level
      tokens.css        # :root custom properties (generated from / kept in lockstep with colors.ts)
    premium/            # EMPTY in Phase 1 — client-only 3D lands in Phase 5
      .gitkeep          # + a README stating: nothing outside premium/ imports this until Phase 5
static/
  .nojekyll             # empty file — keeps Pages from stripping _app/
scripts/
  check-contrast.mjs    # culori-based A11Y-06 gate
  check-three-pin.mjs   # asserts pnpm-lock.yaml only resolves three@0.175.0
.github/workflows/
  deploy.yml            # official Pages Action, two jobs
.nvmrc                  # 24
.npmrc                  # optional: public-hoist-pattern[]=*three* (narrow hoist if a peer issue appears)
svelte.config.js
package.json            # packageManager + engines + three exact + pnpm.overrides
```

### Pattern 1: adapter-static for a GitHub Pages *subpath* site (FOUND-01, FOUND-02)
**What:** Fully prerendered static output with the base path injected at build time.
**When to use:** Always, for this project.
```javascript
// svelte.config.js
// Source: https://svelte.dev/docs/kit/adapter-static (verified 2026-07-04)
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html', // SPA/custom-404 safety net for FOUND-03
      precompress: false,
      strict: true
    }),
    paths: {
      base: process.env.BASE_PATH ?? '' // '' locally, '/diversityincludesdisability_two' in CI
    }
  }
};
export default config;
```
```typescript
// src/routes/+layout.ts
// Source: https://svelte.dev/docs/kit/adapter-static (verified 2026-07-04)
export const prerender = true;
export const trailingSlash = 'always';
```
**Asset URLs:** Every internal link and asset reference MUST use `base` from `$app/paths` (e.g. `` `${base}/favicon.png` ``); in `app.html`, use `%sveltekit.assets%`. Forgetting `base` is the #1 "works locally, 404s on Pages" bug (see `CLAUDE.md` stack notes).

### Pattern 2: Deep-link / refresh resolution on Pages (FOUND-03)
**What:** With `trailingSlash: 'always'` + `prerender = true`, each route builds to `route/index.html`. GitHub Pages serves a directory's `index.html` for `/route/`, so hard-refresh and deep links resolve to a real file — no server rewrite needed. `fallback: '404.html'` additionally names the SPA shell as the Pages 404 handler, so any unmatched path recovers client-side and shows a branded 404 instead of GitHub's default.
**Why both:** Prerendered `index.html` files handle *known* routes deterministically (best for SEO + the guaranteed-accessible HTML). The `404.html` fallback covers anything not prerendered. For a fully-prerendered marketing site the fallback rarely fires, but it is cheap correctness insurance and satisfies `strict: true`.

### Pattern 3: Enforcing the exact `three` pin through the lockfile (FOUND-04)
**What:** Two-layer enforcement so neither a direct `pnpm update` nor a transitive `@threlte/extras` dependency can bump `three`.
```jsonc
// package.json (excerpt)
{
  "packageManager": "pnpm@11.6.0",
  "engines": { "node": ">=24 <25", "pnpm": ">=11" },
  "dependencies": {
    "three": "0.175.0"          // exact — NO caret
  },
  "devDependencies": {
    "@types/three": "0.175.0"   // match the three MINOR exactly
  },
  "pnpm": {
    "overrides": {
      "three": "0.175.0"        // forces the transitive copy (via @threlte/extras) to 0.175.0 too
    }
  }
}
```
**Verify (encode as an acceptance criterion):** `pnpm why three` shows a single resolved `0.175.0`, OR a script asserts `pnpm-lock.yaml` resolves `three` to exactly `0.175.0` everywhere:
```javascript
// scripts/check-three-pin.mjs — exits non-zero if any three copy != 0.175.0
import { readFileSync } from 'node:fs';
const EXPECTED = '0.175.0';
const lock = readFileSync('pnpm-lock.yaml', 'utf8');
const found = [...new Set([...lock.matchAll(/(?:^|[/@])three@(\d+\.\d+\.\d+)/gm)].map(m => m[1]))];
const bad = found.filter(v => v !== EXPECTED);
if (bad.length || !found.includes(EXPECTED)) {
  console.error(`three pin FAIL — expected only ${EXPECTED}, found:`, found);
  process.exit(1);
}
console.log(`three pin OK: ${EXPECTED}`);
```

### Pattern 4: Contrast-checkable token structure (A11Y-06)
**What:** Keep the palette in ONE typed source; derive the CSS custom properties from it (so the CSS and the checker can never drift); define an explicit foreground×background *pairs manifest* tagged with the required WCAG level; the CI script fails the build if any pair falls below threshold. This also foreshadows Phase 2's single-source-of-truth pattern.
```typescript
// src/lib/tokens/colors.ts  (single source)
export const palette = {
  // choose exact hexes so the pairs below PASS — see Open Questions
  blue900: '#0b2a4a',
  orange500: '#e8730c',
  white: '#ffffff',
  ink: '#12181f'
} as const;

// src/lib/tokens/pairs.ts
export type Level = 'AA-normal' | 'AA-large' | 'AA-ui';
export const pairs: { name: string; fg: keyof typeof palette; bg: keyof typeof palette; level: Level }[] = [
  { name: 'body text on white',        fg: 'ink',       bg: 'white',   level: 'AA-normal' }, // >= 4.5
  { name: 'primary link on white',     fg: 'blue900',   bg: 'white',   level: 'AA-normal' }, // >= 4.5
  { name: 'button label on orange',    fg: 'white',     bg: 'orange500', level: 'AA-large' }, // >= 3
  { name: 'focus ring vs white',       fg: 'blue900',   bg: 'white',   level: 'AA-ui'     }  // >= 3
];
```
```javascript
// scripts/check-contrast.mjs
// Source: https://culorijs.org/api/ — wcagContrast(colorA, colorB) (verified 2026-07-04)
import { wcagContrast } from 'culori';
import { palette } from '../src/lib/tokens/colors.ts'; // via tsx/ts loader, or mirror as .js
import { pairs } from '../src/lib/tokens/pairs.ts';

const MIN = { 'AA-normal': 4.5, 'AA-large': 3, 'AA-ui': 3 };
let failed = 0;
for (const p of pairs) {
  const ratio = wcagContrast(palette[p.fg], palette[p.bg]);
  const ok = ratio >= MIN[p.level];
  console.log(`${ok ? 'PASS' : 'FAIL'} ${p.name}: ${ratio.toFixed(2)} (need ${MIN[p.level]})`);
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
```
*(If running the script against `.ts` sources is awkward, either run it through `tsx`/`vite-node`, or emit `colors.js`/`pairs.js` as the source of truth and let TS re-export them.)*

**WCAG 2.2 AA thresholds (unchanged from 2.1):**
- Normal text (< 18.66px, or < 24px non-bold): **4.5:1** (SC 1.4.3)
- Large text (>= 24px, or >= 18.66px bold): **3:1** (SC 1.4.3)
- UI components & graphical objects (borders, icons, focus indicators, states): **3:1** (SC 1.4.11)
- WCAG 2.2 added *no* new contrast math; new SCs (2.4.11 focus-not-obscured, 2.5.8 target size) are non-contrast and out of scope for A11Y-06.

### Pattern 5: `lib/premium/` invariant guard (architecture lock)
**What:** Create the empty `src/lib/premium/` now and prevent any Phase 1–4 code from importing it. Enforce with an ESLint rule so the invariant is a lint gate, not a convention.
```jsonc
// eslint config (excerpt) — restrict premium imports outside premium/
"no-restricted-imports": ["error", { "patterns": ["$lib/premium/*", "**/lib/premium/*"] }]
// (later, in Phase 5, allow it only inside the single dynamic-import gate)
```
This makes PREM-03's "zero WebGL in the accessible bundle" structurally true from day one.

### Anti-Patterns to Avoid
- **Global `export const ssr = false` (SPA-only):** kills prerendering → hurts SEO and destroys the guaranteed-accessible HTML. Keep `prerender = true`; only the future 3D subtree is client-gated.
- **Caret range on `three` (`^0.175`):** `three` has no semver; a "patch" bump routinely breaks Threlte/`three-mesh-bvh`. Exact pin + override only.
- **Omitting `static/.nojekyll`:** even with the official Action (which doesn't run Jekyll), keep it — it is the guaranteed defense for `_app/` (leading-underscore) assets and costs nothing.
- **Hard-coding the base path** (e.g. literal `/diversityincludesdisability_two` in links): use `base` from `$app/paths` and `BASE_PATH` env so local dev and CI agree.
- **Static top-level import of any Threlte/three module:** would hoist `three` into the shared entry bundle. Not relevant yet (no scenes in Phase 1) but the `premium/` guard prevents it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WCAG contrast math | Custom relative-luminance + ratio code | `culori.wcagContrast()` | Correct sRGB linearization + edge cases already handled; zero-dep |
| CSS color parsing (hsl/oklch/named → rgb) | Regex/manual conversion | `culori.parse()` / it accepts strings directly | oklch/hsl math is easy to get subtly wrong |
| Static SPA fallback / directory index routing | Custom 404 redirect hacks | `adapter-static` `fallback` + `trailingSlash` | Framework emits the correct `index.html` tree |
| Pinning transitive `three` | Manual node_modules edits | `pnpm.overrides` | Survives reinstalls; the only durable enforcement |
| Pages deploy plumbing | Custom `gh-pages` push scripts | `upload-pages-artifact` + `deploy-pages` | Official, no committed build output, Jekyll-free |

**Key insight:** Every Phase-1 requirement has an official, first-party mechanism (SvelteKit adapter option, pnpm override, GitHub Action, one WCAG lib). Custom code here is pure risk.

## Common Pitfalls

### Pitfall 1: `_app/` assets 404 on Pages
**What goes wrong:** All JS/CSS load fine locally, then 404 on the live subpath.
**Why it happens:** Jekyll strips leading-underscore dirs (`_app`), and/or `paths.base` isn't set so asset URLs point at the domain root instead of `/repo-name/`.
**How to avoid:** Ship `static/.nojekyll`, set `paths.base` from `BASE_PATH`, use `base`/`%sveltekit.assets%` for every URL, and deploy via the official Action (never runs Jekyll).
**Warning signs:** Network tab shows requests to `wolfwdavid.github.io/_app/...` (missing the `/diversityincludesdisability_two/` segment).

### Pitfall 2: Deep link 404 on refresh
**What goes wrong:** `/services/` works via in-app nav but 404s on hard refresh.
**Why it happens:** Route wasn't prerendered to `services/index.html`, or `trailingSlash` mismatch produces `services.html` that Pages won't serve at `/services/`.
**How to avoid:** `prerender = true` globally + `trailingSlash = 'always'` + `fallback: '404.html'`.
**Warning signs:** `build/` lacks a `services/index.html`.

### Pitfall 3: `three` silently upgraded
**What goes wrong:** A later `pnpm install`/`update` pulls `three@0.18x` transitively; Threlte or `three-mesh-bvh` breaks at build/runtime.
**Why it happens:** `@threlte/extras` declares `three >=0.160`; without an override, pnpm may resolve a newer minor.
**How to avoid:** exact `package.json` version + `pnpm.overrides.three` + the `check-three-pin.mjs` CI gate.
**Warning signs:** `pnpm why three` lists more than one version, or a version != 0.175.0.

### Pitfall 4: Orange fails contrast as body text
**What goes wrong:** DID brand orange on white typically lands ~2–3:1 — below the 4.5:1 needed for normal text.
**Why it happens:** Saturated oranges are light; contrast against white is low.
**How to avoid:** Reserve orange for large text (>=24px / >=18.66px bold, 3:1), UI accents/borders/focus (3:1), or as a *background* with dark ink text. Let the contrast gate *drive* which hexes are chosen — do not pick hexes then hope they pass.
**Warning signs:** `check-contrast.mjs` FAILs an `AA-normal` orange pair.

### Pitfall 5: Non-reproducible CI build
**What goes wrong:** Local build differs from CI; unexpected dependency versions.
**Why it happens:** No lockfile enforcement, floating Node/pnpm.
**How to avoid:** `pnpm install --frozen-lockfile`, `.nvmrc` (24), `"packageManager": "pnpm@11.x"` (Corepack + read by `pnpm/action-setup@v6`), `engines`, commit `pnpm-lock.yaml`.

## Code Examples

### Full GitHub Pages deploy workflow (pnpm + SvelteKit static)
```yaml
# .github/workflows/deploy.yml
# Sources: https://svelte.dev/docs/kit/adapter-static + action versions verified via GitHub Releases API 2026-07-04
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
      - uses: pnpm/action-setup@v6      # reads "packageManager" from package.json (pnpm 11)
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
          BASE_PATH: '/${{ github.event.repository.name }}'  # -> /diversityincludesdisability_two
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
*(If `pnpm/action-setup@v6` errors on version resolution, add `with: { version: 11 }`. Ensure `"packageManager": "pnpm@11.6.0"` is in `package.json`.)*

### `.nvmrc`
```
24
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `gh-pages` branch + committed build | Official Pages Action (`upload/deploy-pages`), source = "GitHub Actions" | GA ~2022, now the documented SvelteKit path | No committed build output, Jekyll never runs |
| `peaceiris/actions-gh-pages` (third-party) | First-party `actions/deploy-pages` | 2022+ | First-party, OIDC-based, less token handling |
| WCAG 2.1 contrast | WCAG **2.2** AA (same 1.4.3/1.4.11 math) | Oct 2023 | No contrast-math change; ratios identical |
| Threlte v7 (Svelte 4) | Threlte v8 (Svelte 5 runes) | 2024–2025 | Requires Svelte 5; `three@0.175.0` dev-tested baseline |

**Deprecated/outdated:**
- `adapter-auto`/`-node`/`-vercel`/`-cloudflare` for this project — produce server output Pages can't run.
- APCA / WCAG 3.0 contrast — still **draft**; do not use to satisfy a WCAG 2.2 AA requirement (note it as a future consideration only).

## Open Questions

1. **Exact DID blue/orange hex values.**
   - What we know: brand is blue + orange; the current Wix site (`diversityincludesdisability.org`) is the source; `ui-ux-pro-max` skill is designated for palette work in UI phases.
   - What's unclear: the precise hexes and their semantic roles (which is text, which is accent/background).
   - Recommendation: In this phase, *pull the brand hexes from the Wix site*, then tune them against `check-contrast.mjs` so every declared pair passes. The contrast gate is the arbiter — choose the darkest on-brand blue that reads as body/link text on white, and treat orange as a large-text/UI/background color. Record final hexes in `colors.ts`. LOW confidence on values until chosen; HIGH confidence on the method.

2. **Running the contrast script against TS sources.**
   - What we know: tokens should be a single typed source; Node can't natively import `.ts`.
   - Recommendation: run `check-contrast.mjs` via `tsx`/`vite-node`, OR make `colors.js`/`pairs.js` the source of truth and have `.ts` re-export them. Planner picks one; both keep a single source.

3. **`configure-pages` static_site_generator option.**
   - What we know: `actions/configure-pages@v6` can auto-derive the base path (`static_site_generator: sveltekit`).
   - Recommendation: skip it — the explicit `BASE_PATH` env is simpler, more transparent, and matches the SvelteKit docs. Mention only if base-path auto-detection is later desired.

## Validation Architecture

Nyquist validation is enabled (`config.json` → `workflow.nyquist_validation: true`). Phase 1's requirements are mostly build/deploy/CI gates rather than component unit tests, so the "test map" leans on scripts + a post-deploy smoke check.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.9 (installed at scaffold) + Node scripts for gates; Playwright 1.61.1 reserved for later phases |
| Config file | `vitest.config.ts` (scaffolded); gate scripts in `scripts/` |
| Quick run command | `node scripts/check-three-pin.mjs && node scripts/check-contrast.mjs` |
| Full suite command | `pnpm build && node scripts/check-three-pin.mjs && node scripts/check-contrast.mjs` (+ post-deploy curl smoke) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Static prerendered bundle, no server output | smoke | `pnpm build && test -f build/index.html && test ! -d build/server` | ❌ Wave 0 (workflow + assert) |
| FOUND-02 | `.nojekyll` + base-prefixed `_app/` assets ship | smoke | `test -f build/.nojekyll && test -d build/_app` ; live: `curl -fsSL <site>/_app/...` returns 200 | ❌ Wave 0 |
| FOUND-03 | Every route emits `index.html`; deep link resolves | smoke | `test -f build/<route>/index.html && test -f build/404.html` ; live: `curl -fsSL -o /dev/null -w '%{http_code}' <site>/<route>/` == 200 | ❌ Wave 0 |
| FOUND-04 | `three` resolves only to 0.175.0 in lockfile | unit | `node scripts/check-three-pin.mjs` | ❌ Wave 0 |
| A11Y-06 | All token fg×bg pairs meet WCAG 2.2 AA | unit | `node scripts/check-contrast.mjs` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `node scripts/check-three-pin.mjs && node scripts/check-contrast.mjs` (fast, no build).
- **Per wave merge:** `pnpm build` + the two gate scripts + `build/` structure asserts.
- **Phase gate:** Full CI workflow green on `main` + live smoke: the deployed URL loads with `_app/` 200s, a deep-linked sub-route returns 200 on hard refresh, and `pnpm-lock.yaml` shows `three@0.175.0` only. Human UAT confirms the styled page renders with DID tokens.

### Wave 0 Gaps
- [ ] `scripts/check-contrast.mjs` — covers A11Y-06 (culori gate over `colors.ts`/`pairs.ts`)
- [ ] `scripts/check-three-pin.mjs` — covers FOUND-04 (lockfile assertion)
- [ ] `.github/workflows/deploy.yml` — covers FOUND-01/02/03 build+deploy
- [ ] `src/lib/tokens/{colors,pairs}.ts` + `tokens.css` — token source the contrast gate reads
- [ ] `static/.nojekyll` — FOUND-02 asset serving
- [ ] `src/lib/premium/` (empty + guard) + ESLint `no-restricted-imports` — architecture invariant
- [ ] Framework/tooling install: `pnpm add -D @sveltejs/adapter-static culori` (Vitest/Playwright come from the scaffold selection)

## Sources

### Primary (HIGH confidence)
- SvelteKit docs — Static site generation / adapter-static (`https://svelte.dev/docs/kit/adapter-static`): `svelte.config.js`, `paths.base` via `BASE_PATH`, `fallback: '404.html'`, `.nojekyll`, `trailingSlash`, the two-job Pages workflow. Fetched 2026-07-04.
- GitHub Releases API (fetched 2026-07-04): `actions/checkout@v7.0.0`, `setup-node@v6.4.0`, `upload-pages-artifact@v5.0.0`, `deploy-pages@v5.0.0`, `configure-pages@v6.0.0`, `pnpm/action-setup@v6.0.9`.
- npm registry (verified 2026-07-04): `three@0.185.1` (latest, NOT used), `@threlte/core@8.5.16`, `@threlte/extras@9.21.0`, `@sveltejs/adapter-static@3.0.10`, `culori@4.0.2` (zero deps), `wcag-contrast@3.0.0`.
- culori API docs (`https://culorijs.org/api/`): `wcagContrast(colorA, colorB)`, `wcagLuminance(color)`, `parse()`. Fetched 2026-07-04.
- Project `CLAUDE.md` → Technology Stack (STACK.md, researched 2026-07-04) — locked versions and rationale.

### Secondary (MEDIUM confidence)
- WebSearch (2026-07-04) — SvelteKit→Pages pnpm workflow patterns (Captain Codeman, Okupter, actions/starter-workflows PR) corroborating the official-Action approach.
- WCAG 2.2 AA thresholds (SC 1.4.3 / 1.4.11) — stable, well-known; no contrast-math change from 2.1.

### Tertiary (LOW confidence)
- Exact DID brand hexes — not yet extracted; must be pulled from the Wix site and tuned against the contrast gate (Open Question 1).

## Metadata

**Confidence breakdown:**
- Standard stack / deploy toolchain: HIGH — versions verified via npm + GitHub Releases API today.
- adapter-static + Pages config: HIGH — official SvelteKit docs, current action majors.
- `three` pin mechanism: HIGH — `pnpm.overrides` is documented; exact-0.175.0 correctness MEDIUM-HIGH (Threlte v8 *dev-tested* baseline, not a hard published peer requirement).
- Contrast tooling: HIGH — culori verified (parse + wcagContrast), WCAG 2.2 AA math stable.
- DID palette values: LOW — to be chosen this phase, gated by the contrast script.

**Research date:** 2026-07-04
**Valid until:** ~2026-08-04 for action/lib versions (fast-moving GitHub Actions majors — re-check tags before the plan pins them); stack pins per `CLAUDE.md` are deliberately frozen and change only on a deliberate bump.
