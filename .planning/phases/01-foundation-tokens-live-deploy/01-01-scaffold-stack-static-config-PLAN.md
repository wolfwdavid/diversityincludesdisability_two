---
phase: 01-foundation-tokens-live-deploy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - .nvmrc
  - .npmrc
  - svelte.config.js
  - src/routes/+layout.ts
  - src/routes/+layout.svelte
  - src/app.html
  - static/.nojekyll
  - scripts/check-three-pin.mjs
autonomous: true
requirements: [FOUND-01, FOUND-02, FOUND-03, FOUND-04]
must_haves:
  truths:
    - "`pnpm build` produces a fully static, prerendered bundle (build/index.html exists, no build/server dir)"
    - "Every route emits route/index.html and a build/404.html exists so deep links/refreshes resolve on Pages"
    - "static/.nojekyll ships so _app/ assets are not stripped by Pages"
    - "three resolves to exactly 0.175.0 everywhere in pnpm-lock.yaml (direct + transitive via @threlte/extras)"
  artifacts:
    - path: "svelte.config.js"
      provides: "adapter-static with fallback:'404.html', strict:true, paths.base from BASE_PATH"
      contains: "adapter-static"
    - path: "src/routes/+layout.ts"
      provides: "global prerender + trailingSlash always"
      contains: "trailingSlash"
    - path: "static/.nojekyll"
      provides: "Pages _app/ asset serving"
    - path: "package.json"
      provides: "packageManager pnpm@11.x, engines, exact three@0.175.0, pnpm.overrides.three"
      contains: "\"three\": \"0.175.0\""
    - path: "scripts/check-three-pin.mjs"
      provides: "FOUND-04 lockfile assertion gate"
      exports: []
  key_links:
    - from: "svelte.config.js"
      to: "process.env.BASE_PATH"
      via: "paths.base = process.env.BASE_PATH ?? ''"
      pattern: "process\\.env\\.BASE_PATH"
    - from: "scripts/check-three-pin.mjs"
      to: "pnpm-lock.yaml"
      via: "readFileSync + regex assertion for three@0.175.0"
      pattern: "three@"
---

<objective>
Scaffold the SvelteKit app on the locked, version-pinned stack and wire the static-deploy foundation: adapter-static configured for a GitHub Pages subpath, global prerender + `trailingSlash: 'always'`, `static/.nojekyll`, exact `three@0.175.0` enforced in the lockfile, and a CI-runnable gate script that proves the pin.

Purpose: Front-load deploy/foundation risk while the site is empty. This plan makes FOUND-01 (static bundle), FOUND-02 (subpath assets), FOUND-03 (deep-link resolution), and FOUND-04 (three pin) structurally true before any content exists.
Output: A buildable SvelteKit project (`pnpm build` → `build/index.html`), the deploy-safe config, and `scripts/check-three-pin.mjs`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md
@.planning/phases/01-foundation-tokens-live-deploy/01-VALIDATION.md
@CLAUDE.md

