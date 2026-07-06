# Phase 5: Premium 3D Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-06
**Phase:** 05-premium-3d-layer
**Areas discussed:** 3D art direction, Asset strategy, Interactivity level, Section treatment

---

## 3D Art Direction

| Option | Description | Selected |
|--------|-------------|----------|
| Abstract brand geometry | Floating crystalline/faceted forms, refractive glass, geometric clusters in DID blue/orange; procedural-friendly | ✓ |
| Organic particles & waves | Flowing particle fields, ribbons, soft waves | |
| Symbolic/figurative | Literal motifs — nodes/people shapes, bridges, mosaics | |

| Option | Description | Selected |
|--------|-------------|----------|
| Deep blue night + orange glow | Dark blue900 environment, warm orange rim/emissive accents | ✓ |
| Light & airy | Pale environment with blue-orange objects | |
| Duotone gradient shift | Blue→orange ambience transition across scroll | |

| Option | Description | Selected |
|--------|-------------|----------|
| Calm ambient drift | Slow rotation/float/breathing; dignified, low discomfort risk | ✓ |
| Lively & responsive | Faster orbital motion, springy reactions | |
| Near-static sculptural | Still compositions, lighting/parallax only | |

| Option | Description | Selected |
|--------|-------------|----------|
| One evolving world | Single continuous scene morphing between section states | ✓ |
| Distinct scene per section | Per-section compositions in the same style family | |
| Hero-only showpiece | Rich hero, minimal ambient elsewhere | |

**User's choice:** All recommended options.
**Notes:** Crystalline language may echo the Eman_dashboard Crystarium aesthetic (same family, not a copy).

---

## Asset Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Fully procedural | All geometry generated in code; zero GLB files | ✓ |
| Procedural + CC0 GLB accents | Requires draco/ktx2 pipeline + license vetting | |
| Placeholder now, commission later | Procedural placeholders flagged for replacement | |

| Option | Description | Selected |
|--------|-------------|----------|
| Skip GLB pipeline entirely | No loader plumbing; add only when a real model arrives | ✓ |
| Wire loaders now | GLTFLoader+draco pathway with test asset | |

| Option | Description | Selected |
|--------|-------------|----------|
| Enforced size budget | CI-checked ceiling on the lazy premium chunk (~600KB gz guideline) + 60fps target | ✓ |
| Soft target only | No automated gate | |
| No budget | Visual impact first | |

| Option | Description | Selected |
|--------|-------------|----------|
| Simple two-tier | Low-end signals → reduced particle counts/effects | ✓ |
| Single quality level | One tuned quality for everyone | |
| Full adaptive | Runtime FPS monitoring with dynamic step-down | |

**User's choice:** All recommended options.
**Notes:** Fully-procedural resolves the standing "no GLB assets exist" blocker from STATE.md.

---

## Interactivity Level

| Option | Description | Selected |
|--------|-------------|----------|
| Scroll + pointer parallax | Scroll morphs section states; pointer adds parallax/light shift | ✓ |
| Scroll-linked only | World ignores the pointer | |
| Pointer-reactive only | Cursor proximity reactions, no scroll driving | |

| Option | Description | Selected |
|--------|-------------|----------|
| None — reactive only | Nothing in-canvas clickable/focusable; all interaction stays in DOM | ✓ |
| Hover highlights tied to DOM | DOM hover highlights 3D counterpart | |
| Clickable 3D objects | In-canvas buttons/links (full a11y parity required) | |

| Option | Description | Selected |
|--------|-------------|----------|
| Authored drift, scroll-eased | Fixed cinematic framing per state, scroll eases between | ✓ |
| User orbit controls on hero | Drag-to-orbit | |
| Fully static camera | Only objects move | |

| Option | Description | Selected |
|--------|-------------|----------|
| Scroll-only, no gyro | Touch responds to scroll alone; parallax absent | ✓ |
| Gyroscope tilt parallax | Device tilt substitutes for pointer | |
| Touch-point ripples | Taps/drags create local reactions | |

**User's choice:** All recommended options (question re-presented once at user request before answering).
**Notes:** Zero added WCAG surface — deliberate for a disability-equity brand.

---

## Section Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Full-viewport immersive hero | World fills first viewport; DOM headline + CTA float over | ✓ |
| Split hero | Text column beside a 3D panel | |
| Banner-height 3D | Short 3D band above the fold | |

| Option | Description | Selected |
|--------|-------------|----------|
| All except Accessibility page | Home/Services/About/Contact get distinct world configurations; statement page stays calm | ✓ |
| Every route incl. Accessibility | Uniform treatment everywhere | |
| Home only, ambient elsewhere | Full world on Home only | |

| Option | Description | Selected |
|--------|-------------|----------|
| DOM on top + scrim system | Consistent WCAG-AA-tuned scrim/contrast layer over the Canvas | ✓ |
| Carved zones | 3D confined to zones never behind text | |
| 3D text elements | Headlines rendered in-canvas | |

| Option | Description | Selected |
|--------|-------------|----------|
| Same DOM, restyled shell | Identical Phase-4 components in both modes; Canvas behind + dark skin | ✓ |
| Premium layout variants | Premium-specific arrangement of the same content | |

**User's choice:** All recommended options.
**Notes:** Multi-page architecture noted — Canvas persists in the layout; "one evolving world" = per-route states + per-scroll morphing.

## Claude's Discretion

- Exact chunk-budget number and enforcement mechanism
- Shape vocabulary, shader/material, bloom/post-processing details
- Scrim implementation and dark-skin token mapping
- Scroll-easing curves, parallax intensity, camera path authoring
- Low-end tier detection heuristics
- Accessibility page: faint ambient vs none
- WebGL-context-loss recovery UX

## Deferred Ideas

- Commissioned/real GLB asset upgrade + draco/ktx2 pipeline — future milestone
- Gyroscope tilt parallax — needs UX review (permissions, motion sensitivity)
- Clickable/focusable in-canvas 3D — needs dedicated a11y design
- DOM↔3D hover-highlight wiring — polish-phase candidate
- Delete `src/routes/demo/playwright` scaffold — already in deferred-items.md
