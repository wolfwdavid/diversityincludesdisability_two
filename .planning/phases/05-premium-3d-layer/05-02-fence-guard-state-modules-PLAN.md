---
phase: 05-premium-3d-layer
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - eslint.config.js
  - src/lib/premium/state/tier.ts
  - src/lib/premium/state/tier.spec.ts
  - src/lib/premium/state/motion-logic.ts
  - src/lib/premium/state/motion-logic.spec.ts
  - src/lib/premium/state/motion.svelte.ts
  - src/lib/premium/state/worldState.ts
  - src/lib/premium/state/worldState.spec.ts
autonomous: true
requirements: [PREM-02, PREM-03, PREM-04, PREM-06]

must_haves:
  truths:
    - "A dynamic import('$lib/premium/...') anywhere in the codebase is an ESLint error (the fence is no longer blind to dynamic imports — verified by probe)"
    - "The motion truth table is provable in node: animating = !reduced && !hidden, parallax = !reduced && !touch (PREM-04/PREM-06 logic)"
    - "The route→world map covers all 5 routes with the quiet-room config on /accessibility (spread 0.2, glow 0.15), and the normalizer strips base path + trailing slash (Pitfall 8)"
    - "The two-tier device heuristic is a pure node-tested function (D-08)"
  artifacts:
    - path: "eslint.config.js"
      provides: "no-restricted-syntax guard on ImportExpression matching /premium/ (Pattern 1b)"
      contains: "no-restricted-syntax"
    - path: "src/lib/premium/state/tier.ts"
      provides: "resolveTier(signals) pure + detectTier() browser wrapper"
      exports: ["resolveTier", "detectTier"]
    - path: "src/lib/premium/state/motion-logic.ts"
      provides: "computeMotion pure truth table"
      exports: ["computeMotion"]
    - path: "src/lib/premium/state/motion.svelte.ts"
      provides: "runes motion authority: initMotion() + motion.{animating,parallax,reduced}"
      exports: ["initMotion", "motion"]
    - path: "src/lib/premium/state/worldState.ts"
      provides: "WORLD_CONFIGS (5 routes) + normalizeRoute + configFor"
      exports: ["WORLD_CONFIGS", "normalizeRoute", "configFor"]
  key_links:
    - from: "src/lib/premium/state/motion.svelte.ts"
      to: "src/lib/premium/state/motion-logic.ts"
      via: "relative import (fence forbids $lib/premium alias even internally)"
      pattern: "from './motion-logic'"
    - from: "src/lib/premium/state/motion.svelte.ts"
      to: "prefers-reduced-motion media query"
      via: "matchMedia + change listener (live OS flips honored — Pitfall 4)"
      pattern: "prefers-reduced-motion"
    - from: "src/lib/premium/state/worldState.spec.ts"
      to: "src/lib/premium/state/worldState.ts"
      via: "relative import in node vitest project"
      pattern: "normalizeRoute"
---

<objective>
Close the dynamic-import hole in the premium fence (research-verified: `no-restricted-imports` does NOT
see `import()`) and build the three pure premium state modules — device tier (D-08), motion authority
logic (PREM-04/PREM-06), and the route→world configuration map (PREM-02, D-04/D-14) — TDD, node-tested,
before any Svelte/Three code exists. These are the contracts Wave 2 implements against.

Purpose: PREM-03 structural enforcement + the testable logic core of PREM-04/PREM-06/PREM-02.
Output: hardened eslint.config.js + `src/lib/premium/state/` modules with green node specs.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-premium-3d-layer/05-RESEARCH.md
@eslint.config.js
@src/lib/mode/resolve.ts
@vite.config.ts

<interfaces>
<!-- Vitest projects (from vite.config.ts): 'server' = node, includes src/**/*.{test,spec}.{js,ts},
     excludes *.svelte.{test,spec}. New .spec.ts files under src/lib/premium/state/ land in the fast
     node project automatically. requireAssertions is ON — every test needs an expect. -->

