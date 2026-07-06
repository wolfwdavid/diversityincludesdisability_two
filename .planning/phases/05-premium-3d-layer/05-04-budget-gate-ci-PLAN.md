---
phase: 05-premium-3d-layer
plan: 04
type: execute
wave: 3
depends_on: ["05-03"]
files_modified:
  - scripts/check-premium-budget.mjs
  - package.json
  - .github/workflows/deploy.yml
autonomous: true
requirements: [PREM-03]

must_haves:
  truths:
    - "A committed script proves the accessible static-import closure contains zero WebGL runtime signatures (codifies the Phase-4 A11Y-08 scan that was only ever run manually)"
    - "The same script measures the premium (lazy) graph, asserts it is non-empty, and fails if its gzip total exceeds 500,000 bytes (D-07)"
    - "CI runs the gate on every deploy: deploy.yml has a budget step after Build"
    - "pnpm run check:premium-budget works locally against a fresh build"
  artifacts:
    - path: "scripts/check-premium-budget.mjs"
      provides: "graph partition + zero-WebGL assertion + gzip budget with per-file table"
      min_lines: 60
      contains: "500_000"
    - path: "package.json"
      provides: "check:premium-budget script entry"
      contains: "check:premium-budget"
    - path: ".github/workflows/deploy.yml"
      provides: "budget gate step after Build, before upload-pages-artifact"
      contains: "check-premium-budget"
  key_links:
    - from: "scripts/check-premium-budget.mjs"
      to: "build/_app/immutable/{entry,nodes}"
      via: "static-import closure walk (never follows dynamic import())"
      pattern: "immutable"
    - from: ".github/workflows/deploy.yml"
      to: "scripts/check-premium-budget.mjs"
      via: "run: node scripts/check-premium-budget.mjs"
      pattern: "check-premium-budget"
---

<objective>
Turn PREM-03 and D-07 into a committed, CI-enforced gate: `scripts/check-premium-budget.mjs` walks the
built chunk graph, proves the accessible entry graph is WebGL-free (the structural zero-WebGL promise),
proves the premium graph exists as a separate lazy set, and enforces a 500 KB-gzip ceiling on it
("Premium must never mean heavy" — the budget is part of the brand promise).

Purpose: PREM-03 permanent enforcement + codifying the A11Y-08 scan 04-06 ran manually.
Output: the script, a package.json entry, and a deploy.yml gate step.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-premium-3d-layer/05-RESEARCH.md
@scripts/check-contrast.mjs
@scripts/check-three-pin.mjs
@.github/workflows/deploy.yml
@package.json

<interfaces>
<!-- Build layout (adapter-static, Vite 7): build/_app/immutable/ contains entry/ (start.*.js,
     app.*.js), nodes/ (per-route components), chunks/ (shared + code-split), assets/ (css).
     Chunk names are content-hashed. Minified import forms to match (from 05-RESEARCH Pattern 6):
       import{a as b}from"./CBx1.js"  |  import"./x.js"  |  export{a}from"./y.js"
     Dynamic imports appear as import("./hash.js") — these are EXACTLY the premium boundary and
     MUST NOT be followed. __vite__mapDeps string arrays reference lazy-dep filenames but are not
     import statements — the regex walk naturally ignores them. -->

