---
phase: 05-premium-3d-layer
plan: 03
subsystem: ui
tags: [threlte, three, webgl, svelte5, runes, code-splitting, lazy-loading]

# Dependency graph
requires:
  - phase: 05-premium-3d-layer plan 01
    provides: premium dark-skin CSS behind :root[data-mode='premium']:not([data-webgl='no']) + z-index-1 DOM shell stacking
  - phase: 05-premium-3d-layer plan 02
    provides: fence guard (static+dynamic), tier/motion/worldState pure modules + runes motion authority (initMotion, motion.animating/parallax/reduced)
  - phase: 03-mode-toggle
    provides: isPremium() runes getter, hasWebGL() probe, data-mode pre-paint stamp
provides:
  - src/lib/premium/ full 3D world — PremiumLayer (Canvas host), Scene (night world root), CameraRig (authored per-route camera), 3 procedural object groups
  - the ONE sanctioned dynamic-import entry gate in +layout.svelte ({#if browser && isPremium() && webglOk})
  - data-webgl='ok'|'no' stamp on <html> (Pitfall-5 skin revert hook)
  - worldState.svelte.ts runes wrapper (currentConfig from page/base, cached-maxScroll scroll progress)
  - build-proven chunk split — entry/nodes WebGL-free, premium graph in a lazy chunk
affects: [05-04 budget gate (measures the premium graph), 05-05 premium E2E (asserts gate/motion/disposal), 06 QA]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useTask(fn, { running: () => motion.animating }) — every per-frame task gated by the single motion authority (v8 API, no stop/start)"
    - "allocate-once + <T is={obj}> auto-disposal — geometries/materials/meshes created at init, only matrices/attributes mutated per frame"
    - "svelte-ignore state_referenced_locally with justification comment for intentional init-once prop captures"
    - "reduced-motion still-frame: gated task off + $effect snap + invalidate() once per route change"

key-files:
  created:
    - src/lib/premium/state/worldState.svelte.ts
    - src/lib/premium/PremiumLayer.svelte
    - src/lib/premium/Scene.svelte
    - src/lib/premium/CameraRig.svelte
    - src/lib/premium/objects/CrystalCluster.svelte
    - src/lib/premium/objects/ParticleField.svelte
    - src/lib/premium/objects/GlowAccents.svelte
  modified:
    - src/routes/+layout.svelte
    - src/lib/premium/README.md

key-decisions:
  - "GlowAccents uses plain MeshStandardMaterial emissive (executor's choice over FakeGlowMaterial) — zero @threlte/extras bytes in the premium graph, no post-effect chain (D-07 skip)"
  - "Route-change maxScroll remeasure via tick().then() instead of requestAnimationFrame — keeps the whole premium subtree free of raw frame callbacks (Task-2 acceptance grep)"
  - "Camera starts AT the current route's authored framing in oncreate — never eases out of the degenerate origin-looking-at-origin first frame"
  - "frustumCulled=false on all three object groups — instances/points range beyond base geometry bounds; backdrop scene is always visible anyway"

patterns-established:
  - "Premium components take { tier, spread, glow } plain props from Scene's $derived(currentConfig()) — world morphs flow down as data, no cross-component reactivity"
  - "compose(spread, time) helper shared by the gated task AND the reduced-motion $effect so still frames and animated frames are the same code path"

requirements-completed: [PREM-01, PREM-02, PREM-03, PREM-04, PREM-05, PREM-06]

# Metrics
duration: 17min
completed: 2026-07-06
---

# Phase 5 Plan 03: Premium World & Entry Gate Summary

**Full procedural crystalline WebGL world (instanced icosahedra + additive dust + orbiting emissive shards) on one layout-persistent Canvas, mounted by the single sanctioned dynamic import — build-proven: entry/nodes WebGL-free, premium graph a separate lazy chunk**

## Performance

- **Duration:** 17 min
- **Started:** 2026-07-06T10:59:20Z
- **Completed:** 2026-07-06T11:16:41Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- The Premium 3D world exists end-to-end: fixed aria-hidden backdrop Canvas (z-index 0, pointer-events none) behind the unchanged Phase-4 DOM, with per-route world configurations (camera/spread/glow) morphing on one continuous scene (PREM-01/02)
- Exactly ONE fence crossing: `{#await import('$lib/premium/PremiumLayer.svelte')}` behind `{#if browser && isPremium() && webglOk}` in the layout, with the scoped `no-restricted-syntax` disable — toggling to Accessible unmounts the whole subtree (PREM-03/04)
- Every per-frame task (camera damp, crystal drift, particle ascent, shard orbits) runs through `useTask` gated by `running: () => motion.animating` — reduced-motion and hidden-tab stop all drift; reduced-motion route changes snap via `$effect` + one `invalidate()` (PREM-04/06)
- Disposal hardened: Threlte auto-disposal (allocate-once + `<T is>`) plus `renderer.forceContextLoss()` on destroy; `webglcontextlost` flips the contextLost floor, unmounting the dead canvas over the complete accessible DOM (PREM-05, Pitfalls 2-3)
- `data-webgl='ok'|'no'` stamped on `<html>` in the layout's onMount, so the 05-01 dark skin (`:not([data-webgl='no'])`) reverts for a stored-premium visitor with no WebGL (Pitfall 5)
- Build smoke check green: `build/_app/immutable/{entry,nodes}` carry zero `WebGLRenderer|@threlte|THREE.` signatures; the premium graph landed in a lazy chunk (`chunks/CZMfpNTA.js`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Canvas host, world root, camera rig, world-state wrapper** - `59b4ef1` (feat)
2. **Task 2: Procedural crystalline objects — crystals, particles, glow accents** - `6549e17` (feat)
3. **Task 3: The ONE entry gate + data-webgl stamp + fence README + chunk-split smoke check** - `b24f615` (feat)

## Files Created/Modified

- `src/lib/premium/state/worldState.svelte.ts` - Runes wrapper: `currentConfig()` over `page`/`base`, scroll progress with cached maxScroll (resize listener + route-change `tick()` remeasure, never per frame)
- `src/lib/premium/PremiumLayer.svelte` - Dynamic-import target: fixed aria-hidden backdrop, `data-motion` attribute, tier-clamped dpr `[1,1.5]`/`[1,2]`, contextLost floor, `initMotion()`+`initWorldScroll()` on mount
- `src/lib/premium/Scene.svelte` - World root: `#071c33` night background + FogExp2, D-02 light rig (ambient blue / white directional / warm orange point), `webglcontextlost` listener, `forceContextLoss()` on destroy
- `src/lib/premium/CameraRig.svelte` - Authored per-route camera, `MathUtils.damp` per-axis easing, scroll-progress offset + pointer parallax (gated by `motion.parallax`), reduced-motion snap `$effect`
- `src/lib/premium/objects/CrystalCluster.svelte` - InstancedMesh flat-shaded icosahedra (10/24 by tier), deterministic hash-fract seeds, damped spread morphs, calm rotation + vertical float
- `src/lib/premium/objects/ParticleField.svelte` - 120/400 additive orange points drifting upward with box wrap, field scaled by route spread via the object transform
- `src/lib/premium/objects/GlowAccents.svelte` - 3/5 orbiting emissive shards with breathing scale, plain emissive material (no post-effect chain)
- `src/routes/+layout.svelte` - The ONE entry gate + `data-webgl` stamp; SkipLinks/header/main/footer order and unconditional ModeToggle untouched
- `src/lib/premium/README.md` - Rewritten fence contract: static+dynamic rules, the single sanctioned crossing, relative-internal-imports rule, 05-04 budget gate

## Decisions Made

- **GlowAccents: plain `MeshStandardMaterial` emissive instead of `FakeGlowMaterial`** — keeps `@threlte/extras` entirely out of the premium graph (smaller chunk for the 05-04 budget), and AgX tone mapping (Threlte default) already gives hot-core falloff. Bloom/post chain skipped per D-07 discretion.
- **`tick().then(recomputeMaxScroll)` for route-change remeasure** — the plan suggested rAF, but Task 2's acceptance criterion forbids `requestAnimationFrame` anywhere in `src/lib/premium/`; `tick()` measures after the same DOM flush without a raw frame callback.
- **Camera seeded at the authored route framing in `oncreate`** — avoids a degenerate first frame (camera at origin looking at origin) before the damp task converges.
- **`frustumCulled = false` on all object groups** — instanced/point positions extend far beyond the base geometry's bounding sphere; culling against it would wrongly hide the backdrop.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Temporary scoped eslint-disable for Scene's `tier` prop between Tasks 1 and 2**
- **Found during:** Task 1 (Canvas host, world root, camera rig)
- **Issue:** The plan has Scene declare `tier` in Task 1 but its consumers (object components) only arrive in Task 2; `svelte/no-unused-props` fails the Task-1 eslint gate
- **Fix:** Declared `tier` in the Props type without destructuring it, plus a one-line scoped disable; Task 2 destructures `tier` and removes the disable
- **Files modified:** src/lib/premium/Scene.svelte
- **Verification:** `pnpm exec eslint src/lib/premium/` clean in both task states
- **Committed in:** 59b4ef1 (added) / 6549e17 (removed)

**2. [Rule 3 - Blocking] Replaced `requestAnimationFrame` with `tick()` in worldState.svelte.ts**
- **Found during:** Task 2 (acceptance criterion `! grep -rq "requestAnimationFrame" src/lib/premium/`)
- **Issue:** Task 1's route-change maxScroll remeasure used a one-shot rAF, which Task 2's subtree-wide grep forbids
- **Fix:** `void tick().then(recomputeMaxScroll)` — same post-flush timing, no raw frame callback
- **Files modified:** src/lib/premium/state/worldState.svelte.ts
- **Verification:** grep clean; `pnpm check` 0/0
- **Committed in:** 6549e17

**3. [Rule 1 - Bug] Suppressed 8 intentional `state_referenced_locally` svelte-check warnings**
- **Found during:** Task 2 (object components)
- **Issue:** The mandated allocate-once design (tier-scaled counts, initial material intensity, damped-spread seed) reads props at init, which Svelte 5 warns about; the standing gate is `pnpm check` 0/0 WARNINGS
- **Fix:** `// svelte-ignore state_referenced_locally` with a justification comment line above each (tier is fixed per mount; glow/spread initial values are corrected reactively by the `$effect`s). Note: the ignore comment must NOT carry `-- prose` on the same line — eslint's `svelte/no-unused-svelte-ignore` parses trailing words as bogus ignore codes
- **Files modified:** src/lib/premium/objects/CrystalCluster.svelte, ParticleField.svelte, GlowAccents.svelte
- **Verification:** `pnpm check` 0 errors 0 warnings; `pnpm exec eslint src/lib/premium/` clean
- **Committed in:** 6549e17

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All fixes were required to keep the plan's own gates green; no scope creep, no behavior change.

## Verification Notes

- One Task-1 acceptance criterion (`! grep -rq "$lib/premium" src/lib/premium/`) matches prose, not code: the fence README (both the pre-existing one and the Task-3 rewrite the plan itself specifies) must literally name `$lib/premium/*` to document the rule. All `.ts`/`.svelte` files in the subtree are alias-free — the criterion's intent (relative internal imports only) holds. Same false-positive class Phase 4 documented for the A11Y-08 prose scan.
- Full-signature scan (`WebGLRenderer|@threlte|THREE\.`) on `build/_app/immutable/{entry,nodes}`: zero matches; premium chunk present under `chunks/`.
- Premium subtree external import surface verified: `three`, `@threlte/core`, `$app/state`, `$app/paths`, `svelte` only (plus `vitest` in the 05-02 spec files). Zero `.glb`/GLTFLoader/draco/ktx2 references.
- Regression: `pnpm exec vitest --run --project=server` 45/45 green; `pnpm check` 0/0; `pnpm exec eslint .` exit 0.

## Issues Encountered

None beyond the auto-fixed deviations above.

## Known Stubs

None — the empty `{:catch}` branch at the entry gate is the plan-specified intentional fallback (the accessible DOM is the complete floor), not a stub.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The phase core is live: Premium mode shows the crystalline world across all 5 routes on one shared Canvas with lazy loading, motion gating, and disposal wired
- 05-04 (budget gate) can now measure a real premium graph — note it is NOT using @threlte/extras, so the graph is three + @threlte/core + scene code only
- 05-05 (premium E2E) has all its hooks in place: `.premium-backdrop[data-motion]`, `data-webgl` on `<html>`, the toggle-unmount path, and the contextLost floor

---
*Phase: 05-premium-3d-layer*
*Completed: 2026-07-06*

## Self-Check: PASSED

All 10 key files exist on disk; all 3 task commits (59b4ef1, 6549e17, b24f615) present in git log.
