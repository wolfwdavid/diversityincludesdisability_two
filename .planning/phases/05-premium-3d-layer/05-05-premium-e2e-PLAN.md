---
phase: 05-premium-3d-layer
plan: 05
type: execute
wave: 4
depends_on: ["05-03", "05-04"]
files_modified:
  - tests/premium.e2e.ts
autonomous: false
requirements: [PREM-01, PREM-02, PREM-04, PREM-05, PREM-06]

must_haves:
  truths:
    - "Seeded Accessible mode loads zero canvas elements and requests no premium JS until the toggle is flipped; flipping fetches a NEW js chunk and mounts the canvas (PREM-03/04 lazy proof)"
    - "In Premium mode the SAME canvas element persists across client-side navigation to Services/About/Contact (single shared Canvas, D-04/PREM-02)"
    - "With prefers-reduced-motion emulated AND a stored premium choice, the canvas mounts but data-motion='paused' (PREM-06, Pitfall 4)"
    - "With WebGL stubbed dead AND stored premium, no canvas mounts and <html data-webgl='no'> reverts the skin (Success Criteria 5, Pitfall 5)"
    - "20 rapid mode toggles produce zero page errors and end with a live canvas (PREM-05 disposal/context proof, Pitfall 2)"
  artifacts:
    - path: "tests/premium.e2e.ts"
      provides: "6 E2E tests: lazy gate, no-WebGL fallback, single-canvas mount, PRM pause, nav persistence, toggle stress"
      min_lines: 80
  key_links:
    - from: "tests/premium.e2e.ts"
      to: "the ModeToggle switch"
      via: "page.getByRole('switch') + dispatchEvent('click') (Phase-3 actionability pattern)"
      pattern: "getByRole\\('switch'\\)"
    - from: "tests/premium.e2e.ts"
      to: "src/lib/premium/PremiumLayer.svelte"
      via: ".premium-backdrop canvas locator + data-motion attribute"
      pattern: "premium-backdrop"
    - from: "tests/premium.e2e.ts"
      to: "src/lib/mode/constants.ts"
      via: "localStorage seed key 'did2:mode' in addInitScript"
      pattern: "did2:mode"
---

<objective>
Prove Phase 5's success criteria end-to-end against the built preview: lazy gate, single persistent
Canvas, reduced-motion honoring inside manual Premium, no-WebGL fallback, and
toggle-stress disposal. Ends with a human checkpoint to verify the crystalline art direction
(D-01/D-02/D-03) — the one thing automation cannot judge.

Purpose: PREM-01/02/04/05/06 behavioral proof + Success Criteria 5.
Output: `tests/premium.e2e.ts` (auto-included by playwright testMatch `**/*.e2e.{ts,js}`).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-premium-3d-layer/05-RESEARCH.md
@tests/mode.e2e.ts
@playwright.config.ts
@src/lib/mode/constants.ts

<interfaces>
<!-- E2E house conventions (from tests/mode.e2e.ts + Phase-3/4 decisions): -->
```typescript
import { test, expect } from '@playwright/test';
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
// trailingSlash 'always': routes are '/', '/services/', '/about/', '/contact/', '/accessibility/'
```
- playwright.config.ts: webServer `pnpm run build && pnpm run preview` on 4173, BASE_PATH pinned,
  reuseExistingServer: true. New *.e2e.ts files are auto-discovered.
- Pitfall 7: a FRESH context resolves to the LOCKED premium default (SwiftShader WebGL present, no
  stored key). NEVER assume a starting mode — seed `did2:mode` via addInitScript for every test.
- Toggle: `<button role="switch" aria-checked={...}>` — operate via
  `page.getByRole('switch').dispatchEvent('click')` (bypasses sticky-header actionability auto-scroll).
- Premium DOM contract (05-03): `.premium-backdrop` wrapper (aria-hidden, data-motion='active'|'paused')
  containing the Threlte `<canvas>`; `<html data-webgl='ok'|'no'>` stamped by the layout on mount.
