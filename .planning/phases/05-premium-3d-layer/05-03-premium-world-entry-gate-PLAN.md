---
phase: 05-premium-3d-layer
plan: 03
type: execute
wave: 2
depends_on: ["05-01", "05-02"]
files_modified:
  - src/lib/premium/state/worldState.svelte.ts
  - src/lib/premium/PremiumLayer.svelte
  - src/lib/premium/Scene.svelte
  - src/lib/premium/CameraRig.svelte
  - src/lib/premium/objects/CrystalCluster.svelte
  - src/lib/premium/objects/ParticleField.svelte
  - src/lib/premium/objects/GlowAccents.svelte
  - src/routes/+layout.svelte
  - src/lib/premium/README.md
autonomous: true
requirements: [PREM-01, PREM-02, PREM-03, PREM-04, PREM-05, PREM-06]

must_haves:
  truths:
    - "In Premium mode on a WebGL-capable browser, one <canvas> mounts behind the DOM (fixed, z-index 0, aria-hidden, pointer-events none) and renders the crystalline world (PREM-01)"
    - "The Canvas lives in the layout and persists across client-side navigations; each route gets a distinct world configuration via configFor (PREM-02, D-04)"
    - "Exactly ONE dynamic import('$lib/premium/PremiumLayer.svelte') exists, in src/routes/+layout.svelte, behind {#if browser && isPremium() && webglOk}; toggling to Accessible unmounts the entire subtree (PREM-03/04)"
    - "All per-frame work runs through useTask with running: () => motion.animating — reduced-motion and hidden-tab stop all drift (PREM-04/06)"
    - "Unmount disposes GPU resources: Threlte auto-disposal + renderer.forceContextLoss() hardening; webglcontextlost hides the backdrop, leaving the complete DOM as the floor (PREM-05, Pitfalls 2-3)"
    - "The layout stamps data-webgl='ok'|'no' on <html> so the 05-01 skin reverts when a stored-premium visitor has no WebGL (Pitfall 5)"
  artifacts:
    - path: "src/lib/premium/PremiumLayer.svelte"
      provides: "fixed aria-hidden backdrop + <Canvas> host + data-motion attribute + contextLost floor"
      contains: "aria-hidden"
    - path: "src/lib/premium/Scene.svelte"
      provides: "world root: night background/fog, lights, objects, CameraRig, context-loss listener, forceContextLoss on destroy"
      contains: "forceContextLoss"
    - path: "src/lib/premium/CameraRig.svelte"
      provides: "authored per-route camera, damp easing, scroll progress, pointer parallax (gated)"
      contains: "damp"
    - path: "src/lib/premium/objects/CrystalCluster.svelte"
      provides: "InstancedMesh icosahedron crystals, tier-scaled count, motion-gated drift"
      contains: "InstancedMesh"
    - path: "src/routes/+layout.svelte"
      provides: "the ONE entry gate + data-webgl stamp"
      contains: "import('$lib/premium/PremiumLayer.svelte')"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "src/lib/mode/mode.svelte.ts"
      via: "isPremium() rune getter drives the gate {#if} reactively"
      pattern: "isPremium()"
    - from: "src/routes/+layout.svelte"
      to: "src/lib/mode/resolve.ts"
      via: "hasWebGL() probe in onMount (never re-derived)"
      pattern: "hasWebGL"
    - from: "src/lib/premium/PremiumLayer.svelte"
      to: "src/lib/premium/state/motion.svelte.ts"
      via: "initMotion() on mount + data-motion attribute from motion.animating"
      pattern: "initMotion"
    - from: "src/lib/premium/CameraRig.svelte"
      to: "src/lib/premium/state/worldState.svelte.ts"
      via: "currentConfig() → damp targets"
      pattern: "currentConfig"
    - from: "src/lib/premium/objects/*.svelte"
      to: "useTask running gate"
      via: "{ running: () => motion.animating } — the v8 API (stop/start deprecated)"
      pattern: "running:"
---

