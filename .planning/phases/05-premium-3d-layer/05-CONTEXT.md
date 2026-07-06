# Phase 5: Premium 3D Layer - Context

**Gathered:** 2026-07-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Premium mode adds an interactive WebGL experience across the main sections as a pure client-only enhancement, entered by exactly one dynamic import so the Accessible bundle ships zero WebGL bytes. Single shared Canvas (PREM-02), lazy assets + render-loop pause (PREM-04), GPU disposal on unmount (PREM-05), reduced-motion honored even in Premium (PREM-06), graceful fallback to accessible presentation without WebGL. Verification hardening (axe both modes, zero-WebGL network assertion, SR pass) is Phase 6 — this phase builds the layer; Phase 6 proves it.

</domain>

<decisions>
## Implementation Decisions

### 3D Art Direction
- **D-01:** Abstract crystalline brand geometry — floating faceted/refractive forms and geometric clusters in the DID palette. No literal/figurative scenes. Echoes the Crystarium-style language the user likes (sibling Eman_dashboard project) without copying it.
- **D-02:** Deep-blue night world + orange glow — dark blue900 (`#0b2a4a`) environment, objects lit with warm orange rim/emissive accents (orange500/orangeDeep `#c85f08`). Light-on-dark DOM text over it.
- **D-03:** Calm ambient drift as the motion baseline — slow rotation/float/breathing. Dignified, low motion-discomfort risk (disability-equity audience), degrades gracefully under reduced-motion.
- **D-04:** ONE evolving world, not per-section scene swaps — a single continuous scene on the shared Canvas that reconfigures/morphs between states. Site is multi-page: world state changes per ROUTE (canvas persists in the layout across navigations) and morphs with SCROLL within each page.

