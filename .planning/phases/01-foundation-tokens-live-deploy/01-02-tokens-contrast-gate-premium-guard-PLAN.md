---
phase: 01-foundation-tokens-live-deploy
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/lib/tokens/colors.ts
  - src/lib/tokens/pairs.ts
  - src/lib/tokens/tokens.css
  - src/app.css
  - src/routes/+page.svelte
  - scripts/check-contrast.mjs
  - src/lib/premium/.gitkeep
  - src/lib/premium/README.md
  - eslint.config.js
  - package.json
autonomous: true
requirements: [A11Y-06]
must_haves:
  truths:
    - "Every foreground×background pair declared in pairs.ts meets its required WCAG 2.2 AA threshold"
    - "The DID palette lives in ONE typed source (colors.ts); tokens.css custom properties mirror it exactly"
    - "The home placeholder renders with the DID blue/orange tokens (visible proof the palette applied)"
    - "No file outside src/lib/premium/ can import from $lib/premium/* (ESLint blocks it)"
  artifacts:
    - path: "src/lib/tokens/colors.ts"
      provides: "single typed palette source (blue900, orange500, orangeDeep, ink, white)"
      contains: "export const palette"
    - path: "src/lib/tokens/pairs.ts"
      provides: "fg×bg pairs manifest with required WCAG level"
      contains: "export const pairs"
    - path: "src/lib/tokens/tokens.css"
      provides: ":root custom properties mirroring colors.ts"
      contains: ":root"
    - path: "scripts/check-contrast.mjs"
      provides: "A11Y-06 culori WCAG gate over colors.ts + pairs.ts"
    - path: "src/lib/premium/.gitkeep"
      provides: "architecture-invariant placeholder dir for Phase 5 client-only 3D"
    - path: "eslint.config.js"
      provides: "no-restricted-imports rule blocking $lib/premium/* outside premium/"
      contains: "no-restricted-imports"
  key_links:
    - from: "scripts/check-contrast.mjs"
      to: "src/lib/tokens/colors.ts + pairs.ts"
      via: "import palette + pairs, wcagContrast() per pair"
      pattern: "wcagContrast"
    - from: "src/app.css"
      to: "src/lib/tokens/tokens.css"
      via: "@import"
      pattern: "@import.*tokens.css"
---

<objective>
Establish the DID design tokens as a single typed source, mirror them into CSS custom properties, prove they render on the home placeholder, and gate them with an automated WCAG 2.2 AA contrast check (A11Y-06). Also plant the architecture invariant: an empty `src/lib/premium/` directory with an ESLint rule that forbids anything in Phases 1–4 from importing it.

Purpose: A11Y-06 must be a build-blocking gate, not a hope — the contrast script is the arbiter that drives the chosen hexes. The premium-import guard makes the "Accessible bundle ships zero WebGL" promise (PREM-03, Phase 5) structurally true from day one.
Output: `colors.ts`/`pairs.ts`/`tokens.css`, a styled home placeholder, `scripts/check-contrast.mjs`, and the `lib/premium/` + ESLint guard.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md
@.planning/phases/01-foundation-tokens-live-deploy/01-VALIDATION.md
@CLAUDE.md

<interfaces>
<!-- Contrast-verified DID hexes (computed against WCAG 2.2 AA math; all pairs below PASS with margin). -->
<!-- culori@4.0.2 provides wcagContrast(a, b). Node 24 strips TS types natively, so `node scripts/check-contrast.mjs` -->
<!-- can import the .ts token source directly (import specifier must include the `.ts` extension). -->
palette (final, all pairs pass):
  blue900   #0b2a4a  → body/link/heading text on white, focus ring (14.54:1 on white)
  orange500 #e8730c  → large-text / background accent; button BACKGROUND with ink text (ink on it = 5.86:1)
  orangeDeep #c85f08 → orange UI borders/accents on white (4.12:1 — safe for AA-ui)
  ink       #12181f  → body text on white (17.85:1); text on orange background
  white     #ffffff
