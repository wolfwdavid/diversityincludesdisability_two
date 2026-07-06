# Phase 5: Premium 3D Layer - Research

**Researched:** 2026-07-06
**Domain:** Threlte v8 / Three.js procedural WebGL layer inside a SvelteKit static dual-mode site
**Confidence:** HIGH (core APIs verified against the installed `@threlte/core@8.5.16` package source in this repo's node_modules; two claims verified by local experiment; size estimates MEDIUM)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 3D Art Direction
- **D-01:** Abstract crystalline brand geometry — floating faceted/refractive forms and geometric clusters in the DID palette. No literal/figurative scenes. Echoes the Crystarium-style language the user likes (sibling Eman_dashboard project) without copying it.
- **D-02:** Deep-blue night world + orange glow — dark blue900 (`#0b2a4a`) environment, objects lit with warm orange rim/emissive accents (orange500/orangeDeep `#c85f08`). Light-on-dark DOM text over it.
- **D-03:** Calm ambient drift as the motion baseline — slow rotation/float/breathing. Dignified, low motion-discomfort risk (disability-equity audience), degrades gracefully under reduced-motion.
- **D-04:** ONE evolving world, not per-section scene swaps — a single continuous scene on the shared Canvas that reconfigures/morphs between states. Site is multi-page: world state changes per ROUTE (canvas persists in the layout across navigations) and morphs with SCROLL within each page.

#### Asset Strategy
- **D-05:** Fully procedural geometry — everything generated in code (icosahedra/custom BufferGeometry/particles/shader materials). ZERO GLB files. This resolves the standing "no GLB assets exist" blocker outright.
- **D-06:** No GLB loader pipeline this phase — no GLTFLoader/draco/ktx2 plumbing (YAGNI). PREM-04 lazy-loading applies to the code chunks themselves.
- **D-07:** Enforced size budget on the lazy Premium chunk, CI-checked (ceiling on the dynamically-imported premium graph incl. three; exact number Claude's discretion, ~600KB gzip guideline) + 60fps target on mid-range hardware.
- **D-08:** Simple two-tier device quality — detect low-end signals (devicePixelRatio, mobile, GPU hints) → reduced particle counts/effects; otherwise full quality. No runtime adaptive FPS stepping.

#### Interactivity
- **D-09:** Scroll + pointer parallax drive the world — scroll position morphs section states; pointer adds subtle parallax/light shift. Both degrade cleanly under reduced-motion.
- **D-10:** NO direct manipulation — 3D may react near the pointer but nothing in-canvas is clickable or focusable. All real interaction stays in the accessible DOM → zero added WCAG surface, no keyboard-parity work inside WebGL.
- **D-11:** Authored camera, scroll-eased — fixed cinematic framing per section state with slow authored drift; scroll eases between states. No user orbit controls.
- **D-12:** Touch devices: scroll-only response, no gyroscope, no touch ripples. Parallax simply absent on touch — predictable, no iOS permission prompts, no motion-sickness vector.

#### Section Treatment
- **D-13:** Full-viewport immersive Home hero — the world fills the first viewport; existing DOM headline + "Let's Connect" CTA float above it, content untouched.
- **D-14:** Coverage: Home, Services, About, Contact each get a distinct configuration of the world. The Accessibility Statement page stays deliberately calm/minimal — a quiet room (at most a faint ambient treatment, at Claude's discretion down to none).
- **D-15:** DOM on top + scrim system — all Phase-4 DOM content renders above the Canvas with a consistent scrim/contrast layer (gradient panels/backdrop dim) tuned to keep WCAG AA contrast so axe keeps passing in Premium mode (QA-01 lands in Phase 6, don't build debt now).
- **D-16:** Same DOM, restyled shell — identical Phase-4 components render in both modes; Premium adds the Canvas behind plus a dark-theme skin (scrims, light-on-dark token application). No premium-specific layout variants. Content parity stays structural.

### Claude's Discretion
- Exact chunk-budget number and enforcement mechanism (build-time assertion vs CI script)
- Shape vocabulary details, shader/material choices, bloom/post-processing (within the crystalline + calm-drift direction; post-processing must fit the size budget)
- Scrim implementation (CSS vs canvas-side dimming) and the dark-skin token mapping
- Scroll-easing curves, parallax intensity, camera path authoring
- Low-end tier detection heuristics and what each tier reduces
- Whether the Accessibility page gets a faint ambient treatment or none
- WebGL-context-loss recovery UX (silent fallback to accessible presentation is the required floor per Success Criteria 5)

### Deferred Ideas (OUT OF SCOPE)
- Commissioned/real GLB asset upgrade (and the draco/ktx2 pipeline that comes with it) — future milestone; procedural is the v1 answer
- Gyroscope tilt parallax on mobile — revisit only with explicit UX review (permission prompts + motion-sensitivity risk)
- Clickable/focusable in-canvas 3D objects — would require full keyboard/SR parity inside WebGL; only with dedicated a11y design
- Hover-highlight wiring between DOM elements and their 3D counterparts — nice-to-have cohesion pass, candidate for a polish phase
- Delete `src/routes/demo/playwright` scaffold (pre-existing base-path E2E failure) — already logged in `deferred-items.md`, good `/gsd:quick` target
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PREM-01 | Premium mode renders an interactive WebGL hero scene (Threlte/Three.js) | Threlte v8 already installed and current (8.5.16 = npm latest, verified 2026-07-06); Patterns 2–5 give the Canvas host, procedural crystalline scene, and scroll/pointer interactivity |
| PREM-02 | 3D-enhanced content across main sections via a single shared Canvas | Pattern 2 (Canvas mounted once in `+layout.svelte`, persists across client-side navigations); Pattern 5 (route + scroll → world-state machine, `$app/state` page works inside the premium chunk) |
| PREM-03 | All Three/Threlte code dynamically imported so Accessible ships zero WebGL bytes | Pattern 1 (single `{#await import()}` gate); VERIFIED locally: core `no-restricted-imports` does NOT flag dynamic `import()` — no ESLint exception needed, but add a `no-restricted-syntax` guard (Pattern 1b); budget/graph scan script (Pattern 6) proves the split at build time |
| PREM-04 | Lazy assets; render loop pauses when tab hidden or mode Accessible | Verified from installed source: Threlte default `renderMode: 'on-demand'`; loop driven by `renderer.setAnimationLoop` (rAF — browsers suspend it in hidden tabs); `useTask` `running` option gates ambient drift; Accessible mode = full unmount (stronger than pause) |
| PREM-05 | WebGL resources disposed on unmount; repeated toggles don't leak/lose context | Verified from installed source: Canvas teardown calls `setAnimationLoop(null)` + `renderer.dispose()`; `<T>` auto-disposes objects with `.dispose()` via the disposal context; Pitfall 2 covers `forceContextLoss()` + the toggle-stress E2E |
| PREM-06 | Premium reduces/limits motion under `prefers-reduced-motion` even when chosen manually | Pattern 4: central `motion.svelte.ts` (matchMedia + change listener) drives `useTask` `running` + parallax off + instant state snaps; note stored `premium` bypasses the resolver's PRM branch, so this MUST live in-canvas |
</phase_requirements>

## Summary

Everything needed for this phase is already installed and version-locked: `three@0.175.0` (exact, forced via `pnpm-workspace.yaml` overrides), `@threlte/core@8.5.16` and `@threlte/extras@9.21.0` — both of which are still the npm `latest` as of 2026-07-06. There is nothing to install for production code. The phase is therefore pure implementation: one dynamic-import entry gate in `+layout.svelte`, a `src/lib/premium/` subtree containing the Canvas host + procedural crystalline world, a dark-skin token extension, and a build-time chunk-budget/graph-partition script.

The most important research findings are mechanical, and all were verified against the installed package source rather than training data: Threlte v8 defaults to `renderMode: 'on-demand'` (the scene renders only when invalidated — a motionless world costs zero GPU), drives its loop through `renderer.setAnimationLoop` (rAF-based, auto-suspended in hidden tabs), automatically disposes the renderer and all `<T>`-created disposables on unmount, and gates per-frame tasks with a reactive `running` option (`stop()`/`start()` are deprecated — plans must use `running`). Two local experiments settled open questions: (1) the ESLint premium fence does NOT see dynamic `import()`, so the entry gate needs no exception — but that also means dynamic imports are structurally unguarded, so add a cheap `no-restricted-syntax` rule; (2) the DID palette survives inversion — `white` on `blue900` = 14.54:1 and `orange500` on `blue900` = 4.77:1, both passing AA-normal, so the dark skin needs no new hues, only new token pairs registered in the existing culori gate.

The main risks are not 3D-technical but boundary-technical: keeping the dark skin's activation condition aligned with the canvas gate (a stored `premium` choice on a WebGL-dead browser stamps `data-mode='premium'` pre-paint but must NOT strand a dark theme with no canvas — Pitfall 5), keeping scrims effectively opaque under text so the Phase-6 axe run has a computable background (Pitfall 6), and partitioning the built chunk graph correctly so the budget script measures the premium graph and proves the accessible graph is WebGL-free (Pattern 6).

**Primary recommendation:** Build `src/lib/premium/` as a self-sufficient subtree (it reads `$app/state`, scroll, pointer, PRM, and visibility itself — the entry gate passes zero props), mounted behind `{#if browser && isPremium() && webglOk}` + one `{#await import()}` in the layout, rendered `on-demand` with a single central motion-gate, and enforced by a new `scripts/check-premium-budget.mjs` (500 KB gzip ceiling) wired into CI.

## Standard Stack

### Core (ALL already installed — verified in package.json + node_modules; zero production installs this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `three` | 0.175.0 (EXACT, forced in `pnpm-workspace.yaml` overrides) | WebGL engine | Locked Phase-1 decision; npm latest is 0.185.1 — do NOT bump (Threlte 8.5.16's dev-tested baseline is 0.175.0) |
| `@threlte/core` | 8.5.16 | Declarative Three.js in Svelte 5 runes | Verified still npm `latest` (2026-07-06). Provides `<Canvas>`, `<T>`, `useTask`, `useThrelte`, auto-disposal — the whole phase's runtime surface |
| `@threlte/extras` | 9.21.0 | Optional helpers | Verified still npm `latest`. Use sparingly (see below); `FakeGlowMaterial`, `Float`, `Sparkles` verified present in `dist/components/` |
| `@types/three` | 0.175.0 | Types matching the pinned three minor | Already pinned |

### Supporting (already installed dev tooling)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `culori` | 4.0.2 | WCAG contrast math | Extend `pairs.ts` with the new dark-skin pairs; existing `scripts/check-contrast.mjs` gates them automatically |
| `@playwright/test` | ^1.60 | E2E | Premium gate, toggle-stress disposal, PRM emulation (`page.emulateMedia({ reducedMotion: 'reduce' })`), no-WebGL fallback |
| `vitest` | ^4.1.8 | Unit (node project) + browser (chromium) | Pure-logic premium modules (tier heuristic, world-state map, motion gating) go in the fast node project |

### What NOT to add

| Don't Add | Why |
|-----------|-----|
| `postprocessing` / EffectComposer bloom | ~30–100 KB + a fullscreen pass per frame that threatens the 60fps mid-range target. The crystalline glow reads fine with emissive materials + `FakeGlowMaterial` (verified in installed extras) + additive-blended sprites. Bloom is explicitly within discretion — recommendation: skip it this phase |
| `@threlte/extras` interactivity plugin / `three-mesh-bvh` raycasting | D-10 forbids in-canvas interaction; pointer parallax needs only normalized pointer coords from a DOM listener — no raycasting at all |
| GLTF/draco/ktx2 anything (`useGltf`, `useDraco`) | D-05/D-06: fully procedural, zero GLB |
| `camera-controls` / `OrbitControls` | D-11: authored camera only |
| Threlte v7 patterns (`useFrame`) | Removed in v8; the scheduler + `useTask` replaced it |

**Installation:** none for production code. (Optional Wave-0 dev-only: nothing required — budget script uses Node's built-in `zlib.gzipSync`.)

**Version verification (2026-07-06):** `npm view @threlte/core version` → 8.5.16; `npm view @threlte/extras version` → 9.21.0; `npm view three version` → 0.185.1 (informational only — the 0.175.0 pin is a locked decision and `scripts/check-three-pin.mjs` enforces it).

## Architecture Patterns

### Recommended Project Structure

```
src/lib/premium/                  # ALL WebGL code lives here (existing fence)
├── README.md                     # (exists) update: fence contract now includes the one gate
├── PremiumLayer.svelte           # DYNAMIC-IMPORT TARGET: fixed full-viewport wrapper
│                                 #   (aria-hidden, pointer-events:none) + <Canvas> + <Scene>
├── Scene.svelte                  # world root: background/fog, lights, object groups, camera rig
├── CameraRig.svelte              # authored per-state camera framing + damped easing
├── state/
│   ├── worldState.svelte.ts      # route id + scroll progress → section-state config ($state/$derived)
│   ├── motion.svelte.ts          # PRM matchMedia + visibilitychange + touch detection → motionScale/running
│   └── tier.ts                   # PURE two-tier device heuristic (node-unit-testable)
├── objects/
│   ├── CrystalCluster.svelte     # InstancedMesh of faceted forms (icosahedron family)
│   ├── ParticleField.svelte      # Points/instanced sprites, count from tier
│   └── GlowAccents.svelte        # orange emissive/FakeGlowMaterial rim accents
└── styles are NOT here — dark skin lives in the token layer:

src/lib/tokens/
├── colors.ts                     # + dark-skin semantic entries (same 5 hexes, new roles)
├── pairs.ts                      # + verified dark pairs (ratios below) → culori gate covers them
└── tokens.css                    # + [data-mode='premium'] overrides + scrim tokens

src/routes/+layout.svelte         # + the ONE entry gate (webglOk probe + {#await import()})
src/app.css                       # + premium scrim/panel classes keyed off [data-mode='premium']
scripts/check-premium-budget.mjs  # NEW: graph partition + gzip budget + zero-WebGL-in-accessible-graph
.github/workflows/deploy.yml      # + budget gate step after Build
tests/premium.e2e.ts              # NEW: gate/fallback/PRM/toggle-stress E2E
```

### Pattern 1: The single entry gate (PREM-03)

**What:** Layout-level conditional wrapping exactly one dynamic import. The premium layer is self-sufficient — the gate passes no props.

```svelte
<!-- src/routes/+layout.svelte (additions) -->
<script lang="ts">
	import { browser } from '$app/environment';
	import { isPremium } from '$lib/mode/mode.svelte';
	import { hasWebGL } from '$lib/mode/resolve';

	// Probe once on the client. hasWebGL() touches document — browser-only.
	let webglOk = $state(false);
	onMount(() => {
		webglOk = hasWebGL();
	});
</script>

{#if browser && isPremium() && webglOk}
	<!-- The ONE fence crossing. Dynamic import() => Vite emits a separate chunk;
	     the accessible entry graph never references it. -->
	{#await import('$lib/premium/PremiumLayer.svelte') then { default: PremiumLayer }}
		<PremiumLayer />
	{:catch}
		<!-- chunk failed to load: accessible DOM is already fully present; do nothing -->
	{/await}
{/if}
```

Key facts:
- `isPremium()` is a rune-backed getter — the `{#if}` re-evaluates reactively on toggle. Toggling to Accessible unmounts the whole subtree (this IS the PREM-04 "pause when mode is Accessible", implemented as teardown).
- Re-toggling to Premium re-runs `import()` — the module is cached by the browser/module registry; no re-download, a fresh Canvas/context is created.
- SvelteKit does not modulepreload dynamic imports inside components; the chunk is fetched only when the gate renders (verified behavior class: modulepreload covers the static route-node graph only). MEDIUM-HIGH.

**VERIFIED (local experiment, 2026-07-06):** ESLint core `no-restricted-imports` flags the static form (`import '$lib/premium/entry'` → error) but does NOT flag `await import('$lib/premium/entry')` — a probe file with the dynamic form passed `pnpm exec eslint` clean under the repo's exact config. **Consequence: no ESLint exception is needed for the gate — but the fence is blind to dynamic imports everywhere.**

### Pattern 1b: Close the dynamic-import hole in the fence

Add to `eslint.config.js` (global block) so future dynamic imports of premium code are errors everywhere:

```js
'no-restricted-syntax': [
	'error',
	{
		selector: 'ImportExpression > Literal[value=/premium/]',
		message: 'Dynamic import of $lib/premium/* is only allowed at the single layout entry gate (PREM-03).'
	}
]
```

…then a scoped override (or a justified `eslint-disable-next-line no-restricted-syntax`) at exactly the one gate site in `+layout.svelte`. This restores structural enforcement that the empirical finding showed was missing.

### Pattern 2: PremiumLayer — fixed backdrop Canvas, inert to AT and pointer (PREM-01/02, D-10, D-13)

```svelte
<!-- src/lib/premium/PremiumLayer.svelte -->
<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { tier } from './state/tier';

	const t = tier(); // 'full' | 'low' — pure heuristic, computed once
</script>

<!-- aria-hidden: <canvas> children (Threlte's context tree) are canvas FALLBACK content
     and would otherwise be exposed to assistive tech. pointer-events:none: D-10 — nothing
     in-canvas is interactive; all pointer events pass through to the DOM. -->
<div class="premium-backdrop" aria-hidden="true">
	<Canvas dpr={t === 'low' ? [1, 1.5] : [1, 2]} renderMode="on-demand">
		<Scene tier={t} />
	</Canvas>
</div>

<style>
	.premium-backdrop {
		position: fixed;
		inset: 0;
		z-index: 0; /* DOM shell gets position:relative + z-index:1 via [data-mode='premium'] CSS */
		pointer-events: none;
	}
</style>
```

Verified from installed source (`Canvas.svelte`, `renderer.svelte.d.ts`):
- `<Canvas>` renders `div(position:relative;100%/100%) > canvas(100%/100%)` — the fixed wrapper sizes it.
- `dpr` accepts a `[min, max]` tuple clamping `window.devicePixelRatio` — use this instead of hand-rolling DPR caps.
- Default `toneMapping` is `AgXToneMapping`, default `colorSpace` `'srgb'` — good defaults for a dark emissive scene; no config needed.
- Canvas mounts in the layout → persists across client-side route navigations (D-04): the world morphs, it is never re-created on nav.

### Pattern 3: Frame-loop control — on-demand rendering + task gating (PREM-04)

Verified from installed source (`scheduler.svelte.d.ts`, `renderer.svelte.js`, `useTask.svelte.d.ts`):
- Default `renderMode` is **`'on-demand'`**: the scene renders only when a frame is invalidated. Running `useTask` handlers auto-invalidate (`autoInvalidate: true` default) — so when all tasks are gated off, rendering stops at the last frame automatically. A motionless premium world costs ~zero GPU.
- The loop is `renderer.setAnimationLoop(...)` — rAF-driven, so **browsers suspend it in hidden tabs automatically**. Tab-hidden pause is inherent; the explicit `visibilitychange` gate below makes it deterministic and testable.
- `useTask`'s `stop()`/`start()` returns and `autoStart` are **deprecated in 8.5.16** — plans MUST use the reactive `running` option.

```ts
// src/lib/premium/state/motion.svelte.ts — the ONE motion authority (PREM-04 + PREM-06)
let reduced = $state(false);
let hidden = $state(false);
let touch = $state(false);

export function initMotion() {
	const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
	reduced = mq.matches;
	mq.addEventListener('change', (e) => (reduced = e.matches)); // live OS flips honored
	hidden = document.hidden;
	document.addEventListener('visibilitychange', () => (hidden = document.hidden));
	touch = window.matchMedia('(pointer: coarse)').matches; // D-12: no parallax on touch
}

export const motion = {
	get animating() {
		return !reduced && !hidden; // drift/morph tasks run only when this is true
	},
	get parallax() {
		return !reduced && !touch; // pointer parallax additionally off on touch
	},
	get reduced() {
		return reduced;
	}
};
```

```svelte
<!-- inside Scene.svelte / object components -->
<script lang="ts">
	import { useTask } from '@threlte/core';
	import { motion } from './state/motion.svelte';

	useTask(
		(delta) => {
			/* ambient drift, breathing, scroll-eased morphs */
		},
		{ running: () => motion.animating } // reactive gate — the current v8 API
	);
</script>
```

Reflect state to the DOM for testability: `<div class="premium-backdrop" data-motion={motion.animating ? 'active' : 'paused'}>` — E2E can assert PRM behavior without reaching into WebGL.

### Pattern 4: Reduced motion IN premium (PREM-06)

`resolveMode` precedence is `stored > PRM > webgl > default` — a **stored `'premium'` bypasses the PRM branch entirely** (verified in `src/lib/mode/resolve.ts`). So PREM-06 can only be satisfied inside the canvas. Under `motion.reduced`:
- Ambient drift/breathing tasks: not running (scene renders a static, fully-composed configuration — on-demand mode means zero ongoing GPU).
- Route/scroll state changes: snap or near-instant (≤ ~200ms opacity-style) transitions instead of eased morphs; no scroll-linked continuous movement (scroll-linked motion is a vestibular trigger).
- Pointer parallax: off.
- The static composition must look intentional — author each section state to read well as a still.

### Pattern 5: One evolving world — route + scroll drive state (PREM-02, D-04, D-09, D-11)

```ts
// src/lib/premium/state/worldState.svelte.ts
import { page } from '$app/state'; // fine INSIDE the premium chunk — $app/state is already in the shared bundle and is WebGL-free

const CONFIGS = {
	'/': { camera: [0, 1.5, 8], spread: 1.0, glow: 1.0 }, // immersive hero (D-13)
	'/services': { camera: [3, 2, 10], spread: 1.6, glow: 0.8 },
	'/about': { camera: [-2, 1, 9], spread: 0.7, glow: 0.9 },
	'/contact': { camera: [0, 3, 12], spread: 1.2, glow: 1.1 },
	'/accessibility': { camera: [0, 2, 14], spread: 0.2, glow: 0.15 } // the quiet room (D-14)
} as const;

export function currentConfig() {
	// page.url.pathname includes base + trailing slash — normalize before lookup
	const path = normalize(page.url.pathname);
	return CONFIGS[path] ?? CONFIGS['/'];
}
```

- **Scroll:** read `window.scrollY` inside a `useTask` each frame (cheap; no listener churn); normalize by a page height cached on `resize`/route change (`scrollHeight - innerHeight` forces layout — don't read it per frame). Progress 0..1 morphs within the route's state.
- **Pointer parallax:** one passive `pointermove` listener on `window` storing normalized `(x, y)`; camera/light offset a few % toward it, gated by `motion.parallax`. No raycasting (D-10).
- **Easing:** `THREE.MathUtils.damp(current, target, lambda, delta)` per frame — framerate-independent, no tween library. Camera rig damps position/lookAt toward the authored config; scroll progress feeds the target, damp supplies the calm.
- Trailing-slash note: `trailingSlash: 'always'` means pathnames arrive as `/base/about/` — normalize (strip base + trailing slash) before the config lookup (same Pitfall class as Phase 4's active-nav bug).

### Pattern 6: Chunk budget + graph partition script (D-07, PREM-03) — recommended discretion call

**Budget recommendation: 500,000 bytes gzip ceiling** for the premium graph (comfortably under the ~600 KB guideline; expected actual for tree-shaken three + threlte core + procedural scene: ~150–250 KB gzip — MEDIUM confidence, the script measures reality). Enforcement: build-time Node script in CI (not a Vite plugin — simpler, runs on the final artifact).

```
scripts/check-premium-budget.mjs — algorithm:
1. Read every .js under build/_app/immutable/{entry,nodes}/ — these are the roots of
   the ACCESSIBLE static graph (entry + all route nodes fetched on client-side nav).
2. Walk the STATIC import closure by regex on built output:
      import ... from "…"   |   import "…"   |   export ... from "…"
   (do NOT follow dynamic `import(` — that call is exactly the premium boundary).
3. Assert NO file in the closure matches /WebGLRenderer|@threlte|THREE\./
   → the accessible graph is WebGL-free (continues Phase-4's A11Y-08 scan, which was
   run manually in 04-06 verification and is NOT yet a committed script — commit it now).
4. Premium graph = signature-matching files NOT in the closure (+ their closure).
   Assert it is NON-EMPTY (guards against scan rot) and sum zlib.gzipSync(file).length.
5. Assert sum <= 500_000. Print a per-file table.
```

The `WebGLRenderer|@threlte|THREE\.` signatures survive minification (three embeds hundreds of `'THREE.…'` error/warning string literals). This was the exact signature set Phase 4's verification used, chosen because naive `three|webgl` greps false-positive on the accessibility statement's own prose. Wire into `deploy.yml` after Build, and add `"check:premium-budget"` to package.json scripts.

### Pattern 7: Dark skin + scrim tokens (D-02, D-15, D-16)

**VERIFIED (culori 4.0.2, this repo, 2026-07-06)** — the existing palette inverts cleanly; no new hues required:

| Pair | Ratio | Verdict |
|------|-------|---------|
| `white` on `blue900` | 14.54 | AA-normal ✓ (body/headings on dark) |
| `orange500` on `blue900` | 4.77 | AA-normal ✓ (links/accents on dark — barely; do not darken the bg-behind-orange below blue900 without re-checking… going darker HELPS: orange500 on `#071c33` = 5.63) |
| `orangeDeep` on `blue900` | 3.53 | AA-ui / AA-large only — borders and large text, never body text |
| `white` on `#071c33` (optional deeper night surface) | 17.17 | AA-normal ✓ |

Mechanics (all existing machinery, just extended):
1. `colors.ts`: add dark-role semantic entries (e.g. `textOnDark: palette.white`, `linkOnDark: palette.orange500`, `surfaceDark: palette.blue900`). If a deeper night hex like `#071c33` is wanted for scrims, add it to `palette` AND mirror it in `tokens.css` (the file headers mandate mirroring).
2. `pairs.ts`: register every new fg×bg pair with its level — `check-contrast.mjs` then gates them in CI automatically. This is the "don't build Phase-6 debt" move: contrast is machine-proved before axe ever runs.
3. `tokens.css` / `app.css`: `[data-mode='premium']` overrides remap `--color-text/link/heading/surface` to the dark roles (the hook blocks already exist, empty, in `app.css` lines 101–106).
4. **Scrim rule:** text must sit over an effectively opaque scrim core (alpha ≥ 0.92 over the darkest scene tone, or fully opaque panels with gradient-fade edges only OUTSIDE the text box). Semi-transparent backgrounds over canvas give axe an uncomputable background (see Pitfall 6).
5. DOM stacking: `[data-mode='premium'] .site-header, [data-mode='premium'] .site-main, [data-mode='premium'] .site-footer { position: relative; z-index: 1; }` so content stacks above the fixed backdrop.

### Anti-Patterns to Avoid

- **Static import of anything in `$lib/premium/`** — hoists three into the shared entry; the fence + budget script both catch it, don't fight them.
- **Per-object `requestAnimationFrame` or `setInterval`** — everything frame-based goes through `useTask` so the scheduler + on-demand invalidation + `running` gates stay authoritative.
- **`useTask(...).stop()/.start()`** — deprecated in 8.5.16; use the `running` option (verified in installed type defs).
- **Creating geometries/materials per frame or per scroll event** — allocate once (module/`$derived.by` scope), mutate uniforms/matrices per frame; per-frame allocation is the classic GC-stutter killer for the 60fps target.
- **Multiple `<Canvas>` instances** — browsers cap live WebGL contexts (~8–16); one shared Canvas is both a requirement (PREM-02) and the standard practice.
- **Passing mode/scroll/route props through the entry gate** — makes the gate a coupling point; the premium subtree reads its own inputs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frame loop / render scheduling | Own rAF loop | `useTask` + `renderMode="on-demand"` (default) | Scheduler handles invalidation, ordering, teardown; verified in installed source |
| Pause on hidden tab | Manual rAF bookkeeping | rAF auto-suspends in hidden tabs + `running: () => motion.animating` | Browser behavior + reactive task gate; both mechanisms verified |
| GPU disposal bookkeeping | Manual dispose walks of the scene graph | Threlte auto-disposal: `<T>`-created/`is`-bound objects with `.dispose()` are reference-counted and disposed on unmount; Canvas teardown calls `renderer.dispose()` | Verified in `disposal.svelte.js` + `renderer.svelte.js`. Only imperatively-created shared resources (module-scope geometries) need an explicit `onDestroy` dispose |
| DPR capping | `Math.min(devicePixelRatio, …)` plumbing | `<Canvas dpr={[1, 2]}>` tuple clamp | Verified Canvas prop |
| Framerate-independent easing | Tween lib / lerp-by-fixed-factor | `THREE.MathUtils.damp(a, b, lambda, delta)` | Ships inside three, zero bytes added |
| Glow | Bloom post-processing chain | Emissive PBR materials + `FakeGlowMaterial` (verified in installed extras) + additive sprites | Fits size budget and 60fps target |
| WebGL detection | New probe | Existing `hasWebGL()` in `src/lib/mode/resolve.ts` | Already tested; CONTEXT forbids re-derivation |
| Mode precedence | Any re-derivation | Existing `isPremium()` / `resolveMode()` | Locked integration surface |
| Contrast verification | Eyeballing the dark skin | Existing `pairs.ts` + `check-contrast.mjs` culori gate | Ratios above already machine-verified |

**Key insight:** Threlte v8's context system already implements the phase's three hardest requirements (on-demand rendering, task gating, disposal) as defaults — the phase's real work is composition, art direction, and the enforcement scripts, not engine plumbing.

## Common Pitfalls

### Pitfall 1: Canvas fallback content leaks into the accessibility tree
**What goes wrong:** Threlte renders its context tree INSIDE the `<canvas>` element (verified in `Canvas.svelte` markup). Canvas children are fallback content — exposed to assistive tech. A stray focusable or text node inside the scene tree becomes SR-visible noise.
**How to avoid:** `aria-hidden="true"` on the `.premium-backdrop` wrapper (Pattern 2). The 3D layer is purely decorative (D-10) so hiding the whole subtree is correct.
**Warning signs:** Phase-6 SR walkthrough announcing unexpected content in Premium mode.

### Pitfall 2: Repeated toggling exhausts WebGL contexts
**What goes wrong:** Each Premium re-entry creates a new canvas + context. `renderer.dispose()` (which Threlte calls on unmount — verified) releases resources but does NOT synchronously release the context; browsers hold ~8–16 and evict the oldest with a context-loss event. Rapid toggle cycles can hit the cap before GC catches up.
**How to avoid:** In `PremiumLayer`'s `onDestroy`, after Threlte teardown, call `renderer.forceContextLoss()` (capture `renderer` from `useThrelte()` in a child of Canvas). Confidence MEDIUM — this is the standard three.js SPA-cleanup recommendation but its interaction with Threlte's own teardown ordering must be proven by the toggle-stress E2E (toggle 10× rapidly, assert no page errors and a live canvas at the end).
**Warning signs:** "WebGL context lost" warnings in console during the stress test.

### Pitfall 3: WebGL context loss mid-session has no floor
**What goes wrong:** GPU reset/driver eviction fires `webglcontextlost` on the canvas; without handling, Premium shows a frozen/blank backdrop.
**How to avoid:** Listen on `renderer.domElement` (or the canvas) for `webglcontextlost`; call `event.preventDefault()` is only needed if attempting restore — the required FLOOR (Success Criteria 5 / CONTEXT) is simpler: flip a local `contextLost` state that unmounts/hides the backdrop. The DOM content above is complete and self-sufficient, so "recovery UX" = quietly remove the dead layer. Restore attempts are discretionary polish.
**Warning signs:** none visible — that's the point; verify via a forced `forceContextLoss()` in an E2E.

### Pitfall 4: Stored-premium + PRM means the resolver will NOT protect you
**What goes wrong:** Assuming Accessible-by-default under PRM covers PREM-06. It doesn't: stored `'premium'` wins over PRM in `resolveMode` (locked precedence, verified in source). A PRM user who once chose Premium gets the full canvas.
**How to avoid:** Pattern 4 — the in-canvas motion authority is mandatory, listens to `matchMedia('(prefers-reduced-motion: reduce)')` including live `change` events, and every task's `running` gate flows from it.
**Warning signs:** E2E with `emulateMedia({ reducedMotion: 'reduce' })` + seeded `did2:mode=premium` showing `data-motion='active'`.

### Pitfall 5: Dark skin stranded without a canvas (premium + no WebGL)
**What goes wrong:** The inline head script stamps `data-mode='premium'` for a stored choice WITHOUT probing WebGL (verified in `app.html` — the probe only runs when nothing is stored). If the dark skin keys purely off `[data-mode='premium']`, a stored-premium visitor on a WebGL-dead browser gets a dark-skinned page with no 3D behind it, while Success Criteria 5 promises the accessible presentation.
**How to avoid:** Keep `[data-mode='premium']` as the pre-paint skin key (no flash), and have the layout gate set `data-webgl='no'` on `<html>` when the `hasWebGL()` probe fails while mode is premium; one CSS block `[data-mode='premium'][data-webgl='no']` reverts the skin overrides to the light values. (All dark pairs pass AA anyway, so the intermediate paint is never a violation — this is about honoring the fallback promise, not contrast.)
**Warning signs:** E2E that stubs out `getContext` and seeds stored premium showing the dark theme with zero canvas elements.

### Pitfall 6: Semi-transparent scrims make Phase-6 axe results uncomputable
**What goes wrong:** Text over `rgba(...)` panels over a live canvas — axe cannot determine the effective background over canvas pixels; results land in "incomplete", masking real contrast failures and undermining QA-01.
**How to avoid:** Text always sits over an effectively opaque scrim core (≥ 0.92 alpha over the darkest scene tone, or fully opaque). Register the composited/opaque scrim color as the `bg` in `pairs.ts` so culori proves the same pair axe will later observe.
**Warning signs:** axe "incomplete" contrast items appearing in Phase-6 runs.

### Pitfall 7: E2E assumes a starting mode or a WebGL-less default
**What goes wrong:** A fresh Playwright chromium context has WebGL (SwiftShader) and no stored key → resolves to the LOCKED premium default. Tests asserting Accessible behavior without seeding will flake; tests asserting premium-chunk absence will fail because the chunk legitimately loads.
**How to avoid:** Established Phase-3 pattern — capture-then-assert or seed `did2:mode` via `addInitScript`. For zero-request assertions, seed `accessible` explicitly. Base path is pinned (`http://localhost:4173/diversityincludesdisability_two/`).
**Warning signs:** locally-green, CI-red E2E.

### Pitfall 8: `page.url.pathname` mismatch breaks route→world mapping
**What goes wrong:** Pathnames include the base path and a trailing slash (`/diversityincludesdisability_two/services/`); a raw lookup against `'/services'` never matches and every page silently gets the hero world.
**How to avoid:** Normalize with `base` from `$app/paths` + strip trailing slash before the config lookup; unit-test the normalizer in the node project.
**Warning signs:** identical world configuration on all routes in preview but not dev (dev has `base=''`).

## Code Examples

### Verified: procedural crystal cluster with auto-disposal (PREM-01/05, D-01, D-05)

```svelte
<!-- src/lib/premium/objects/CrystalCluster.svelte -->
<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { IcosahedronGeometry, MeshStandardMaterial, Object3D, InstancedMesh } from 'three';
	import { motion } from '../state/motion.svelte';

	let { count = 24, spread = 1 } = $props();

	// Allocate ONCE. Bound via `is` => registered with Threlte's disposal context,
	// disposed automatically on unmount (verified: components/T/utils/useDispose.svelte.js).
	const geometry = new IcosahedronGeometry(0.5, 1); // flat-shaded facets read as crystal
	const material = new MeshStandardMaterial({
		color: '#0b2a4a',
		emissive: '#c85f08',
		emissiveIntensity: 0.35,
		flatShading: true,
		roughness: 0.25,
		metalness: 0.1
	});
	const mesh = new InstancedMesh(geometry, material, count);
	const dummy = new Object3D();

	let t = 0;
	useTask(
		(delta) => {
			t += delta * 0.15; // calm drift (D-03)
			for (let i = 0; i < count; i++) {
				/* slow rotate/float per instance via dummy.position/rotation; */
				dummy.updateMatrix();
				mesh.setMatrixAt(i, dummy.matrix);
			}
			mesh.instanceMatrix.needsUpdate = true;
		},
		{ running: () => motion.animating } // PREM-04/06 gate — current v8 API
	);
</script>

<T is={mesh} />
```

### Verified: Threlte context access for context-loss floor + forceContextLoss (PREM-05, Pitfalls 2–3)

```svelte
<!-- child of <Canvas>, e.g. inside Scene.svelte -->
<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { onDestroy } from 'svelte';

	const { renderer, invalidate } = useThrelte(); // verified context shape

	renderer.domElement.addEventListener('webglcontextlost', () => {
		dispatchLayerDown(); // local state up to PremiumLayer: hide/unmount backdrop; DOM is the floor
	});

	onDestroy(() => {
		// Threlte already ran setAnimationLoop(null) + renderer.dispose() (verified).
		// Proactively free the context so rapid toggling can't exhaust the browser cap:
		renderer.forceContextLoss(); // MEDIUM confidence — prove with toggle-stress E2E
	});
</script>
```

### Recommended: E2E skeletons for this phase's success criteria

```ts
// tests/premium.e2e.ts
import { test, expect } from '@playwright/test';
const HOME = 'http://localhost:4173/diversityincludesdisability_two/';

test('premium mounts a canvas; accessible requests no premium chunk', async ({ page }) => {
	const requests: string[] = [];
	page.on('request', (r) => requests.push(r.url()));
	await page.addInitScript(() => localStorage.setItem('did2:mode', 'accessible'));
	await page.goto(HOME);
	await page.waitForLoadState('networkidle');
	// No fetched script may carry the premium graph (chunk names are hashed — assert
	// via the response-body signature OR maintain the build-scan as authority and
	// assert simply: no canvas, and toggle-to-premium then triggers a NEW js request).
	expect(await page.locator('canvas').count()).toBe(0);
	const before = requests.filter((u) => u.endsWith('.js')).length;
	await page.locator('[role="switch"]').dispatchEvent('click');
	await expect(page.locator('.premium-backdrop canvas')).toBeVisible(); // chunk arrived on demand
	expect(requests.filter((u) => u.endsWith('.js')).length).toBeGreaterThan(before);
});

test('PRM + manually chosen premium => canvas mounts but motion is paused (PREM-06)', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addInitScript(() => localStorage.setItem('did2:mode', 'premium'));
	await page.goto(HOME);
	await expect(page.locator('.premium-backdrop')).toHaveAttribute('data-motion', 'paused');
});

test('no WebGL => accessible presentation, no canvas (Success Criteria 5)', async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('did2:mode', 'premium'); // stored premium bypasses the resolver probe
		const orig = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
			if (String(type).includes('webgl')) return null;
			return orig.call(this, type, ...args);
		};
	});
	await page.goto(HOME);
	expect(await page.locator('canvas').count()).toBe(0);
	// and the skin reverted (Pitfall 5):
	await expect(page.locator('html')).toHaveAttribute('data-webgl', 'no');
});

test('toggle stress: 10 rapid round-trips leak no context and end alive (PREM-05)', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(String(e)));
	await page.goto(HOME);
	const sw = page.locator('[role="switch"]');
	for (let i = 0; i < 20; i++) await sw.dispatchEvent('click');
	await expect(page.locator('.premium-backdrop canvas')).toBeVisible();
	expect(errors).toEqual([]);
});
```

### Recommended: budget script core (Pattern 6)

```js
// scripts/check-premium-budget.mjs (skeleton — see Pattern 6 for the algorithm)
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const SIG = /WebGLRenderer|@threlte|THREE\./; // survives minification (three's literal strings)
const BUDGET = 500_000; // gzip bytes — recommended ceiling (D-07 discretion)
const STATIC_IMPORT = /(?:import|export)\s*(?:[\w${},*\s]+from\s*)?["']([^"']+\.js)["']/g;
// Walk closure from build/_app/immutable/{entry,nodes}; NEVER follow `import(` call sites.
// Assert: closure has 0 SIG matches; premium set (SIG matches ∉ closure) non-empty and ≤ BUDGET.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Threlte v7 `useFrame`, Svelte 4 stores | v8 scheduler: `useTask` + stages, runes | Threlte 8 (2024) | All loop code uses `useTask`; project already on v8 |
| `useTask` `stop()`/`start()` + `autoStart` | Reactive `running: () => bool` option | Deprecated in current 8.5.x (verified in installed type defs) | Plans must use `running` — the deprecated API still works but is the wrong pattern to write new |
| `renderMode: 'always'` mindset | `'on-demand'` is the v8 DEFAULT | Threlte 8 | "Pause the render loop" is mostly free: gate tasks, rendering stops itself |
| Manual `.dispose()` sweeps on unmount | Reference-counted auto-disposal via `<T>`/`is` | Threlte 8 | PREM-05 is largely a framework guarantee + one `forceContextLoss` hardening |
| `$app/stores` `$page` | `$app/state` `page` (runes) | SvelteKit 2.12+ | Already used in Phase 4; premium world-state reads it directly |
| Bloom via EffectComposer for glow | Emissive + AgX tone mapping (v8 default) + fake-glow materials | — | Budget- and perf-friendly glow without a post chain |

**Deprecated/outdated:**
- `three` caret ranges — no semver; the exact 0.175.0 pin is locked and CI-enforced (`check-three-pin.mjs`).
- `pnpm.overrides` in package.json — pnpm 11 ignores it (warning observed live during research); the effective override lives in `pnpm-workspace.yaml`. The stale `package.json` block is harmless but could be cleaned opportunistically.

## Open Questions

1. **Does `forceContextLoss()` after Threlte's own teardown ever throw / double-release?**
   - What we know: Threlte's unmount effect runs `setAnimationLoop(null)` then `renderer.dispose()` in a try/catch (verified in source); `forceContextLoss` is three's documented way to release a context deliberately.
   - What's unclear: exact ordering of the child `onDestroy` vs the Canvas context teardown effect.
   - Recommendation: implement, then let the toggle-stress E2E arbitrate; if ordering bites, move the call into the same component that owns the gate via a captured renderer reference. Not a planning blocker.

2. **Exact tree-shaken size of `three@0.175` + `@threlte/core` in this scene's usage.**
   - What we know: full minified three gzips to roughly ~150–170 KB; a procedural scene subset plus threlte core lands well under the 500 KB ceiling (MEDIUM — estimates).
   - Recommendation: the budget script measures reality on the first build; if the actual lands over 300 KB gzip, investigate accidental extras/bvh pull-in before shipping (extras' barrel re-exports `camera-controls`; Vite should shake it when unused, but the script is the proof).

3. **Faint ambient treatment on the Accessibility page or none (D-14 discretion).**
   - Recommendation: ship "almost none" — the world's quiet-room config (near-zero spread/glow, static). It keeps the single-world model (no special-case unmount on one route) while honoring the restraint; can be dialed to literally nothing in polish.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.x (two projects: `server` = node, `client` = browser/chromium headless) + Playwright ^1.60 E2E (`testMatch: **/*.e2e.{ts,js}`) |
| Config file | `vite.config.ts` (vitest projects), `playwright.config.ts` (BASE_PATH pinned, `reuseExistingServer: true`) |
| Quick run command | `pnpm exec vitest --run --project=server` |
| Full suite command | `pnpm check && pnpm lint && pnpm exec vitest --run && pnpm test:e2e` + `node scripts/check-contrast.mjs` + `node scripts/check-premium-budget.mjs` (after `pnpm build`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PREM-01 | Canvas + hero world mounts in Premium | e2e | `pnpm exec playwright test tests/premium.e2e.ts -g "premium mounts"` | ❌ Wave 0 |
| PREM-02 | Single Canvas persists across routes; per-route world config | e2e + unit | e2e nav assertion (canvas count stays 1 across nav) + `pnpm exec vitest --run --project=server src/lib/premium/state/worldState.spec.ts` (path normalizer/config map — pure) | ❌ Wave 0 |
| PREM-03 | Accessible loads zero WebGL bytes; premium chunk separate + budgeted | build script + e2e | `pnpm build && node scripts/check-premium-budget.mjs`; e2e chunk-on-demand test | ❌ Wave 0 |
| PREM-04 | Loop pauses when hidden/Accessible; chunks lazy | unit + e2e | unit: motion-gate pure logic (`motion.animating` truth table); e2e: `data-motion` attribute + unmount on toggle | ❌ Wave 0 |
| PREM-05 | Disposal on unmount; toggle stress leak-free | e2e | toggle-stress test (20 flips, no pageerror, live canvas at end) | ❌ Wave 0 |
| PREM-06 | PRM limits motion even in manual Premium | e2e + unit | `emulateMedia({ reducedMotion: 'reduce' })` + seeded premium → `data-motion="paused"`; unit truth table | ❌ Wave 0 |
| (regression) | Dark-skin pairs pass AA | script | `node scripts/check-contrast.mjs` (extended pairs.ts) | ✅ script exists; pairs added this phase |
| (regression) | Phase 1–4 gates stay green | existing | `pnpm check` (0/0), `pnpm lint`, existing unit + e2e suites | ✅ |

### Sampling Rate
- **Per task commit:** `pnpm exec vitest --run --project=server` + `pnpm check`
- **Per wave merge:** full unit (both projects) + `pnpm build && node scripts/check-premium-budget.mjs && node scripts/check-contrast.mjs`
- **Phase gate:** full suite incl. E2E green before `/gsd:verify-work` (note: `src/routes/demo/playwright` has a pre-existing base-path E2E failure already logged in deferred-items — not this phase's debt)

### Wave 0 Gaps
- [ ] `scripts/check-premium-budget.mjs` — covers PREM-03 + D-07 (also codifies the Phase-4 A11Y-08 scan, which was run manually in 04-06 and never committed)
- [ ] `tests/premium.e2e.ts` — covers PREM-01/02/04/05/06 + Success Criteria 5
- [ ] `src/lib/premium/state/*.spec.ts` (node project) — pure logic: tier heuristic, motion truth table, route normalizer/world map
- [ ] `pairs.ts` dark-pair entries — extends the existing contrast gate (ratios pre-verified above)
- [ ] `deploy.yml` step: budget gate after Build
- [ ] `eslint.config.js`: `no-restricted-syntax` dynamic-import guard (Pattern 1b)
- Framework install: none — all tooling present

## Sources

### Primary (HIGH confidence)
- Installed `@threlte/core@8.5.16` package source (this repo's node_modules): `dist/index.d.ts` (export surface), `Canvas.svelte` (DOM structure, canvas-children fallback), `context/fragments/scheduler.svelte.d.ts` (`renderMode` default `'on-demand'`, `invalidate`/`autoRender`), `context/fragments/renderer.svelte.js` (`setAnimationLoop` loop + unmount `setAnimationLoop(null)` + `renderer.dispose()`), `context/fragments/renderer.svelte.d.ts` (`dpr` tuple, AgX default), `hooks/useTask.svelte.d.ts` (`running` option; `stop`/`start`/`autoStart` deprecated), `context/fragments/disposal.svelte.d.ts` + `components/T/utils/useDispose.svelte.js` (auto-disposal)
- Installed `@threlte/extras@9.21.0` `dist/components/` listing — `FakeGlowMaterial`, `Float`, `Sparkles`, `Stars`, `GradientTexture` verified present
- Local experiment (2026-07-06): ESLint probe files under the repo's exact flat config — static `$lib/premium` import errors, dynamic `import()` passes clean
- Local experiment (2026-07-06): culori 4.0.2 `wcagContrast` on all candidate dark pairs (table in Pattern 7)
- npm registry (2026-07-06): `@threlte/core` latest = 8.5.16, `@threlte/extras` latest = 9.21.0, `three` latest = 0.185.1
- Repo source of truth: `src/lib/mode/{resolve,constants,mode.svelte}.ts`, `src/app.html` (head script stamps without probing when stored — Pitfall 5), `src/routes/+layout.svelte`, `eslint.config.js`, `playwright.config.ts`, `vite.config.ts`, `scripts/check-contrast.mjs`, `src/lib/tokens/*`, `.github/workflows/deploy.yml`, `pnpm-workspace.yaml`

### Secondary (MEDIUM confidence)
- Three.js SPA cleanup practice: `renderer.dispose()` + `forceContextLoss()` to proactively release contexts (three.js docs/forum consensus; interaction with Threlte teardown ordering unproven — flagged, E2E arbitrates)
- rAF suspension in hidden/background tabs (MDN `requestAnimationFrame` / Page Visibility guidance — long-standing cross-browser behavior)
- SvelteKit modulepreload covers only the static route-node graph; component-level dynamic imports fetch on demand (SvelteKit docs + prior project verification in Phase 1 research)
- Size estimates for tree-shaken three (~150–250 KB gzip premium graph) — informed estimate; the budget script measures truth

### Tertiary (LOW confidence)
- Browser live-WebGL-context caps "~8–16" — widely reported, browser/GPU dependent; the toggle-stress E2E is the real guard

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — everything installed; versions re-verified against npm on research day
- Architecture: HIGH — gate/fence/mode/store integration surfaces read directly from repo source; Threlte APIs from installed package source
- Pitfalls: HIGH for 1, 4, 5, 6, 7, 8 (source-verified or locally reproduced); MEDIUM for 2–3 (context-loss behavior is browser-dependent — E2E arbitrates)
- Sizes/budget: MEDIUM — estimates until the script measures the first real build

**Research date:** 2026-07-06
**Valid until:** ~2026-08-06 (stable: three pin is locked, Threlte 8.5.16 is latest; re-check only if Threlte 9 lands before planning)