<interfaces>
<!-- Locked stack versions (from CLAUDE.md Technology Stack + RESEARCH user_constraints). Use EXACTLY these; do not bump. -->
SvelteKit 2.69.1 (^2) · Svelte 5 (^5) · Vite 7 (^7) · TypeScript 5.9.x
@sveltejs/adapter-static 3.0.10 · culori 4.0.2 (added in plan 02)
three 0.175.0 (EXACT, NO caret) · @types/three 0.175.0 (match minor)
@threlte/core 8.5.16 · @threlte/extras 9.21.0
Vitest 4.1.9 · Playwright 1.61.1 (installed at scaffold; used in later phases)
Node 24 · pnpm 11.6.0
Repo: wolfwdavid/diversityincludesdisability_two · Live: https://wolfwdavid.github.io/diversityincludesdisability_two/
Existing files to PRESERVE during scaffold: .git/ .planning/ CLAUDE.md
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold SvelteKit on the pinned stack and enforce the three@0.175.0 pin</name>
  <files>package.json, pnpm-lock.yaml, .nvmrc, .npmrc</files>
  <read_first>
    - CLAUDE.md (Technology Stack table + "What NOT to Use" — exact versions, no-caret-on-three rule)
    - .planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md (§ Standard Stack → Installation; § Pattern 3 three pin; Pitfall 3, Pitfall 5)
  </read_first>
  <action>
    Working dir is the project root `diversityincludesdisability_two/` (already contains .git/, .planning/, CLAUDE.md — DO NOT delete these).

    1. Scaffold SvelteKit (minimal template, TypeScript) into the current directory, preserving existing files:
       `pnpm dlx sv create . --template minimal --types ts` (accept the "directory not empty" continue prompt; keep .git/.planning/CLAUDE.md). If `sv` refuses the non-empty dir, scaffold into a temp subdir and move the generated files up, leaving .git/.planning/CLAUDE.md untouched.
    2. Add the Vitest + Playwright test addons: `pnpm dlx sv add vitest playwright` (this generates `vitest.config.ts`/`vite.config.ts` test config and a Playwright config). Also add ESLint + Prettier addons: `pnpm dlx sv add eslint prettier` (plan 02 extends the ESLint config; scaffolding it here creates `eslint.config.js`).
    3. Install the static adapter (dev) and stack packages with EXACT three (NO caret):
       `pnpm add -D @sveltejs/adapter-static@3.0.10`
       `pnpm add three@0.175.0`
       `pnpm add -D @types/three@0.175.0 @threlte/core@8.5.16 @threlte/extras@9.21.0`
    4. Edit `package.json` to add these EXACT fields (verbatim values):
       ```jsonc
       {
         "packageManager": "pnpm@11.6.0",
         "engines": { "node": ">=24 <25", "pnpm": ">=11" },
         "dependencies": {
           "three": "0.175.0"          // exact — NO caret; confirm no "^" was written
         },
         "devDependencies": {
           "@types/three": "0.175.0"   // match the three minor exactly
         },
         "pnpm": {
           "overrides": {
             "three": "0.175.0"        // forces the transitive @threlte/extras copy to 0.175.0
           }
         }
       }
       ```
       Also add these scripts to `package.json` "scripts": `"check:three-pin": "node scripts/check-three-pin.mjs"`.
    5. Create `.nvmrc` containing exactly one line: `24`
    6. Create `.npmrc` containing exactly: `public-hoist-pattern[]=*three*` (narrow hoist so the single three copy resolves for Threlte's peers; avoids `shamefully-hoist`).
    7. Re-run `pnpm install` so `pnpm.overrides` is applied and `pnpm-lock.yaml` is regenerated. Then run `pnpm why three` and confirm a single resolved `0.175.0`. Commit `pnpm-lock.yaml`.
  </action>
  <verify>
    <automated>test -f package.json && test -f pnpm-lock.yaml && test -f svelte.config.js && grep -q '"three": "0.175.0"' package.json && ! grep -q '"three": "\^' package.json && grep -q '"packageManager": "pnpm@11' package.json</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` contains `"three": "0.175.0"` (exact) and NO `"^"` on the three dependency
    - `package.json` contains `"packageManager": "pnpm@11.6.0"`, an `engines` block, and `pnpm.overrides.three = "0.175.0"`
    - `.nvmrc` contains `24`; `.npmrc` contains `public-hoist-pattern[]=*three*`
    - `pnpm-lock.yaml` exists; `pnpm why three` reports only `0.175.0`
    - `svelte.config.js`, `vite.config.ts`/`vitest.config.ts`, `eslint.config.js`, and a Playwright config all exist (scaffold + addons succeeded)
    - `.git/`, `.planning/`, and `CLAUDE.md` are intact
  </acceptance_criteria>
  <done>SvelteKit project scaffolded on the exact locked stack; three is exact-pinned in package.json + pnpm.overrides and resolves to a single 0.175.0 in the lockfile.</done>
</task>

<task type="auto">
  <name>Task 2: Configure adapter-static for the Pages subpath (prerender, trailingSlash, .nojekyll)</name>
  <files>svelte.config.js, src/routes/+layout.ts, src/routes/+layout.svelte, src/app.html, static/.nojekyll</files>
  <read_first>
    - svelte.config.js (the scaffold-generated file being replaced)
    - .planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md (§ Pattern 1 svelte.config.js verbatim; § Pattern 2 deep-link resolution; Pitfall 1, Pitfall 2)
    - CLAUDE.md (Stack Patterns: `paths.base`, `%sveltekit.assets%`, `.nojekyll` guidance)
  </read_first>
  <action>
    1. Replace `svelte.config.js` with EXACTLY (from RESEARCH Pattern 1):
       ```javascript
       import adapter from '@sveltejs/adapter-static';
       import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

       /** @type {import('@sveltejs/kit').Config} */
       const config = {
         preprocess: vitePreprocess(),
         kit: {
           adapter: adapter({
             pages: 'build',
             assets: 'build',
             fallback: '404.html',
             precompress: false,
             strict: true
           }),
           paths: {
             base: process.env.BASE_PATH ?? ''
           }
         }
       };
       export default config;
       ```
    2. Create `src/routes/+layout.ts` with EXACTLY:
       ```typescript
       export const prerender = true;
       export const trailingSlash = 'always';
       ```
    3. Create `src/routes/+layout.svelte` as a minimal shell that renders children and pulls in global styles (real header/footer come in Phase 4). Use Svelte 5 runes:
       ```svelte
       <script lang="ts">
         import '../app.css';
         let { children } = $props();
       </script>

       {@render children()}
       ```
       (If the scaffold already created `+layout.svelte`, edit it to this shape; keep `import '../app.css'`.)
    4. In `src/app.html`, ensure any hard-coded asset uses `%sveltekit.assets%` (the scaffold default favicon link should read `href="%sveltekit.assets%/favicon.png"` or similar). Do NOT hard-code `/diversityincludesdisability_two` anywhere — base comes from `$app/paths` / `BASE_PATH`.
    5. Create an empty file `static/.nojekyll` (zero bytes).
    6. Run a local production build to prove static output: `pnpm build`. Confirm `build/index.html` and `build/404.html` exist and there is NO `build/server` directory. Confirm `build/.nojekyll` and `build/_app/` exist.
  </action>
  <verify>
    <automated>pnpm build && test -f build/index.html && test -f build/404.html && test -f build/.nojekyll && test -d build/_app && test ! -d build/server && grep -q "trailingSlash" src/routes/+layout.ts && grep -q "fallback: '404.html'" svelte.config.js && grep -q "process.env.BASE_PATH" svelte.config.js</automated>
  </verify>
  <acceptance_criteria>
    - `svelte.config.js` contains `fallback: '404.html'`, `strict: true`, and `paths.base = process.env.BASE_PATH ?? ''`
    - `src/routes/+layout.ts` contains `export const prerender = true;` and `export const trailingSlash = 'always';`
    - `static/.nojekyll` exists and is empty
    - `pnpm build` succeeds and produces `build/index.html`, `build/404.html`, `build/.nojekyll`, `build/_app/`, and NO `build/server/` directory
    - No literal `/diversityincludesdisability_two` string appears hard-coded in `src/app.html` or `svelte.config.js` (base is env-driven)
  </acceptance_criteria>
  <done>The app builds to a fully static, prerendered bundle whose asset URLs are base-aware and whose 404/trailingSlash config makes deep links resolvable on a Pages subpath (FOUND-01, FOUND-02 config, FOUND-03).</done>
</task>

<task type="auto">
  <name>Task 3: Write the three-pin lockfile gate (FOUND-04)</name>
  <files>scripts/check-three-pin.mjs, package.json</files>
  <read_first>
    - pnpm-lock.yaml (the lockfile the script asserts against — confirm the three@0.175.0 entry format)
    - .planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md (§ Pattern 3 check-three-pin.mjs verbatim)
    - .planning/phases/01-foundation-tokens-live-deploy/01-VALIDATION.md (Per-Task Verification Map → FOUND-04 command)
  </read_first>
  <action>
    Create `scripts/check-three-pin.mjs` with EXACTLY (from RESEARCH Pattern 3) — exits non-zero if any resolved `three` version is not `0.175.0`:
    ```javascript
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
    Run it: `node scripts/check-three-pin.mjs` — it must print `three pin OK: 0.175.0` and exit 0. If it fails because the lockfile contains a stray transitive `three` version, fix `pnpm.overrides.three` in package.json and re-run `pnpm install` until only `0.175.0` resolves. (Do NOT weaken the script to make it pass.)
  </action>
  <verify>
    <automated>node scripts/check-three-pin.mjs</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/check-three-pin.mjs` exists and matches the RESEARCH Pattern 3 source
    - `node scripts/check-three-pin.mjs` exits 0 and prints `three pin OK: 0.175.0`
    - Deliberately editing package.json to a different three version and re-installing would make the script exit non-zero (the gate is real, not a no-op) — do NOT commit such an edit
  </acceptance_criteria>
  <done>FOUND-04 is a CI-runnable gate: the lockfile is asserted to resolve `three` to only `0.175.0`, blocking any silent transitive upgrade.</done>
</task>

</tasks>

<verification>
- `pnpm build` produces `build/index.html`, `build/404.html`, `build/.nojekyll`, `build/_app/`, and no `build/server/`.
- `node scripts/check-three-pin.mjs` exits 0.
- `grep '"three": "0.175.0"' package.json` matches and no caret is present.
- `grep 'trailingSlash' src/routes/+layout.ts` and `grep "fallback: '404.html'" svelte.config.js` both match.
</verification>

<success_criteria>
FOUND-01, FOUND-02 (config layer), FOUND-03, and FOUND-04 are structurally satisfied: a fully static prerendered bundle builds with base-aware, Jekyll-safe assets and deep-link-resolvable routing, on the exact locked stack with `three` pinned in the lockfile.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-tokens-live-deploy/01-01-SUMMARY.md`.
</output>