WCAG 2.2 AA thresholds: AA-normal 4.5 · AA-large 3 · AA-ui 3 (SC 1.4.3 / 1.4.11)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Author the typed token source, CSS custom properties, and styled home placeholder</name>
  <files>src/lib/tokens/colors.ts, src/lib/tokens/pairs.ts, src/lib/tokens/tokens.css, src/app.css, src/routes/+page.svelte</files>
  <read_first>
    - .planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md (§ Pattern 4 token structure; Pitfall 4 orange-as-body-text; Open Question 1 hex selection)
    - src/routes/+page.svelte (scaffold-generated home page being replaced)
    - src/app.css (created in plan 01 Task 2 — the minimal scaffold does NOT ship it; this task EXTENDS it with the token @import + base-token rules, it does not create it)
  </read_first>
  <behavior>
    - After this task, `scripts/check-contrast.mjs` (Task 2) run over these tokens must report PASS for every pair.
    - Every custom property in tokens.css has an identical hex to the same key in colors.ts (no drift).
  </behavior>
  <action>
    1. Create `src/lib/tokens/colors.ts` as the SINGLE typed source (exact hexes — contrast-verified):
       ```typescript
       export const palette = {
         blue900: '#0b2a4a',   // body/link/heading text on white; focus ring
         orange500: '#e8730c',  // large-text / background accent; button background (with ink text)
         orangeDeep: '#c85f08', // orange UI borders/accents on white
         ink: '#12181f',        // body text on white; text on an orange background
         white: '#ffffff'
       } as const;

       // Semantic tokens (map roles → palette keys) — consumed by CSS + components
       export const semantic = {
         text: palette.ink,
         link: palette.blue900,
         heading: palette.blue900,
         accent: palette.orange500,
         accentBorder: palette.orangeDeep,
         focusRing: palette.blue900,
         surface: palette.white
       } as const;
       ```
    2. Create `src/lib/tokens/pairs.ts` — the fg×bg pairs manifest with required WCAG level (every pair PASSES; see interfaces):
       ```typescript
       export type Level = 'AA-normal' | 'AA-large' | 'AA-ui';
       export const pairs: { name: string; fg: keyof typeof import('./colors').palette; bg: keyof typeof import('./colors').palette; level: Level }[] = [
         { name: 'body text on white',        fg: 'ink',        bg: 'white',      level: 'AA-normal' }, // 17.85
         { name: 'primary link on white',     fg: 'blue900',    bg: 'white',      level: 'AA-normal' }, // 14.54
         { name: 'heading on white',          fg: 'blue900',    bg: 'white',      level: 'AA-large'  }, // 14.54
         { name: 'button label on orange',    fg: 'ink',        bg: 'orange500',  level: 'AA-normal' }, // 5.86
         { name: 'focus ring vs white',       fg: 'blue900',    bg: 'white',      level: 'AA-ui'     }, // 14.54
         { name: 'orange UI border vs white', fg: 'orangeDeep', bg: 'white',      level: 'AA-ui'     }  // 4.12
       ];
       ```
       Keep the palette reference TYPE-ONLY (`keyof typeof import('./colors').palette`) — it is fully erased at build. Do NOT add a runtime `import { palette } from './colors'` here: `pairs.ts` is loaded by `check-contrast.mjs` via Node 24 type-stripping, which requires an explicit `.ts` extension on runtime imports, so an extensionless runtime import would crash the gate. If you prefer a named alias, use `import type { palette as _P } from './colors';` (still erased) and type `fg`/`bg` as `keyof typeof _P`.
    3. Create `src/lib/tokens/tokens.css` — `:root` custom properties whose hexes MIRROR colors.ts EXACTLY:
       ```css
       :root {
         --did-blue-900: #0b2a4a;
         --did-orange-500: #e8730c;
         --did-orange-deep: #c85f08;
         --did-ink: #12181f;
         --did-white: #ffffff;

         --color-text: var(--did-ink);
         --color-link: var(--did-blue-900);
         --color-heading: var(--did-blue-900);
         --color-accent: var(--did-orange-500);
         --color-accent-border: var(--did-orange-deep);
         --color-focus-ring: var(--did-blue-900);
         --color-surface: var(--did-white);
       }
       ```
    4. In `src/app.css` (already created in plan 01 Task 2), add `@import './lib/tokens/tokens.css';` at the top (above the existing base reset), then apply base tokens: set `body { color: var(--color-text); background: var(--color-surface); }`, links `a { color: var(--color-link); }`, and a visible focus style `:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }`.
    5. Replace `src/routes/+page.svelte` with a minimal styled home placeholder that PROVES the tokens render — a single `<h1>` in `--color-heading`, a paragraph in `--color-text`, and one CTA button styled `background: var(--color-accent); color: var(--did-ink); border: 2px solid var(--color-accent-border);` with a base-aware link:
       ```svelte
       <script lang="ts">
         import { base } from '$app/paths';
       </script>

       <main>
         <h1 style="color: var(--color-heading)">Diversity Includes Disability</h1>
         <p style="color: var(--color-text)">Foundation deploy placeholder — DID design tokens live.</p>
         <a class="cta" href="{base}/" style="background: var(--color-accent); color: var(--did-ink); border: 2px solid var(--color-accent-border); padding: .5rem 1rem; border-radius: .375rem; text-decoration: none; display: inline-block;">Let's Connect</a>
       </main>
       ```
    6. Run `pnpm build` to confirm the token CSS is bundled and the page prerenders without error.
  </action>
  <verify>
    <automated>grep -q "export const palette" src/lib/tokens/colors.ts && grep -q "export const pairs" src/lib/tokens/pairs.ts && grep -q ":root" src/lib/tokens/tokens.css && grep -q "tokens.css" src/app.css && grep -q "#0b2a4a" src/lib/tokens/colors.ts && grep -q "#0b2a4a" src/lib/tokens/tokens.css && pnpm build && test -f build/index.html</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/tokens/colors.ts` exports `palette` with keys blue900/orange500/orangeDeep/ink/white and the exact hexes above
    - `src/lib/tokens/pairs.ts` exports `pairs` with all six entries and their `level` tags
    - `src/lib/tokens/tokens.css` `:root` hexes match colors.ts exactly (e.g. both contain `#0b2a4a` and `#e8730c`)
    - `src/app.css` contains `@import` of `tokens.css`
    - `src/routes/+page.svelte` uses `var(--color-heading)` / `var(--color-accent)` and imports `base` from `$app/paths`
    - `pnpm build` succeeds and emits `build/index.html`
  </acceptance_criteria>
  <done>The DID palette exists as one typed source mirrored into CSS custom properties, and the home placeholder visibly renders with those tokens.</done>