<!-- Fence status (from eslint.config.js lines 36-49): no-restricted-imports blocks STATIC imports of
     $lib/premium/* and **/lib/premium/* in ALL files (including files inside src/lib/premium!).
     Consequence: modules INSIDE src/lib/premium/ must import siblings RELATIVELY ('./motion-logic'),
     never via the $lib/premium alias. -->

<!-- Consumers in Wave 2 (05-03) will use exactly these signatures — they are the contract: -->
```typescript
// tier.ts
export type Tier = 'full' | 'low';
export interface TierSignals { dpr: number; coarsePointer: boolean; deviceMemory?: number }
export function resolveTier(s: TierSignals): Tier;
export function detectTier(): Tier; // browser-only wrapper

// motion-logic.ts
export interface MotionSignals { reduced: boolean; hidden: boolean; touch: boolean }
export interface MotionFlags { animating: boolean; parallax: boolean }
export function computeMotion(s: MotionSignals): MotionFlags;

// motion.svelte.ts (runes — consumed by useTask running gates in 05-03)
export function initMotion(): void; // wires matchMedia/visibilitychange listeners once
export const motion: { readonly animating: boolean; readonly parallax: boolean; readonly reduced: boolean };

// worldState.ts
export interface WorldConfig { camera: readonly [number, number, number]; spread: number; glow: number }
export const WORLD_CONFIGS: Record<string, WorldConfig>;
export function normalizeRoute(pathname: string, base: string): string;
export function configFor(path: string): WorldConfig;
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: ESLint dynamic-import guard (Pattern 1b) + probe verification</name>
  <files>eslint.config.js</files>
  <read_first>
    - eslint.config.js (the existing no-restricted-imports fence block at lines 36-49 — add to THAT rules object)
    - .planning/phases/05-premium-3d-layer/05-RESEARCH.md (Pattern 1b — the verified selector)
  </read_first>
  <action>
    In `eslint.config.js`, inside the existing architecture-invariant config object (the one carrying
    `no-restricted-imports`), add a sibling rule:
    ```js
    'no-restricted-syntax': [
    	'error',
    	{
    		selector: "ImportExpression > Literal[value=/premium/]",
    		message:
    			'Dynamic import of $lib/premium/* is only allowed at the single layout entry gate (PREM-03).'
    	}
    ]
    ```
    Also update the comment on that block: the invariant now covers BOTH static and dynamic imports, and
    Phase 5's single gate in src/routes/+layout.svelte carries a scoped
    `eslint-disable-next-line no-restricted-syntax` (added in 05-03).
    Then PROVE the guard works with a throwaway probe (do not commit the probe):
    create `src/probe-premium-guard.ts` containing
    `export async function probe() { return import('$lib/premium/PremiumLayer.svelte'); }`,
    run `pnpm exec eslint src/probe-premium-guard.ts` and confirm it exits NON-zero citing
    no-restricted-syntax, then DELETE the probe file.
  </action>
  <acceptance_criteria>
    - `grep -q "no-restricted-syntax" eslint.config.js`
    - `grep -q "ImportExpression" eslint.config.js`
    - Probe check: `printf 'export async function p() { return import("$lib/premium/x"); }\n' > src/probe.ts; pnpm exec eslint src/probe.ts | grep -q "no-restricted-syntax"; rm src/probe.ts` succeeds (guard fires)
    - `pnpm exec eslint .` exits 0 on the real codebase (no premium dynamic imports exist yet)
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec eslint . && grep -q "ImportExpression" eslint.config.js</automated>
  </verify>
  <done>Dynamic premium imports are structurally forbidden everywhere; repo lints clean; probe demonstrated the rule fires.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Tier heuristic + motion authority (pure logic first, runes wrapper second)</name>
  <files>src/lib/premium/state/tier.ts, src/lib/premium/state/tier.spec.ts, src/lib/premium/state/motion-logic.ts, src/lib/premium/state/motion-logic.spec.ts, src/lib/premium/state/motion.svelte.ts</files>
  <read_first>
    - .planning/phases/05-premium-3d-layer/05-RESEARCH.md (Pattern 3 — motion authority; useTask `running` is the consumer)
    - src/lib/mode/mode.svelte.ts (house style for runes modules: module-level $state + getter exports)
    - vite.config.ts (spec placement: plain .spec.ts → node 'server' project)
  </read_first>
  <behavior>
    tier.spec.ts (write FIRST, red):
    - resolveTier({ dpr: 2, coarsePointer: true }) === 'low' (touch/mobile → low, D-08/D-12)
    - resolveTier({ dpr: 1, coarsePointer: false, deviceMemory: 4 }) === 'low' (<=4GB → low)
    - resolveTier({ dpr: 2, coarsePointer: false, deviceMemory: 8 }) === 'full'
    - resolveTier({ dpr: 1, coarsePointer: false }) === 'full' (deviceMemory undefined → not low)
    motion-logic.spec.ts (write FIRST, red) — full 8-row truth table:
    - computeMotion({reduced:false, hidden:false, touch:false}) → {animating:true,  parallax:true}
    - computeMotion({reduced:true,  hidden:false, touch:false}) → {animating:false, parallax:false}
    - computeMotion({reduced:false, hidden:true,  touch:false}) → {animating:false, parallax:true}
    - computeMotion({reduced:false, hidden:false, touch:true})  → {animating:true,  parallax:false}
    - remaining 4 combinations asserted (reduced dominates both flags)
  </behavior>
  <action>
    RED: create both spec files with the cases above importing RELATIVELY ('./tier', './motion-logic');
    run `pnpm exec vitest --run --project=server` — new specs fail (modules missing). Commit.
    GREEN: implement:
    `tier.ts` — exactly the interface contract:
    ```ts
    export type Tier = 'full' | 'low';
    export interface TierSignals { dpr: number; coarsePointer: boolean; deviceMemory?: number }
    export function resolveTier(s: TierSignals): Tier {
    	if (s.coarsePointer) return 'low'; // D-12: touch devices get the reduced tier
    	if (s.deviceMemory !== undefined && s.deviceMemory <= 4) return 'low';
    	return 'full';
    }
    export function detectTier(): Tier {
    	return resolveTier({
    		dpr: window.devicePixelRatio ?? 1,
    		coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    		deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    	});
    }
    ```
    `motion-logic.ts` — pure truth table:
    ```ts
    export interface MotionSignals { reduced: boolean; hidden: boolean; touch: boolean }
    export interface MotionFlags { animating: boolean; parallax: boolean }
    export function computeMotion(s: MotionSignals): MotionFlags {
    	return { animating: !s.reduced && !s.hidden, parallax: !s.reduced && !s.touch };
    }
    ```
    `motion.svelte.ts` — the ONE runes motion authority (Research Pattern 3, delegating to computeMotion):
    module-level `let reduced = $state(false); let hidden = $state(false); let touch = $state(false);`
    `export function initMotion()` wires (idempotently — guard with a module flag so double-init never
    double-subscribes): `matchMedia('(prefers-reduced-motion: reduce)')` matches + 'change' listener → reduced
    (live OS flips, Pitfall 4); `document.hidden` + 'visibilitychange' listener → hidden (PREM-04);
    `matchMedia('(pointer: coarse)').matches` → touch (D-12).
    `export const motion = { get animating() {...}, get parallax() {...}, get reduced() { return reduced; } }`
    where the first two return `computeMotion({ reduced, hidden, touch }).animating/.parallax`.
    Run specs green. Commit.
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest --run --project=server` exits 0 including tier.spec.ts + motion-logic.spec.ts
    - `grep -q "export function resolveTier" src/lib/premium/state/tier.ts`
    - `grep -q "export function computeMotion" src/lib/premium/state/motion-logic.ts`
    - `grep -q "prefers-reduced-motion" src/lib/premium/state/motion.svelte.ts`
    - `grep -q "visibilitychange" src/lib/premium/state/motion.svelte.ts`
    - `grep -q "from './motion-logic'" src/lib/premium/state/motion.svelte.ts` (relative import, fence-safe)
    - No `$lib/premium` string in any new file: `! grep -rq "\$lib/premium" src/lib/premium/state/`
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest --run --project=server && pnpm check</automated>
  </verify>
  <done>Tier + motion logic node-proven (truth table green); runes wrapper exposes motion.{animating,parallax,reduced} for 05-03 useTask running gates.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Route→world configuration map + normalizer (Pitfall 8)</name>
  <files>src/lib/premium/state/worldState.ts, src/lib/premium/state/worldState.spec.ts</files>
  <read_first>
    - .planning/phases/05-premium-3d-layer/05-RESEARCH.md (Pattern 5 — configs; Pitfall 8 — base + trailing slash)
    - svelte.config.js (paths.base comes from BASE_PATH env — '' in dev, '/diversityincludesdisability_two' in preview/prod)
  </read_first>
  <behavior>
    worldState.spec.ts (write FIRST, red):
    - normalizeRoute('/diversityincludesdisability_two/services/', '/diversityincludesdisability_two') === '/services'
    - normalizeRoute('/diversityincludesdisability_two/', '/diversityincludesdisability_two') === '/'
    - normalizeRoute('/services/', '') === '/services' (dev, base='')
    - normalizeRoute('/', '') === '/'
    - configFor('/unknown') returns WORLD_CONFIGS['/'] (fallback = hero world)
    - configFor('/accessibility') has spread 0.2 and glow 0.15 (quiet room, D-14)
    - All 5 keys present: '/', '/services', '/about', '/contact', '/accessibility'
  </behavior>
  <action>
    RED: create the spec (relative import './worldState'), confirm failure, commit.
    GREEN: implement `worldState.ts` — a PURE module (no $app imports; the runes wrapper reading
    $app/state arrives in 05-03):
    ```ts
    export interface WorldConfig {
    	camera: readonly [number, number, number];
    	spread: number; // cluster dispersion multiplier
    	glow: number; // emissive/accent intensity multiplier
    }
    // One evolving world (D-04): each route is a CONFIGURATION of the same scene, not a new scene.
    export const WORLD_CONFIGS: Record<string, WorldConfig> = {
    	'/': { camera: [0, 1.5, 8], spread: 1.0, glow: 1.0 }, // immersive hero (D-13)
    	'/services': { camera: [3, 2, 10], spread: 1.6, glow: 0.8 },
    	'/about': { camera: [-2, 1, 9], spread: 0.7, glow: 0.9 },
    	'/contact': { camera: [0, 3, 12], spread: 1.2, glow: 1.1 },
    	'/accessibility': { camera: [0, 2, 14], spread: 0.2, glow: 0.15 } // the quiet room (D-14)
    };
    // Pitfall 8: page.url.pathname arrives as '/<base>/services/' (trailingSlash:'always').
    export function normalizeRoute(pathname: string, base: string): string {
    	let p = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
    	if (!p.startsWith('/')) p = '/' + p;
    	if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    	return p;
    }
    export function configFor(path: string): WorldConfig {
    	return WORLD_CONFIGS[path] ?? WORLD_CONFIGS['/'];
    }
    ```
    Run specs green. Commit.
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest --run --project=server` exits 0 including worldState.spec.ts
    - `grep -q "'/accessibility': { camera: \[0, 2, 14\], spread: 0.2, glow: 0.15 }" src/lib/premium/state/worldState.ts`
    - `grep -c "camera: \[" src/lib/premium/state/worldState.ts` outputs 5
    - `grep -q "export function normalizeRoute" src/lib/premium/state/worldState.ts`
    - `! grep -q "\$app" src/lib/premium/state/worldState.ts` (pure — no SvelteKit runtime imports)
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest --run --project=server && pnpm check && pnpm exec eslint .</automated>
  </verify>
  <done>All 5 world configs + quiet room proven by node spec; normalizer handles base path + trailing slash in both dev and prod shapes.</done>
</task>

</tasks>

<verification>
- `pnpm exec vitest --run --project=server` green (3 new spec files: tier, motion-logic, worldState)
- `pnpm check` 0/0; `pnpm lint` clean
- Fence probe: a scratch file with `import('$lib/premium/x')` fails eslint with no-restricted-syntax
- Nothing outside src/lib/premium/ was modified except eslint.config.js
</verification>

<success_criteria>
- The premium fence now blocks static AND dynamic imports (single-gate exception deferred to 05-03)
- PREM-04/PREM-06 gating logic and the PREM-02 world map exist as node-proven pure contracts Wave 2 consumes
</success_criteria>

<output>
After completion, create `.planning/phases/05-premium-3d-layer/05-02-SUMMARY.md`
</output>