- Storage key: 'did2:mode', values 'premium' | 'accessible' (src/lib/mode/constants.ts).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Gate + fallback tests (lazy chunk, zero-canvas accessible, no-WebGL floor)</name>
  <files>tests/premium.e2e.ts</files>
  <read_first>
    - tests/mode.e2e.ts (seeding pattern, BASE constant, dispatchEvent toggle convention)
    - .planning/phases/05-premium-3d-layer/05-RESEARCH.md (Code Examples — "E2E skeletons"; adapt, don't invent)
    - src/routes/+layout.svelte (gate condition + data-webgl stamp as shipped in 05-03)
  </read_first>
  <action>
    Create `tests/premium.e2e.ts` with the shared header (BASE constant, `HOME = BASE + '/'`) and these
    three tests:
    1. "accessible mode ships no canvas; premium chunk loads lazily on toggle":
       - collect requests via `page.on('request', ...)`;
       - `addInitScript(() => localStorage.setItem('did2:mode', 'accessible'))`;
       - goto HOME, `waitForLoadState('networkidle')`;
       - `expect(await page.locator('canvas').count()).toBe(0);`
       - record `before = requests.filter(u => u.endsWith('.js')).length`;
       - `page.getByRole('switch').dispatchEvent('click')`;
       - `await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });`
       - assert js request count is now `> before` (the chunk arrived on demand — PREM-03/04).
    2. "no WebGL + stored premium falls back to accessible presentation" (Success Criteria 5):
       - addInitScript: seed `did2:mode = 'premium'` AND stub
         `HTMLCanvasElement.prototype.getContext` to return null for any type containing 'webgl'
         (keep original for '2d') — copy the research skeleton verbatim;
       - goto HOME;
       - `expect(await page.locator('canvas').count()).toBe(0);`
       - `await expect(page.locator('html')).toHaveAttribute('data-webgl', 'no');`
       - and the skin reverted: assert body background is the light surface —
         `const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);`
         `expect(bg).toBe('rgb(255, 255, 255)');`
    3. "premium default mounts exactly one canvas" (PREM-01 smoke):
       - addInitScript seed `did2:mode = 'premium'`;
       - goto HOME; `await expect(page.locator('.premium-backdrop canvas')).toBeVisible();`
       - `expect(await page.locator('canvas').count()).toBe(1);`
       - backdrop is inert: `await expect(page.locator('.premium-backdrop')).toHaveAttribute('aria-hidden', 'true');`
    NOTE: headless chromium has SwiftShader WebGL — canvas mounting works in CI. Every test seeds its
    mode explicitly (Pitfall 7).
  </action>
  <acceptance_criteria>
    - `grep -q "did2:mode" tests/premium.e2e.ts`
    - `grep -q "getContext" tests/premium.e2e.ts` (WebGL stub present)
    - `grep -q "data-webgl" tests/premium.e2e.ts`
    - `grep -q "premium-backdrop" tests/premium.e2e.ts`
    - `pnpm exec playwright test tests/premium.e2e.ts -g "no canvas|no WebGL|one canvas"` exits 0 (3 tests green against the preview)
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec playwright test tests/premium.e2e.ts</automated>
  </verify>
  <done>Lazy-gate, no-WebGL fallback (attribute + reverted skin), and single-canvas mount proven green against the built preview.</done>
</task>

<task type="auto">
  <name>Task 2: Motion, persistence, and stress tests (PRM, nav persistence, 20 toggles)</name>
  <files>tests/premium.e2e.ts</files>
  <read_first>
    - tests/premium.e2e.ts (Task 1 state — extend the same file, reuse header/helpers)
    - src/lib/premium/state/motion.svelte.ts (what flips data-motion: reduced OR hidden)
    - src/lib/content/site.ts or src/lib/components/Nav.svelte (nav link labels for client-side navigation)
  </read_first>
  <action>
    Append three tests to `tests/premium.e2e.ts`:
    4. "PRM + manually chosen premium mounts canvas but pauses motion" (PREM-06, Pitfall 4):
       - `await page.emulateMedia({ reducedMotion: 'reduce' });`
       - seed `did2:mode = 'premium'`; goto HOME;
       - `await expect(page.locator('.premium-backdrop canvas')).toBeVisible();`
       - `await expect(page.locator('.premium-backdrop')).toHaveAttribute('data-motion', 'paused');`
    5. "one canvas persists across client-side navigation" (PREM-02, D-04):
       - seed premium; `page.setViewportSize({ width: 1280, height: 800 })` (desktop nav visible); goto HOME;
       - wait for `.premium-backdrop canvas`; tag it:
         `await page.evaluate(() => document.querySelector('.premium-backdrop canvas')?.setAttribute('data-e2e-mark', '1'));`
       - click nav links in sequence (Services, About, Contact) via
         `page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: 'Services' }).click()`
         (open the disclosure first if required — mirror pages.e2e.ts handling);
       - after EACH navigation: `expect(await page.locator('canvas').count()).toBe(1);` and the mark
         survives: `await expect(page.locator('canvas[data-e2e-mark="1"]')).toHaveCount(1);`
         (same element = the Canvas persisted in the layout, not remounted).
    6. "toggle stress: 20 rapid flips, no page errors, alive at the end" (PREM-05, Pitfall 2):
       - collect `page.on('pageerror', ...)` into an array; also collect console messages containing
         'WebGL' via `page.on('console', ...)` for diagnostics;
       - seed premium; goto HOME; wait for the canvas;
       - `const sw = page.getByRole('switch'); for (let i = 0; i < 20; i++) { await sw.dispatchEvent('click'); }`
         (20 flips: even count → ends premium since it started premium);
       - `await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });`
       - `expect(errors).toEqual([]);`
       - If this test exposes a forceContextLoss ordering throw (Research Open Question 1), the fix
         belongs in src/lib/premium/Scene.svelte (wrap in try/catch or move the call to the gate owner) —
         fix forward, do not weaken the assertion.
  </action>
  <acceptance_criteria>
    - `grep -q "emulateMedia" tests/premium.e2e.ts` and `grep -q "reducedMotion" tests/premium.e2e.ts`
    - `grep -q "data-motion', 'paused'" tests/premium.e2e.ts`
    - `grep -q "data-e2e-mark" tests/premium.e2e.ts` (element-identity persistence check)
    - `grep -q "pageerror" tests/premium.e2e.ts`
    - `pnpm exec playwright test tests/premium.e2e.ts` exits 0 (all 6 tests green)
    - Existing suites unaffected: `pnpm exec playwright test tests/mode.e2e.ts` still green
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec playwright test tests/premium.e2e.ts tests/mode.e2e.ts</automated>
  </verify>
  <done>All 6 premium E2E tests green: PRM pause, single persistent canvas across nav, 20-toggle stress with zero page errors; prior mode suite unregressed.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Visual verification of the crystalline world (art direction D-01/D-02/D-03)</name>
  <what-built>
    The complete Premium 3D layer: a dark blue night world with floating faceted crystal clusters,
    orange-glow accents and particle dust, calm ambient drift, per-route camera framing (Home hero
    immersive, Accessibility page a quiet room), scroll easing + pointer parallax, dark skin + scrims
    over the unchanged Phase-4 content. All mechanics are E2E-proven; this checkpoint judges the
    AESTHETICS, which automation cannot.
  </what-built>
  <how-to-verify>
    1. Run `pnpm run preview` (a build from Task 2's E2E run is current; else `pnpm build` first).
    2. Open http://localhost:4173/diversityincludesdisability_two/ and switch to Premium via the header toggle.
    3. Home: full-viewport hero — crystalline forms drifting calmly over the deep-blue world, headline
       + "Let's Connect" CTA readable on their scrims (D-13). Text must be comfortably legible everywhere.
    4. Scroll: the world eases/morphs with scroll; move the pointer: subtle parallax (D-09) — nothing fast
       or jarring (D-03: dignified calm, this audience is motion-sensitivity-aware).
    5. Navigate Services → About → Contact: the world reconfigures per route without a canvas flash (D-04).
    6. Accessibility Statement page: near-still "quiet room" — minimal glow/spread (D-14).
    7. Toggle back to Accessible: the light zero-WebGL site returns instantly, no dark remnants.
  </how-to-verify>
  <action>Pause execution and present the walkthrough above to the user. Do not proceed to phase completion until the user responds.</action>
  <verify>User response received at the checkpoint.</verify>
  <done>User typed "approved", or their adjustment feedback has been captured for follow-up.</done>
  <resume-signal>Type "approved" if the art direction lands, or describe what to adjust (colors/motion/density/camera framing).</resume-signal>
</task>

</tasks>

<verification>
- `pnpm exec playwright test` (full E2E suite) — premium.e2e.ts 6/6 green; mode/pages/a11y/reflow suites unregressed
  (note: src/routes/demo/playwright has a pre-existing base-path failure logged in deferred-items.md — not this phase's debt)
- `pnpm check` 0/0, `pnpm lint` clean
- Human approved the visual direction
</verification>

<success_criteria>
- Every Phase-5 success criterion has a green automated test: lazy zero-WebGL accessible load, single
  persistent canvas, PRM-paused premium, no-WebGL fallback with skin revert, leak-free toggle stress
- The user has seen and approved the crystalline world
</success_criteria>

<output>
After completion, create `.planning/phases/05-premium-3d-layer/05-05-SUMMARY.md`
</output>