<!-- Signature set (survives minification; three embeds 'THREE.'-prefixed string literals; a naive
     three|webgl grep false-positives on the accessibility statement's own prose — Phase 4 lesson): -->
```js
const SIG = /WebGLRenderer|@threlte|THREE\./;
const BUDGET = 500_000; // gzip bytes (D-07: comfortably under the ~600KB guideline)
const STATIC_IMPORT = /(?:import|export)\s*(?:[\w${},*\s]+from\s*)?["']([^"']+\.js)["']/g;
```

<!-- Existing script conventions (check-contrast.mjs / check-three-pin.mjs): plain node ESM .mjs,
     console PASS/FAIL lines, process.exit(1) on failure — mirror the style. -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: check-premium-budget.mjs — graph partition, zero-WebGL closure, gzip budget</name>
  <files>scripts/check-premium-budget.mjs, package.json</files>
  <read_first>
    - scripts/check-contrast.mjs and scripts/check-three-pin.mjs (house style: ESM, PASS/FAIL logging, exit codes)
    - .planning/phases/05-premium-3d-layer/05-RESEARCH.md (Pattern 6 — the exact algorithm; "Recommended: budget script core" example)
    - build/_app/immutable/ after a local `pnpm build` (inspect real minified import shapes before finalizing the regex)
  </read_first>
  <action>
    Create `scripts/check-premium-budget.mjs` (node:fs + node:path + node:zlib only, no deps) implementing:
    1. ROOTS: every `.js` file under `build/_app/immutable/entry/` and `build/_app/immutable/nodes/`.
       If `build/` is missing, print "run pnpm build first" and exit 1.
    2. CLOSURE: BFS over ROOTS. For each file, extract static import/export specifiers with
       `STATIC_IMPORT` (see interfaces). Reject any match whose full matched text contains `import(`
       (belt-and-braces: the regex should not match dynamic imports because `import(` has no
       quote directly after `import`, but guard anyway). Resolve each specifier relative to the
       importing file's directory (`path.resolve(path.dirname(file), spec)`); only follow paths that
       exist under `build/_app/`.
    3. ASSERT A (zero-WebGL accessible graph, PREM-03/A11Y-08): no file in CLOSURE matches
       `SIG = /WebGLRenderer|@threlte|THREE\./` on its contents. On violation, print each offending
       file, exit 1.
    4. PREMIUM SET: all `.js` under `build/_app/immutable/` NOT in CLOSURE whose contents match SIG,
       expanded by THEIR static closure (minus CLOSURE members). ASSERT B: the set is NON-EMPTY
       (guards against scan rot — if the premium chunk disappears, the gate must scream, not pass
       vacuously). Exit 1 with message "premium graph not found — did the entry gate change?" if empty.
    5. BUDGET: sum `gzipSync(readFileSync(f)).length` over the premium set. Print a per-file table
       (filename, raw bytes, gzip bytes) plus the total, then ASSERT C: total <= `BUDGET = 500_000`.
       Exit 1 over budget, printing the excess amount.
    6. Success output: `PASS accessible graph WebGL-free (N files)` and
       `PASS premium graph M files, X bytes gzip <= 500000`.
    Add to `package.json` scripts: `"check:premium-budget": "node scripts/check-premium-budget.mjs"`.
  </action>
  <acceptance_criteria>
    - `grep -q 'WebGLRenderer|@threlte|THREE' scripts/check-premium-budget.mjs` (exact signature set present)
    - `grep -q "500_000" scripts/check-premium-budget.mjs`
    - `grep -q "gzipSync" scripts/check-premium-budget.mjs`
    - `grep -q "premium graph not found" scripts/check-premium-budget.mjs` (scan-rot guard exists)
    - `grep -q '"check:premium-budget": "node scripts/check-premium-budget.mjs"' package.json`
    - `pnpm build && node scripts/check-premium-budget.mjs` exits 0, printing both PASS lines and a non-empty premium file table
  </acceptance_criteria>
  <verify>
    <automated>pnpm build && node scripts/check-premium-budget.mjs</automated>
  </verify>
  <done>Script partitions the real build: accessible closure signature-free, premium set non-empty and within 500 KB gzip; per-file table printed; package.json script wired.</done>
</task>

<task type="auto">
  <name>Task 2: Wire the gate into CI (deploy.yml)</name>
  <files>.github/workflows/deploy.yml</files>
  <read_first>
    - .github/workflows/deploy.yml (current step order: checkout → pnpm → node → install → three-pin → contrast → Build → upload)
  </read_first>
  <action>
    In `.github/workflows/deploy.yml`, add exactly one step AFTER the `Build` step and BEFORE
    `actions/upload-pages-artifact@v5`:
    ```yaml
      - name: Premium chunk budget + zero-WebGL gate (PREM-03, D-07)
        run: node scripts/check-premium-budget.mjs
    ```
    Do not reorder or modify any existing step. The script reads `build/` produced by the Build step
    (which runs with BASE_PATH set — the script is path-agnostic; it walks build/_app/immutable).
  </action>
  <acceptance_criteria>
    - `grep -q "check-premium-budget.mjs" .github/workflows/deploy.yml`
    - Step ordering correct: `awk '/name: Build/{b=NR} /check-premium-budget/{c=NR} /upload-pages-artifact/{u=NR} END{exit !(b<c && c<u)}' .github/workflows/deploy.yml` exits 0
    - `pnpm lint` exits 0 (prettier validates the yml formatting)
  </acceptance_criteria>
  <verify>
    <automated>pnpm lint && awk '/name: Build/{b=NR} /check-premium-budget/{c=NR} /upload-pages-artifact/{u=NR} END{exit !(b<c && c<u)}' .github/workflows/deploy.yml</automated>
  </verify>
  <done>Every push to main runs the budget + zero-WebGL gate between Build and artifact upload; a regression can never deploy.</done>
</task>

</tasks>

<verification>
- `pnpm build && pnpm run check:premium-budget` exits 0 locally
- deploy.yml step order: three-pin → contrast → Build → premium-budget → upload
- Reported premium gzip total is plausibly in the researched 150-300 KB range; if it exceeds 300 KB,
  note in the SUMMARY to investigate accidental @threlte/extras barrel pull-in (Open Question 2)
</verification>

<success_criteria>
- PREM-03 is enforced by a committed script in CI, not by manual greps
- The 500 KB gzip ceiling (D-07) fails the build when breached
- The accessible zero-WebGL promise (A11Y-08 continuity) is a permanent deploy gate
</success_criteria>

<output>
After completion, create `.planning/phases/05-premium-3d-layer/05-04-SUMMARY.md`
</output>