</task>

<task type="auto">
  <name>Task 2: Write the culori WCAG contrast gate (A11Y-06)</name>
  <files>scripts/check-contrast.mjs, package.json</files>
  <read_first>
    - src/lib/tokens/colors.ts and src/lib/tokens/pairs.ts (the source the gate imports)
    - .planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md (§ Pattern 4 check-contrast.mjs verbatim; Open Question 2 running against .ts)
    - .planning/phases/01-foundation-tokens-live-deploy/01-VALIDATION.md (Per-Task Verification Map → A11Y-06 command)
  </read_first>
  <action>
    1. Add culori (pinned): `pnpm add -D culori@4.0.2`.
    2. Create `scripts/check-contrast.mjs` (from RESEARCH Pattern 4). DECISION on the .ts-import question (RESEARCH Open Q2): keep `colors.ts`/`pairs.ts` as the single typed source and run the gate with plain `node` — Node 24 (the pinned runtime, and the CI `setup-node` version) strips TypeScript types natively, so a `.mjs` importing a `.ts` by explicit `.ts` path works with zero extra tooling. Write it EXACTLY:
       ```javascript
       import { wcagContrast } from 'culori';
       import { palette } from '../src/lib/tokens/colors.ts';
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
    3. Add a `package.json` script: `"check:contrast": "node scripts/check-contrast.mjs"`.
    4. Run `node scripts/check-contrast.mjs`. It MUST print PASS for all six pairs and exit 0. If any pair FAILs (e.g. a brand hex pulled from the Wix site is too light), the gate is the arbiter — darken the offending palette hex in colors.ts (and mirror in tokens.css) until it passes; never lower the MIN thresholds or weaken the manifest.
       (Fallback if this runtime's Node is <23.6 and type-stripping is unavailable: `pnpm add -D tsx@latest` and run `pnpm exec tsx scripts/check-contrast.mjs`. CI uses Node 24, so `node` is the primary path.)
  </action>
  <verify>
    <automated>node scripts/check-contrast.mjs</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/check-contrast.mjs` imports `palette` from `colors.ts` and `pairs` from `pairs.ts` and uses `wcagContrast`
    - `node scripts/check-contrast.mjs` prints `PASS` for all six pairs and exits 0
    - `culori@4.0.2` is in devDependencies; `package.json` has a `check:contrast` script
    - Temporarily setting a failing hex (e.g. orange500 = `#ffcc66`) makes the script FAIL and exit non-zero (gate is real) — do NOT commit such a change
  </acceptance_criteria>
  <done>A11Y-06 is an automated, CI-runnable gate: every declared token pair is proven to meet WCAG 2.2 AA contrast, and the token source is the single arbiter.</done>