### Asset Strategy
- **D-05:** Fully procedural geometry — everything generated in code (icosahedra/custom BufferGeometry/particles/shader materials). ZERO GLB files. This resolves the standing "no GLB assets exist" blocker outright.
- **D-06:** No GLB loader pipeline this phase — no GLTFLoader/draco/ktx2 plumbing (YAGNI). PREM-04 lazy-loading applies to the code chunks themselves.
- **D-07:** Enforced size budget on the lazy Premium chunk, CI-checked (ceiling on the dynamically-imported premium graph incl. three; exact number Claude's discretion, ~600KB gzip guideline) + 60fps target on mid-range hardware.
- **D-08:** Simple two-tier device quality — detect low-end signals (devicePixelRatio, mobile, GPU hints) → reduced particle counts/effects; otherwise full quality. No runtime adaptive FPS stepping.

### Interactivity
- **D-09:** Scroll + pointer parallax drive the world — scroll position morphs section states; pointer adds subtle parallax/light shift. Both degrade cleanly under reduced-motion.
- **D-10:** NO direct manipulation — 3D may react near the pointer but nothing in-canvas is clickable or focusable. All real interaction stays in the accessible DOM → zero added WCAG surface, no keyboard-parity work inside WebGL.
- **D-11:** Authored camera, scroll-eased — fixed cinematic framing per section state with slow authored drift; scroll eases between states. No user orbit controls.
- **D-12:** Touch devices: scroll-only response, no gyroscope, no touch ripples. Parallax simply absent on touch — predictable, no iOS permission prompts, no motion-sickness vector.

### Section Treatment
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements & invariants
- `.planning/ROADMAP.md` — Phase 5 goal + 5 success criteria (single Canvas, zero-WebGL accessible bundle, lazy/pause/dispose, reduced-motion in Premium, no-WebGL fallback)
- `.planning/REQUIREMENTS.md` — PREM-01..06 definitions
- `src/lib/premium/README.md` — the fence contract: nothing outside `src/lib/premium/` imports `$lib/premium/*` except the ONE dynamic-import entry gate added this phase

### Mode system (the integration surface)
- `src/lib/mode/mode.svelte.ts` — runes store: `getMode()`, `isPremium()`, `setMode()`, `toggleMode()`
- `src/lib/mode/resolve.ts` — `resolveMode()` precedence + `hasWebGL()`; the premium gate condition is `premium && webgl`
- `src/lib/mode/constants.ts` — `STORAGE_KEY='did2:mode'`, `DATA_ATTR='data-mode'`, `Mode` type

### Prior research
- `.planning/phases/04-accessible-section-components/04-RESEARCH.md` — Phase 4 research (layout/a11y patterns the premium shell must not regress)

[No external specs — remaining requirements fully captured in decisions above]

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 7 accessible section components (`src/lib/components/sections/`: Hero, Mission, ServicesOverview, ServicesDetail, About, SocialProof, Contact) — per D-16 these render UNCHANGED in Premium; the 3D layer goes behind them
- `src/routes/+layout.svelte` — the shell (SkipLinks → sticky header + ModeToggle → main → footer); the shared Canvas mounts here so it persists across route navigations (D-04)
- `src/lib/mode/` store — already exposes everything the entry gate needs (`isPremium()`, `hasWebGL()`); do NOT re-derive precedence
- DID design tokens (typed source + CSS custom props, contrast-gated) — the dark skin (D-02/D-16) should extend this token system, and new dark-mode text/background pairs must pass the existing culori WCAG gate
- `three@0.175.0` + `@types/three` already pinned (override in `pnpm-workspace.yaml`, NOT package.json `pnpm.overrides` — pnpm 11 ignores the latter); Threlte v8 to be added this phase against that pin

### Established Patterns
- ESLint `no-restricted-imports` fences `lib/premium/` — the ONE dynamic import entry added this phase will need a scoped, justified exception at exactly one site
- Zero-WebGL gate exists (04-06 scans `build/_app` for WebGL runtime signatures) — MUST still pass for the accessible entry after Phase 5; the premium chunk must be a separate lazy chunk
- Playwright config pins `BASE_PATH=/diversityincludesdisability_two` + `reuseExistingServer: true`; E2E must not assume a starting mode (fresh context resolves to LOCKED premium default for capable/no-preference visitors)
- TDD with client-project vitest specs per component; `pnpm check` 0/0 and eslint-clean are standing gates
- Reduced-motion CSS guard already exists in `app.css`; premium must ALSO honor it in-canvas (PREM-06 — frame-loop level, not just CSS)

### Integration Points
- Entry gate: layout-level conditional (`premium && webgl`) wrapping the single dynamic `import('$lib/premium/...')` — the one fence crossing
- `data-mode` attribute on `<html>` — the dark skin can key off `[data-mode='premium']` selectors
- Mode toggle flips live — mount/unmount of the premium layer must dispose GPU resources (PREM-05) and pause the frame loop when Accessible (PREM-04)
- `document.hidden` / visibilitychange — frame-loop pause when tab hidden (PREM-04)

</code_context>

<specifics>
## Specific Ideas

- Crystalline aesthetic should feel kin to the FFXIII-Crystarium direction the user chose for the sibling Eman_dashboard project — same family, not a copy
- The Accessibility Statement page as "a quiet room" — deliberately calm even in Premium mode; the restraint is itself on-message
- "Premium must never mean heavy": the enforced chunk budget is part of the brand promise, not just engineering hygiene

</specifics>

<deferred>
## Deferred Ideas

- Commissioned/real GLB asset upgrade (and the draco/ktx2 pipeline that comes with it) — future milestone; procedural is the v1 answer
- Gyroscope tilt parallax on mobile — revisit only with explicit UX review (permission prompts + motion-sensitivity risk)
- Clickable/focusable in-canvas 3D objects — would require full keyboard/SR parity inside WebGL; only with dedicated a11y design
- Hover-highlight wiring between DOM elements and their 3D counterparts — nice-to-have cohesion pass, candidate for a polish phase
- Delete `src/routes/demo/playwright` scaffold (pre-existing base-path E2E failure) — already logged in `deferred-items.md`, good `/gsd:quick` target

</deferred>

---

*Phase: 05-premium-3d-layer*
*Context gathered: 2026-07-06*
