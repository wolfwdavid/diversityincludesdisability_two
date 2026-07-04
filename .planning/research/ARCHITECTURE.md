# Architecture Research

**Domain:** SvelteKit + Threlte dual-mode 3D marketing site (Premium WebGL ⇄ zero-WebGL Accessible peer), static-deployed to GitHub Pages
**Researched:** 2026-07-04
**Confidence:** HIGH (core SvelteKit/Svelte 5/Threlte patterns verified against official docs + release notes); MEDIUM on exact pinned version numbers

## Standard Architecture

The controlling idea: **Accessible mode is the prerendered baseline; Premium mode is a client-only progressive enhancement layered on top.** The server/prerender pass emits semantic, WebGL-free HTML (the Accessible peer). After hydration, if the resolved mode is `premium`, the client dynamically imports a single Three.js/Threlte layer and swaps rendering. This structure makes the core value ("if everything fails, accessible mode works") a property of the architecture rather than a runtime hope — the WebGL payload physically cannot enter the accessible bundle because it lives behind a dynamic `import()` that only executes in premium mode.

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  CONTENT LAYER  (single source of truth — static, read-only)     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ nav.ts   │ │services.ts│ │ bio.ts   │ │contact.ts│ │seo.ts  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       └────────────┴──── consumed by BOTH modes ─────────┘       │
├─────────────────────────────────────────────────────────────────┤
│  STATE LAYER  (client runtime — the only mutable state)          │
│  ┌───────────────┐   ┌──────────────────┐  ┌──────────────────┐ │
│  │ mode store    │   │ reducedMotion    │  │ webglSupported   │ │
│  │ 'premium' |   │◄──│ store (matchMedia)│  │ store (probe)    │ │
│  │ 'accessible'  │   └──────────────────┘  └──────────────────┘ │
│  └──────┬────────┘  (persisted → localStorage 'did-mode')        │
├─────────┼───────────────────────────────────────────────────────┤
│  SHELL LAYER  (+layout.svelte — shared, prerendered, mode-agnostic)│
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ skip-links · <Nav> · <ModeToggle> · <slot/> · <Footer>     │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  SECTION LAYER  (per route: sequence of <Section> wrappers)      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Section:hero │  │Section:service│  │ Section:about│  …        │
│  │ always renders│  │always renders │  │always renders│           │
│  │ Accessible   │  │ Accessible    │  │ Accessible   │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │ (registers premium scene id when mode==='premium')     │
├─────────┼───────────────────────────────────────────────────────┤
│  PREMIUM LAYER  (client-only, dynamically imported ONE time)     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  {#await import('$lib/premium/PremiumStage.svelte')}       │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  single global <Canvas> (Threlte / three)            │ │  │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐  scene modules     │ │  │
│  │  │  │HeroScene│ │SvcScene│ │AboutScn│  (in premium chunk)│ │  │
│  │  │  └────────┘ └────────┘ └────────┘                    │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ← entire subtree code-splits out of the accessible bundle │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Content modules (`$lib/content/*.ts`) | The single source of truth for all copy, service data, bio, contact, nav, SEO. Read-only. | Typed TS objects/arrays exported behind `interface`s; optional mdsvex for long prose (About) |
| `mode` store | Holds `'premium' \| 'accessible'`; persists to localStorage; exposes `set`/`toggle` | Svelte 5 runes module (`mode.svelte.ts`) or classic `writable`; subscribed everywhere |
| `reducedMotion` / `webglSupported` stores | Derive the *default* mode and force-fallback when premium is impossible | `matchMedia('(prefers-reduced-motion: reduce)')` + a `WebGLRenderingContext` probe |
| `+layout.svelte` (Shell) | Skip links, nav, mode toggle, footer, page `<slot/>`. Identical in both modes. | Prerendered semantic HTML, zero WebGL imports |
| `<Section>` wrapper | Always renders the Accessible content component for its section; in premium mode registers a scene id for the Premium layer to overlay | Thin Svelte component reading `mode` + a section registry |
| Accessible section components | Semantic 2D/static equivalent of each section, full content parity | Plain Svelte + HTML/CSS, imports content modules; **no three import anywhere in this graph** |
| `PremiumStage` (Premium layer) | Owns the one global Threlte `<Canvas>`, mounts per-section 3D scenes, drives scroll/animation | Dynamically imported once; Threlte `<Canvas>` + scene child components |
| Scene modules (`HeroScene`, …) | The 3D visual for one section, labelled/captioned from the same content modules | Threlte components; statically imported *inside* PremiumStage so they ride the premium chunk |

## Recommended Project Structure

```
src/
├── app.html                    # inline no-flash script: sets html[data-mode] pre-hydration
├── lib/
│   ├── content/                # SINGLE SOURCE OF TRUTH (mode-agnostic)
│   │   ├── types.ts            # Service, NavItem, SocialLink, SeoMeta interfaces
│   │   ├── nav.ts              # primary nav + a11y-statement link
│   │   ├── services.ts         # trainings, consulting, modeling, speaking
│   │   ├── bio.ts              # Eman Rimawi bio (or about.md via mdsvex)
│   │   ├── contact.ts          # email + FB/X/LinkedIn/IG links
│   │   └── seo.ts              # per-route title/description
│   ├── stores/
│   │   ├── mode.svelte.ts       # 'premium'|'accessible', localStorage, toggle()
│   │   ├── reducedMotion.svelte.ts
│   │   └── webgl.svelte.ts      # WebGL capability probe (browser-only)
│   ├── shell/                  # shared shell, NEVER imports three
│   │   ├── Nav.svelte
│   │   ├── ModeToggle.svelte
│   │   ├── SkipLinks.svelte
│   │   └── Footer.svelte
│   ├── sections/               # per-section Accessible components (baseline)
│   │   ├── Section.svelte       # wrapper: renders accessible + registers scene id
│   │   ├── HeroAccessible.svelte
│   │   ├── ServicesAccessible.svelte
│   │   └── AboutAccessible.svelte
│   └── premium/                # EVERYTHING three/threlte lives here (code-split)
│       ├── PremiumStage.svelte  # single <Canvas>; dynamically imported entry
│       ├── HeroScene.svelte
│       ├── ServicesScene.svelte
│       └── AboutScene.svelte
├── routes/
│   ├── +layout.ts               # export const prerender = true
│   ├── +layout.svelte           # Shell + <PremiumMount> gate
│   ├── +page.svelte             # home: sequence of <Section>
│   ├── services/+page.svelte
│   ├── about/+page.svelte
│   ├── contact/+page.svelte
│   └── accessibility/+page.svelte
├── styles/
│   └── tokens.css              # DID blue/orange, contrast-checked AA/AAA
└── static/
    └── .nojekyll               # so /_app assets serve on GitHub Pages
```

### Structure Rationale

- **`lib/content/` is isolated and imports nothing UI-related** — it is the parity guarantee. Both `sections/*Accessible` and `premium/*Scene` import from here, so copy exists in exactly one place. Changing a service description updates both modes atomically.
- **`lib/premium/` is a hard boundary**: it is the *only* directory allowed to `import 'three'` / `@threlte/*`. Because nothing in the static import graph reaches it (it is entered exclusively through a dynamic `import()`), Vite emits it as separate chunks that the accessible bundle never references.
- **`lib/shell/` and `lib/sections/` must have a lint rule / review check forbidding `three` imports** — this keeps the accessible bundle provably WebGL-free.

## Architectural Patterns

### Pattern 1: Mode store with layered default resolution + no-flash hydration

**What:** A single client store holds the active mode. Its *initial* value is resolved in priority order: (1) explicit stored user choice, (2) `prefers-reduced-motion: reduce` → `accessible`, (3) otherwise `premium`. An inline script in `app.html` runs before hydration to set `document.documentElement.dataset.mode` so CSS tokens (contrast/motion) apply with no flash; the store then adopts the same value on mount.
**When to use:** Any persisted, OS-preference-aware UI mode. Standard "theme toggle without FOUC" pattern applied to a rendering mode.
**Trade-offs:** The inline script duplicates ~10 lines of resolution logic (once in `app.html`, once in the store) — acceptable and conventional. Premium visuals still appear a beat after hydration (chunk load); that delay is *desirable* progressive enhancement, not a flash.

**Example:**
```html
<!-- app.html — runs before hydration, prevents contrast/motion flash -->
<script>
  try {
    var stored = localStorage.getItem('did-mode');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mode = stored || (reduce ? 'accessible' : 'premium');
    document.documentElement.dataset.mode = mode;
  } catch (e) { document.documentElement.dataset.mode = 'accessible'; }
</script>
```
```ts
// lib/stores/mode.svelte.ts (Svelte 5 runes)
import { browser } from '$app/environment';
type Mode = 'premium' | 'accessible';
function resolve(): Mode {
  if (!browser) return 'accessible';           // prerender baseline
  const stored = localStorage.getItem('did-mode') as Mode | null;
  if (stored) return stored;
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'accessible' : 'premium';
}
export const modeStore = $state<{ value: Mode }>({ value: resolve() });
export function setMode(m: Mode) {
  modeStore.value = m;
  if (browser) { localStorage.setItem('did-mode', m); document.documentElement.dataset.mode = m; }
}
export const toggleMode = () =>
  setMode(modeStore.value === 'premium' ? 'accessible' : 'premium');
```

### Pattern 2: Single dynamically-imported Premium layer (three code-splits out)

**What:** The Premium WebGL layer is entered through exactly one dynamic `import()`, gated on `mode === 'premium'` AND `webglSupported`. All Three.js/Threlte code (the `<Canvas>` plus every scene) sits behind that boundary, so Vite splits it into chunks loaded only when premium is active. The accessible bundle ships **zero WebGL bytes**.
**When to use:** Whenever a heavy optional subsystem (Three.js ~600 KB) must be excluded from the default payload. Prefer **one** dynamic import for the whole premium subtree over per-section dynamic imports, because a single global `<Canvas>` avoids WebGL-context-limit errors (browsers cap live contexts at ~8–16) and lets scenes share one renderer.
**Trade-offs:** One larger premium chunk instead of many tiny ones — fine here, since entering premium mode is an explicit, deliberate action and the whole 3D experience is wanted at once. Per-section dynamic import is the alternative if only a few sections are 3D, but it multiplies canvases/contexts and complicates a shared camera/scroll rig.

**Example:**
```svelte
<!-- lib/premium/PremiumMount.svelte — placed once in +layout.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { modeStore } from '$lib/stores/mode.svelte';
  import { webglSupported } from '$lib/stores/webgl.svelte';
  const active = $derived(browser && modeStore.value === 'premium' && webglSupported.value);
</script>

{#if active}
  {#await import('$lib/premium/PremiumStage.svelte') then M}
    <M.default />           <!-- entire three/threlte tree loads here, not before -->
  {:catch}
    <!-- load failed → accessible DOM already present, nothing to do -->
  {/await}
{/if}
```
```svelte
<!-- lib/sections/Section.svelte — always renders the accessible peer -->
<script lang="ts">
  let { component, sceneId, ...rest } = $props();
</script>
<section id={sceneId} data-scene={sceneId}>
  <svelte:component this={component} {...rest} />   <!-- semantic, prerendered -->
</section>
```

### Pattern 3: Accessible-baseline prerender + client-side enhancement (progressive enhancement)

**What:** `adapter-static` prerenders every route to HTML using the Accessible components (mode is unknowable at build time, and accessible is the correct default for no-JS / crawlers / AT). WebGL never executes during prerender because it lives only inside the client-only dynamic import and Threlte's `<Canvas>` mounts in `onMount`/effect. In premium mode the accessible DOM remains in place (as scroll skeleton / SR content, visually managed) while the Canvas overlays it.
**When to use:** Static-hosted sites where a rich client experience must not compromise the crawlable/accessible baseline. Directly satisfies the project's "accessible mode is a genuine peer, not a fallback" mandate.
**Trade-offs:** You maintain two renderings per section. Mitigated by the shared content modules (Pattern in Content Layer) so only *presentation* differs, never *information*.

## Data Flow

### Mode / render-selection flow

```
OS setting (prefers-reduced-motion)  ┐
localStorage 'did-mode'              ┼─► resolve() ─► mode store ('premium'|'accessible')
user clicks <ModeToggle>             ┘                     │
                                                           ├─► html[data-mode]  → CSS tokens (contrast/motion)
                                                           ├─► <Section> wrappers (accessible always on)
                                                           └─► <PremiumMount> gate
                                                                  │ (premium && webgl)
                                                                  ▼
                                                        import('PremiumStage')  → global <Canvas> → scenes
```

### Content flow (parity guarantee — one direction, read-only)

```
lib/content/*.ts  ──►  Accessible section components   (prerendered HTML)
        └──────────►  Premium scene components         (labels/captions in 3D)
   (identical data reaches both; presentation is the only divergence)
```

### State Management

```
mode.svelte.ts (single writable source)
    ↓ subscribe ($derived)
ModeToggle · Section wrappers · PremiumMount · CSS(html[data-mode])
    ↑ mutate
only setMode()/toggleMode()  (localStorage write is a side effect of the setter)
```

### Key Data Flows

1. **Boot:** inline `app.html` script sets `data-mode` (no flash) → hydration → `mode` store adopts same value → if premium+webgl, dynamic import mounts Canvas.
2. **Toggle:** user clicks → `toggleMode()` → store + localStorage + `data-mode` update → `PremiumMount` mounts/unmounts the Three.js subtree reactively (mounting loads the chunk once; unmounting disposes the renderer).
3. **Content edit:** change `services.ts` → both `ServicesAccessible` and `ServicesScene` reflect it on next build — no drift possible.

## Scaling Considerations

This is a static marketing site; "scale" means asset weight and device capability, not concurrent users (GitHub Pages/CDN serves flat files).

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Launch / low traffic | adapter-static + GitHub Pages CDN is sufficient; no backend |
| Heavier 3D / more scenes | Move GLTF/texture assets to lazy `@threlte/gltf` loaders inside the premium chunk; keep draco/meshopt decoders dynamically imported; consider per-scene lazy loading of large models |
| Low-end / no-WebGL devices | `webglSupported` probe auto-falls-back to accessible; ensure premium chunk is never fetched when the probe fails — the gate already guarantees this |

### Scaling Priorities

1. **First bottleneck: premium chunk / Three.js weight.** Fix by keeping three imports confined to `lib/premium/`, using `@threlte/extras` on-demand, and lazy-loading GLTF models/textures within the premium boundary. Never let `three` leak into a statically-imported module.
2. **Second bottleneck: GPU cost of "nearly every section in 3D."** Fix with one shared Canvas + camera rig, frustum culling / on-demand rendering (`<Canvas>` frameloop `demand`), and pausing render when the tab/section is offscreen.

## Anti-Patterns

### Anti-Pattern 1: Statically importing a premium component (or `three`) anywhere in the shared graph

**What people do:** `import HeroScene from '$lib/premium/HeroScene.svelte'` inside a page or shell "for convenience," then conditionally render it.
**Why it's wrong:** A static import pulls Three.js into the main chunk — the accessible bundle now ships ~600 KB of WebGL it never uses, violating the core "zero WebGL bytes in accessible mode" requirement. Conditional *rendering* does not remove code from the bundle; only a dynamic `import()` does.
**Do this instead:** Enter the premium subtree exclusively via `{#await import(...)}` / dynamic `import()`; enforce with a lint rule forbidding `three`/`@threlte` imports outside `lib/premium/`.

### Anti-Pattern 2: Touching `window`/`document`/WebGL at module top level

**What people do:** Call `matchMedia`, `new WebGLRenderingContext`, or read `localStorage` at the top level of a module that participates in SSR/prerender.
**Why it's wrong:** `adapter-static` executes modules during prerender in Node; `window` is undefined → build crash. Threlte's `<Canvas>` is SSR-safe (mounts in effect), but your own probes are not.
**Do this instead:** Guard with `import { browser } from '$app/environment'`, or run inside `onMount`/`$effect`. Keep the WebGL probe in a browser-only store.

### Anti-Pattern 3: Two separate content copies (one per mode)

**What people do:** Hard-code strings into both the accessible component and the 3D scene.
**Why it's wrong:** They drift; a copy edit lands in one mode only, breaking the parity mandate that is central to the project's ethics.
**Do this instead:** All copy/data lives in `lib/content/*.ts` (typed); both renderers import it. Long prose can be markdown via mdsvex, still single-sourced.

### Anti-Pattern 4: Multiple WebGL `<Canvas>` elements (one per section)

**What people do:** Give each 3D section its own Threlte `<Canvas>` via per-section dynamic imports.
**Why it's wrong:** Browsers cap concurrent WebGL contexts (~8–16); "nearly every section in 3D" exhausts them, causing context-loss and dropped scenes.
**Do this instead:** One global `<Canvas>` in `PremiumStage`; swap/portal scene content as the user scrolls; share a single renderer and camera rig.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub Pages | `adapter-static` full prerender; `paths.base` = `/diversityincludesdisability_two`; `static/.nojekyll` | All internal links/asset URLs must respect `base`; no server routes |
| Email / socials | Plain `mailto:` + external anchor tags from `contact.ts` | No backend; descriptive link text for a11y |
| Zeffy/PayPal (future) | External link-out only | Out of scope for v1; no in-site payment |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| content ↔ (accessible ∥ premium) | direct typed import, read-only | The parity contract; no mutation downstream |
| shell/sections ↔ premium | dynamic `import()` only | The code-split firewall — the one-way door that keeps three out of the accessible bundle |
| mode store ↔ everything | subscribe / `$derived`; mutate via `setMode` only | Single source of runtime truth |
| Vite SSR config ↔ three | `ssr.noExternal: ['three']` (and threlte pkgs) | Prevents SSR externalization errors if any three module is analyzed during prerender |

## Build Order (roadmap dependency implications)

The ordering deliberately ships a **complete, accessible, deployable site before any WebGL exists**, so the non-negotiable core value is satisfied and de-risked first.

1. **Shell + tokens + routes + deploy config** — `+layout`, skip links, nav, footer, accessibility-statement route, DID palette tokens, `adapter-static` + `paths.base` + `.nojekyll`. *Prerequisite for everything; proves GitHub Pages deploy works early.*
2. **Content source of truth** — `lib/content/*.ts` + `types.ts`. *Must exist before either renderer; both consume it.*
3. **Mode state system** — `mode.svelte.ts`, `reducedMotion`, `webgl` probes, `app.html` no-flash script, `<ModeToggle>`. *Needed before sections branch on mode; toggle can flip a mode with no premium layer yet.*
4. **Accessible section components** — full-parity baseline for every route. *At this milestone the entire site is live, accessible (WCAG 2.2 AA), and deployable. Core value met.*
5. **Premium layer** — `PremiumStage` (global Canvas), per-section scenes, `PremiumMount` gate. *Depends on 2 (content), 3 (mode/webgl gate), 4 (accessible DOM as scroll skeleton). Pure enhancement; can be built section-by-section without ever regressing the accessible peer.*
6. **Polish** — graceful degradation, on-demand frameloop, GLTF/texture lazy-loading, screen-reader + keyboard pass across both modes, Lighthouse/axe checks.

**Direction of dependency:** content → (accessible baseline ∥ mode state) → premium enhancement → polish. Nothing in steps 1–4 may import from `lib/premium/`.

## Sources

- [Threlte — Getting Started / Installation](https://threlte.xyz/docs/learn/getting-started/installation) — package set (`@threlte/core`, `@threlte/extras`, `@threlte/gltf`), single-Canvas guidance (HIGH)
- [Threlte GitHub](https://github.com/threlte/threlte) — Svelte 5 support, `ssr.noExternal: ['three']` recommendation (HIGH)
- [SvelteKit Performance docs](https://svelte.dev/docs/kit/performance) — code-splitting via dynamic `import()`, keeping heavy libs off the main chunk (HIGH)
- [Geoff Rich — prefers-reduced-motion store](https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/) and [Alvin Bryan — prefers-reduced-motion in SvelteKit](https://alvin.codes/snippets/sveltekit-reduced-motion) — reduced-motion store + `browser` guard pattern (MEDIUM)
- [OpenReplay — Lazy loading Svelte components](https://blog.openreplay.com/lazy-load-components-svelte/) and [flaming.codes — dynamic imports in Svelte](https://flaming.codes/posts/lazy-loading-modules-in-svelte-to-import-components-on-demand/) — `{#await import()}` / `<svelte:component>` mechanics (MEDIUM)
- [Three.js + SvelteKit integration guide (2026)](https://threejsresources.com/frameworks/three-js-svelte) — SSR externalization notes for three (MEDIUM)
- Svelte 5 runes ($state/$derived/$effect/$props) — reactivity model for stores (HIGH, official)

---
*Architecture research for: SvelteKit + Threlte dual-mode 3D marketing site with WebGL/accessible parity*
*Researched: 2026-07-04*