</task>

<task type="auto">
  <name>Task 3: Plant the lib/premium architecture invariant and ESLint import guard</name>
  <files>src/lib/premium/.gitkeep, src/lib/premium/README.md, eslint.config.js</files>
  <read_first>
    - eslint.config.js (scaffold-generated flat config being extended)
    - .planning/phases/01-foundation-tokens-live-deploy/01-RESEARCH.md (§ Pattern 5 premium guard; § Architecture Patterns project structure)
    - .planning/STATE.md (Decisions: "Nothing in phases 1–4 may import from lib/premium/")
  </read_first>
  <action>
    1. Create the empty premium directory placeholder `src/lib/premium/.gitkeep` (zero bytes).
    2. Create `src/lib/premium/README.md` stating the invariant verbatim: "Client-only Premium 3D (Threlte/three) lands here in Phase 5. NOTHING outside `src/lib/premium/` may import from `$lib/premium/*` in Phases 1–4 — this keeps the Accessible bundle at zero WebGL bytes (PREM-03). The single dynamic-import entry gate is added in Phase 5."
    3. Extend `eslint.config.js` (flat config) with a `no-restricted-imports` rule blocking premium imports outside `premium/`. Add a config object:
       ```javascript
       {
         rules: {
           'no-restricted-imports': ['error', {
             patterns: ['$lib/premium/*', '**/lib/premium/*']
           }]
         }
       }
       ```
       Ensure this applies to `.ts`/`.svelte`/`.js` source files. (The Phase-5 dynamic-import gate will later override this rule for the single allowed entry file only — do not add that override now.)
    4. Verify the guard actually fires: create a temp file `src/routes/__guardcheck.ts` containing `import '$lib/premium/x';`, run `pnpm lint` (or `pnpm exec eslint src/routes/__guardcheck.ts`), confirm it reports a `no-restricted-imports` error, then DELETE the temp file. Confirm `pnpm lint` is clean afterward.
  </action>
  <verify>
    <automated>test -f src/lib/premium/.gitkeep && test -f src/lib/premium/README.md && grep -q "no-restricted-imports" eslint.config.js && grep -q "lib/premium" eslint.config.js && pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/premium/.gitkeep` and `src/lib/premium/README.md` exist; README states the Phases 1–4 no-import invariant
    - `eslint.config.js` contains a `no-restricted-imports` rule with patterns `$lib/premium/*` and `**/lib/premium/*`
    - An import of `$lib/premium/*` from outside `premium/` produces an ESLint error (verified with the temp file, which is then deleted)
    - `pnpm lint` passes clean on the committed tree (no leftover temp file)
  </acceptance_criteria>
  <done>The empty `lib/premium/` exists and an ESLint gate forbids any Phase 1–4 code from importing it, making the zero-WebGL Accessible-baseline invariant structural rather than conventional.</done>
</task>

</tasks>

<verification>
- `node scripts/check-contrast.mjs` prints PASS for all six pairs and exits 0.
- `grep '#0b2a4a' src/lib/tokens/colors.ts` and `grep '#0b2a4a' src/lib/tokens/tokens.css` both match (no drift).
- `grep 'no-restricted-imports' eslint.config.js` matches and `pnpm lint` is clean.
- `pnpm build` still succeeds with tokens applied.
</verification>

<success_criteria>
A11Y-06 is satisfied by an automated WCAG 2.2 AA gate over a single typed DID token source that visibly renders on the home placeholder; the `lib/premium/` import guard locks the accessible-baseline architecture invariant.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-tokens-live-deploy/01-02-SUMMARY.md`.
</output>