<objective>
Build the Premium 3D world and open the single fence gate: a self-sufficient `src/lib/premium/`
subtree (Canvas host, one evolving crystalline world, authored camera, procedural objects) mounted by
exactly one dynamic import in the layout. This is the phase's core — after this plan, Premium mode
shows the interactive WebGL experience across all sections on one shared Canvas, with lazy loading,
motion gating, and disposal wired.

Purpose: PREM-01 through PREM-06 implementation (05-04/05-05 then enforce and prove them).
Output: 7 new premium files + the entry gate + data-webgl stamp in `+layout.svelte`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-premium-3d-layer/05-CONTEXT.md
@.planning/phases/05-premium-3d-layer/05-RESEARCH.md
@src/routes/+layout.svelte
@src/lib/mode/mode.svelte.ts
@src/lib/mode/resolve.ts
@src/lib/premium/state/tier.ts
@src/lib/premium/state/motion.svelte.ts
@src/lib/premium/state/worldState.ts

<interfaces>
<!-- Wave-1 contracts (05-02) — consume directly, do NOT re-derive: -->
```typescript
// $lib/mode/mode.svelte (shared bundle, WebGL-free):
export function isPremium(): boolean; // rune-backed getter — reactive in {#if}
// $lib/mode/resolve (shared bundle):
export function hasWebGL(): boolean; // browser-only probe, returns false on failure
// ./state/tier (relative inside premium):
export function detectTier(): 'full' | 'low';
// ./state/motion.svelte (relative):
export function initMotion(): void;
export const motion: { readonly animating: boolean; readonly parallax: boolean; readonly reduced: boolean };
// ./state/worldState (relative, pure):
export interface WorldConfig { camera: readonly [number, number, number]; spread: number; glow: number }
export function normalizeRoute(pathname: string, base: string): string;
export function configFor(path: string): WorldConfig;
```

<!-- Threlte 8.5.16 facts (verified against installed source — see 05-RESEARCH.md): -->
- `<Canvas dpr={[1, 2]}>` clamps devicePixelRatio; default renderMode is 'on-demand' (no prop needed);
  default toneMapping AgX. Canvas renders `div > canvas`; Threlte context children live INSIDE <canvas>
  (fallback content — hence aria-hidden on the wrapper, Pitfall 1).
- `useTask(fn, { running: () => bool })` — reactive gate; `stop()/start()/autoStart` are DEPRECATED.
- `<T is={obj}>` registers disposables — geometries/materials/meshes auto-dispose on unmount.
- Canvas teardown calls setAnimationLoop(null) + renderer.dispose() automatically.
- `useThrelte()` → `{ renderer, invalidate, camera, ... }` (only valid in children of <Canvas>).
- `useTask` auto-invalidates each run; when all tasks are gated off, rendering stops (on-demand).

<!-- DID palette for the scene (locked D-02): environment #0b2a4a (blue900), night #071c33,
     orange emissive #c85f08 (orangeDeep) / #e8730c (orange500). -->

<!-- Fence rules: inside src/lib/premium/ ALL imports of siblings must be RELATIVE (the
     no-restricted-imports patterns catch $lib/premium/* from anywhere). The ONE allowed dynamic
     import site gets `// eslint-disable-next-line no-restricted-syntax`. -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Canvas host, world root, camera rig, world-state wrapper</name>
  <files>src/lib/premium/state/worldState.svelte.ts, src/lib/premium/PremiumLayer.svelte, src/lib/premium/Scene.svelte, src/lib/premium/CameraRig.svelte</files>
  <read_first>
    - .planning/phases/05-premium-3d-layer/05-RESEARCH.md (Patterns 2, 3, 5 + Code Examples — verified API shapes)
    - src/lib/premium/state/motion.svelte.ts, tier.ts, worldState.ts (the 05-02 contracts — import relatively)
    - node_modules/@threlte/core/dist/index.d.ts (export surface if any signature is in doubt)
  </read_first>
  <action>
    1. `src/lib/premium/state/worldState.svelte.ts` — runes wrapper over the pure module:
       imports `page` from '$app/state' and `base` from '$app/paths' (both already in the shared bundle,
       WebGL-free — safe inside the premium chunk), plus `normalizeRoute`/`configFor` from './worldState'.
       Export `currentConfig(): WorldConfig` returning `configFor(normalizeRoute(page.url.pathname, base))`.
       Also export scroll-progress state: `let scrollProgress = $state(0)` with
       `export function updateScroll(): void` that reads `window.scrollY` and divides by a CACHED
       `maxScroll` (document.documentElement.scrollHeight - window.innerHeight, recomputed only on
       'resize' listener + route change via $effect on page.url.pathname — never per frame, it forces
       layout), clamped 0..1; `export function getScrollProgress(): number`.
    2. `src/lib/premium/PremiumLayer.svelte` — the dynamic-import target (Research Pattern 2 verbatim
       plus motion wiring):
       - `const t = detectTier();` once at module init of the component.
       - `onMount(() => initMotion())`.
       - `let contextLost = $state(false);` — passed a setter down to Scene via prop
         `onlost={() => (contextLost = true)}`.
       - Markup: `<div class="premium-backdrop" aria-hidden="true" data-motion={motion.animating ? 'active' : 'paused'}>`
         wrapping `{#if !contextLost}<Canvas dpr={t === 'low' ? [1, 1.5] : [1, 2]}><Scene tier={t} onlost={...} /></Canvas>{/if}`.
       - Style: `.premium-backdrop { position: fixed; inset: 0; z-index: 0; pointer-events: none; }`.
         (05-01 already stacks .site-header/.site-main/.site-footer at z-index 1.)
    3. `src/lib/premium/Scene.svelte` — world root (props: `tier`, `onlost`):
       - `useThrelte()` for `{ renderer, scene, invalidate }`; set `scene.background = new Color('#071c33')`
         and `scene.fog = new FogExp2('#071c33', 0.045)` once (imports from 'three').
       - Lights: `<T.AmbientLight color="#0b2a4a" intensity={0.6} />`, one
         `<T.DirectionalLight position={[4, 6, 3]} color="#ffffff" intensity={0.7} />`, one
         `<T.PointLight position={[0, 2, 2]} color="#c85f08" intensity={2.2} />` (warm orange key — D-02).
       - Children: `<CameraRig />` + the three object components (Task 2), passing `tier` and the
         current config's `spread`/`glow` (read `currentConfig()` here and pass values down as props).
       - Context-loss floor (Pitfall 3): on mount add
         `renderer.domElement.addEventListener('webglcontextlost', () => onlost())`.
       - Disposal hardening (Pitfall 2): `onDestroy(() => { try { renderer.forceContextLoss(); } catch { /* already lost */ } })`.
    4. `src/lib/premium/CameraRig.svelte` — authored camera (D-11), scroll + parallax (D-09):
       - `<T.PerspectiveCamera makeDefault fov={50} />` with an `oncreate`/ref capture.
       - One passive `window` 'pointermove' listener storing normalized pointer `(-1..1)`; removed on destroy.
       - `useTask((delta) => { ... }, { running: () => motion.animating })`: call `updateScroll()`;
         compute target = `currentConfig().camera` + scroll-progress offset (e.g. `y - scrollProgress * 1.5`,
         `z + scrollProgress * 2`) + pointer parallax (`x + pointer.x * 0.4, y + pointer.y * 0.2` ONLY when
         `motion.parallax`); ease with `MathUtils.damp(camera.position.x, target.x, 2, delta)` per axis
         (framerate-independent — never lerp by fixed factor); `camera.lookAt(0, 0, 0)`.
       - Reduced-motion snap (PREM-06, Research Pattern 4): an `$effect` that when `motion.reduced` is true,
         sets camera.position DIRECTLY to the current route config target (no per-frame drift — the task is
         already gated off) and calls `invalidate()` once so the still frame renders. Route changes while
         reduced snap instantly — no scroll-linked continuous movement.
  </action>
  <acceptance_criteria>
    - `grep -q "position: fixed" src/lib/premium/PremiumLayer.svelte` and `grep -q "pointer-events: none" src/lib/premium/PremiumLayer.svelte`
    - `grep -q 'aria-hidden="true"' src/lib/premium/PremiumLayer.svelte`
    - `grep -q "data-motion" src/lib/premium/PremiumLayer.svelte`
    - `grep -q "initMotion" src/lib/premium/PremiumLayer.svelte`
    - `grep -q "webglcontextlost" src/lib/premium/Scene.svelte` and `grep -q "forceContextLoss" src/lib/premium/Scene.svelte`
    - `grep -q "MathUtils.damp\|damp(" src/lib/premium/CameraRig.svelte`
    - `grep -q "running: () => motion.animating" src/lib/premium/CameraRig.svelte`
    - `grep -q "currentConfig" src/lib/premium/state/worldState.svelte.ts` and `grep -q "\$app/state" src/lib/premium/state/worldState.svelte.ts`
    - No `$lib/premium` alias inside the subtree: `! grep -rq "\$lib/premium" src/lib/premium/`
    - `pnpm check` exits 0
  </acceptance_criteria>
  <verify>
    <automated>pnpm check && pnpm exec eslint src/lib/premium/</automated>
  </verify>
  <done>Canvas host + world root + camera rig compile clean; motion/tier/world contracts consumed relatively; context-loss floor and forceContextLoss hardening present.</done>
</task>

<task type="auto">
  <name>Task 2: Procedural crystalline objects — crystals, particles, glow accents</name>
  <files>src/lib/premium/objects/CrystalCluster.svelte, src/lib/premium/objects/ParticleField.svelte, src/lib/premium/objects/GlowAccents.svelte</files>
  <read_first>
    - .planning/phases/05-premium-3d-layer/05-RESEARCH.md (Code Example "procedural crystal cluster" — verified auto-disposal pattern; Anti-Patterns list)
    - src/lib/premium/Scene.svelte (props flowing down: tier, spread, glow — from Task 1)
    - src/lib/premium/state/motion.svelte.ts (the running gate)
  </read_first>
  <action>
    All three components follow the same rules: allocate geometries/materials ONCE at component init
    (never per frame/per scroll — GC-stutter anti-pattern), bind via `<T is={...}>` so Threlte
    auto-disposal owns them, gate every `useTask` with `{ running: () => motion.animating }`, and take
    props `{ tier, spread = 1, glow = 1 }`.

    1. `CrystalCluster.svelte` (D-01/D-03/D-05) — start from the research code example verbatim:
       `IcosahedronGeometry(0.5, 1)` + `MeshStandardMaterial({ color: '#0b2a4a', emissive: '#c85f08',
       emissiveIntensity: 0.35 * glow, flatShading: true, roughness: 0.25, metalness: 0.1 })` in an
       `InstancedMesh` with `count = tier === 'low' ? 10 : 24`. Give each instance a deterministic
       seed (index-based pseudo-random: `const r = (i: number, k: number) => Math.sin(i * 12.9898 + k * 78.233) * 43758.5453 % 1`)
       for base position within `spread * 4` radius, scale 0.4-1.6, and phase. In the task: slow
       per-instance rotation (`delta * 0.15`) + vertical float (`Math.sin(t + phase) * 0.15`) —
       calm drift, D-03. React to `spread` prop changes by scaling base positions (damp toward target
       so route morphs are eased). Set `mesh.instanceMatrix.needsUpdate = true` after the loop.
       When `motion.reduced`, the task is not running — ALSO add an `$effect` on `spread`/`glow` that
       recomputes matrices once + `invalidate()` so route changes still reconfigure the still frame.
    2. `ParticleField.svelte` — ambient dust: `BufferGeometry` with a Float32 position attribute of
       `count = tier === 'low' ? 120 : 400` points in a spread*8 box, `PointsMaterial({ color: '#e8730c',
       size: 0.04, transparent: true, opacity: 0.7, blending: AdditiveBlending, depthWrite: false })`,
       rendered as `<T is={points}>` (Points). Task: drift points slowly upward, wrapping at the box
       edge (mutate the position attribute array + `needsUpdate = true`).
    3. `GlowAccents.svelte` — 5 (low: 3) larger emissive accent shards orbiting slowly:
       either `FakeGlowMaterial` from '@threlte/extras' (verified present) on icosahedron shells, or
       plain `MeshStandardMaterial` with `emissive: '#e8730c', emissiveIntensity: 1.5 * glow` —
       executor's choice, but NO postprocessing/bloom (budget decision, D-07 discretion resolved as skip).
    Wire all three into `Scene.svelte` (created in Task 1) if not already placed:
    `<CrystalCluster {tier} spread={cfg.spread} glow={cfg.glow} />` etc.
  </action>
  <acceptance_criteria>
    - `grep -q "InstancedMesh" src/lib/premium/objects/CrystalCluster.svelte`
    - `grep -q "flatShading: true" src/lib/premium/objects/CrystalCluster.svelte`
    - `grep -q "AdditiveBlending" src/lib/premium/objects/ParticleField.svelte`
    - `grep -c "running: () => motion.animating" src/lib/premium/objects/*.svelte` totals >= 3 (every object task gated)
    - `! grep -rq "useFrame" src/lib/premium/` (v7 API forbidden)
    - `! grep -rq "requestAnimationFrame" src/lib/premium/` (everything goes through useTask)
    - `! grep -rq "postprocessing\|EffectComposer" src/lib/premium/` (no bloom chain)
    - Emissive palette only: `grep -rq "#c85f08\|#e8730c" src/lib/premium/objects/` and no non-DID hex colors introduced (allowed: #0b2a4a, #071c33, #c85f08, #e8730c, #ffffff, #12181f)
    - `pnpm check` exits 0 and `pnpm exec eslint src/lib/premium/` clean
  </acceptance_criteria>
  <verify>
    <automated>pnpm check && pnpm exec eslint src/lib/premium/</automated>
  </verify>
  <done>Three procedural object components: tier-scaled counts, once-allocated resources under Threlte disposal, motion-gated calm drift, DID palette only, zero GLB/loader/postprocessing code.</done>
</task>

<task type="auto">
  <name>Task 3: The ONE entry gate + data-webgl stamp + fence README + chunk-split smoke check</name>
  <files>src/routes/+layout.svelte, src/lib/premium/README.md</files>
  <read_first>
    - src/routes/+layout.svelte (current shell — the gate ADDS to it; do not disturb SkipLinks/header/main/footer order or the unconditional ModeToggle)
    - .planning/phases/05-premium-3d-layer/05-RESEARCH.md (Pattern 1 — gate code, verified ESLint behavior)
    - src/lib/mode/resolve.ts (hasWebGL signature) and src/lib/mode/mode.svelte.ts (isPremium)
  </read_first>
  <action>
    1. In `src/routes/+layout.svelte` script: add imports
       `import { browser } from '$app/environment';`, `import { isPremium } from '$lib/mode/mode.svelte';`,
       `import { hasWebGL } from '$lib/mode/resolve';` and state `let webglOk = $state(false);`.
       Extend the existing onMount: `webglOk = hasWebGL();
       document.documentElement.setAttribute('data-webgl', webglOk ? 'ok' : 'no');`
       (Pitfall 5: the head script stamps data-mode='premium' for a stored choice WITHOUT probing —
       this stamp lets the 05-01 CSS revert the dark skin when WebGL is dead.)
    2. Add the gate markup AFTER `</footer>` (backdrop is position:fixed, DOM order is irrelevant to
       stacking, and keeping it last keeps the accessible shell first in source):
       ```svelte
       {#if browser && isPremium() && webglOk}
       	<!-- The ONE premium fence crossing (PREM-03). Dynamic import() => separate Vite chunk;
       	     the accessible entry graph never references it. Unmounting on toggle IS the
       	     PREM-04 pause + PREM-05 disposal trigger. -->
       	<!-- eslint-disable-next-line no-restricted-syntax -->
       	{#await import('$lib/premium/PremiumLayer.svelte') then { default: PremiumLayer }}
       		<PremiumLayer />
       	{:catch}
       		<!-- chunk failed to load: the accessible DOM above is complete — do nothing -->
       	{/await}
       {/if}
       ```
    3. Rewrite `src/lib/premium/README.md` fence contract: nothing outside src/lib/premium/ imports
       $lib/premium/* — statically (no-restricted-imports) or dynamically (no-restricted-syntax) —
       EXCEPT the single gate in src/routes/+layout.svelte; internal imports are relative; the premium
       graph is budget-gated by scripts/check-premium-budget.mjs (arrives in 05-04).
    4. Smoke-check the split: run `pnpm build`, then assert (a) no file in build/_app/immutable/entry/
       or build/_app/immutable/nodes/ contains the WebGL runtime signature, and (b) at least one chunk
       elsewhere under build/_app/immutable/ DOES (the lazy premium chunk exists):
       `! grep -rlE "WebGLRenderer" build/_app/immutable/entry build/_app/immutable/nodes`
       and `grep -rlE "WebGLRenderer" build/_app/immutable/chunks | head -1` is non-empty.
       (The full closure-walk proof is 05-04's script; this catches gross regressions now.)
  </action>
  <acceptance_criteria>
    - `grep -c "import('\$lib/premium/PremiumLayer.svelte')" src/routes/+layout.svelte` outputs 1 (exactly one gate)
    - `grep -q "eslint-disable-next-line no-restricted-syntax" src/routes/+layout.svelte`
    - `grep -q "isPremium() && webglOk" src/routes/+layout.svelte`
    - `grep -q "data-webgl" src/routes/+layout.svelte`
    - `grep -q "check-premium-budget" src/lib/premium/README.md`
    - `pnpm exec eslint .` exits 0 (the disable comment scopes the single exception)
    - After `pnpm build`: `grep -rlE "WebGLRenderer" build/_app/immutable/entry build/_app/immutable/nodes` finds NOTHING, and `grep -rlE "WebGLRenderer" build/_app/immutable` finds at least one chunk
    - `pnpm exec vitest --run --project=server` still green (no regression in existing suites)
  </acceptance_criteria>
  <verify>
    <automated>pnpm check && pnpm exec eslint . && pnpm build && bash -c '! grep -rlqE "WebGLRenderer" build/_app/immutable/entry build/_app/immutable/nodes && grep -rlqE "WebGLRenderer" build/_app/immutable'</automated>
  </verify>
  <done>Exactly one gated dynamic import mounts PremiumLayer; data-webgl stamped for the Pitfall-5 CSS; build emits the premium graph as a separate lazy chunk while entry/nodes stay WebGL-free.</done>
</task>

</tasks>

<verification>
- `pnpm check` 0/0, `pnpm exec eslint .` clean (single scoped disable at the gate), `pnpm exec vitest --run --project=server` green
- `pnpm build` succeeds; entry/nodes contain no `WebGLRenderer|@threlte|THREE.` signature; a lazy chunk does
- The premium subtree consumes ONLY: relative siblings, 'three', '@threlte/core', '@threlte/extras', '$app/state', '$app/paths', 'svelte' — no content/component imports (D-16: the DOM is untouched)
- src/lib/premium/ contains zero .glb references and zero GLTFLoader/draco/ktx2 code (D-05/D-06)
</verification>

<success_criteria>
- Premium mode = live crystalline world behind the unchanged Phase-4 DOM, one Canvas, per-route configs
- Accessible mode = subtree fully unmounted; accessible entry graph provably WebGL-free at build level
- Motion authority gates every task; disposal + context-loss floor implemented (E2E proof lands in 05-05)
</success_criteria>

<output>
After completion, create `.planning/phases/05-premium-3d-layer/05-03-SUMMARY.md`
</output>
