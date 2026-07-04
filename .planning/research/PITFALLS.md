# Pitfalls Research

**Domain:** SvelteKit + Threlte dual-mode (WebGL "Premium" ⇄ zero-WebGL "Accessible") 3D marketing site, static-deployed to GitHub Pages
**Researched:** 2026-07-04
**Confidence:** HIGH (stack-specific failure modes verified against SvelteKit adapter-static docs, sveltejs/kit issues #4528/#10358, Threlte 8 / Svelte 5 migration notes, and Three.js disposal guidance)

## Critical Pitfalls

### Pitfall 1: `paths.base` wrong / hardcoded absolute asset paths → total asset 404 on GitHub Pages

**What goes wrong:**
Site deploys to `https://wolfwdavid.github.io/diversityincludesdisability_two/` but every `_app/` chunk, CSS file, GLTF model, and texture is requested from the domain root (`/_app/...`) instead of `/diversityincludesdisability_two/_app/...`. Result: blank white page, console full of 404s, or "Failed to load module script" MIME errors. This is the single most common GitHub-Pages-subpath failure (sveltejs/kit #4528, #10358) and it bites hardest here because the 3D payload (models/textures) is *also* fetched at runtime via strings you write by hand — those don't get the base prefix automatically.

**Why it happens:**
`kit.paths.base` isn't set to the repo name, OR it is set but developer references assets with root-absolute strings (`/models/hero.glb`, `<img src="/logo.svg">`, `fetch('/data.json')`) instead of prefixing with `base` from `$app/paths`. SvelteKit rewrites `href`/`src` in *markup* it controls, but runtime `fetch`/`new GLTFLoader().load('/...')` strings are opaque to it.

**How to avoid:**
- Set `kit.paths.base = process.env.NODE_ENV === 'production' ? '/diversityincludesdisability_two' : ''` (or read from an env var so local dev stays at root).
- Prefix EVERY runtime asset URL: `import { base } from '$app/paths'; loader.load(\`${base}/models/hero.glb\`)`. Same for textures, draco decoder path, HDR/env maps, JSON.
- Put static assets under `/static` and always resolve through `base` or `resolve()` — never bare `/`.
- Add a Playwright/manual smoke test that loads the built site *from the subpath* (e.g. `npx serve build` then browse under a subpath, or check the deployed URL) — dev server at root hides this bug completely.

**Warning signs:**
Works perfectly on `pnpm dev` and even `pnpm preview` at localhost root, then breaks only on the live github.io URL. Network tab shows requests to `github.io/_app/...` missing the repo segment. Models silently never appear while the rest of the page renders.

**Phase to address:**
Foundation / deploy-scaffold phase (set base + `.nojekyll` + CI before any 3D). Re-verify in the phase that first loads a GLTF at runtime.

---

### Pitfall 2: Missing `.nojekyll` → GitHub Pages hides `_app/` (underscore) directory

**What goes wrong:**
GitHub Pages runs Jekyll by default, and Jekyll *excludes any file or folder beginning with an underscore*. SvelteKit emits all hashed JS/CSS into `_app/`. Without a `.nojekyll` marker, Pages serves the HTML but returns 404 for the entire `_app/` tree — page loads with no styling and no JS, no 3D, no hydration.

**Why it happens:**
Developers assume the static build is served verbatim. The `.nojekyll` file is easy to forget, and it's invisible (dotfile) so it's easy to `.gitignore` accidentally or lose in a copy step.

**How to avoid:**
- If deploying via `actions/deploy-pages` + `upload-pages-artifact`, Jekyll is bypassed and `_app/` serves fine — this is the recommended path and sidesteps the issue.
- If deploying to a `gh-pages` branch (peaceiris/actions-gh-pages or manual), commit a `static/.nojekyll` (empty file) so adapter-static copies it into `build/`, OR let the action inject one (`enable_jekyll: false` / it adds `.nojekyll` by default). Verify `build/.nojekyll` exists after `pnpm build`.
- Confirm `.nojekyll` is NOT caught by `.gitignore`.

**Warning signs:**
Live site shows unstyled HTML; DevTools shows 404 for `/_app/immutable/...`. Root `index.html` loads but nothing else. Works locally (no Jekyll locally).

**Phase to address:**
Foundation / deploy-scaffold phase — part of the first green deploy, before feature work.

---

### Pitfall 3: 404 on refresh / deep-link (no SPA fallback or trailingSlash mismatch)

**What goes wrong:**
`/` works, client-side nav to `/services` works, but hard-refresh or direct-linking `/services` returns GitHub's 404 page. Or every internal link 404s because GitHub Pages needs `/services/index.html` (directory) and adapter-static emitted `/services.html`.

**Why it happens:**
GitHub Pages is a dumb static file server with no rewrite rules — it can't map `/services` to `services.html`. Two interacting choices matter: (a) whether you fully prerender vs. rely on a SPA fallback, and (b) `trailingSlash`. Default `trailingSlash: 'never'` produces `about.html`; GitHub serves that at `/about.html` but a link/refresh to `/about` may 404 depending on Pages' extension-stripping behavior.

**How to avoid:**
- This site is fully static content — **prerender everything**: `export const prerender = true` in root `+layout.ts`, and enable `adapter-static` with all routes reachable via crawled links so every page emits HTML. Prefer directory output.
- Set `adapter-static({ fallback: '404.html' })` so GitHub serves the SPA fallback for any unprerendered/deep path (GitHub Pages automatically serves `404.html` on unknown paths). This rescues deep links even if a route was missed.
- Decide `trailingSlash` deliberately (`'always'` → `about/index.html`, most robust on Pages) and keep internal links consistent with it.
- Test: after deploy, hard-refresh every page and open each in a fresh tab.

**Warning signs:**
Client-side navigation fine; F5 on a subpage = 404. Only the home page survives a refresh. Works on `preview` (which has a smart server) but not on Pages.

**Phase to address:**
Foundation / deploy-scaffold phase — verified when the second and third routes are added.

---

### Pitfall 4: Three.js / Threlte touching `window`/`document` during SSR/prerender → build crash

**What goes wrong:**
`pnpm build` (prerender) or the dev SSR pass throws `ReferenceError: window is not defined`, `document is not defined`, or `self is not defined`. Three.js and many loaders/helpers reference browser globals at module-eval or component-init time, and adapter-static executes components in Node during prerender.

**Why it happens:**
Prerendering runs the component server-side to emit HTML. A `<canvas>`/WebGL context, `GLTFLoader`, `DRACOLoader`, `window.devicePixelRatio`, `ResizeObserver`, or a third-party Three addon evaluated top-level or in `$effect`-less setup will execute in Node where those globals don't exist. Threlte's `<Canvas>` is largely SSR-safe, but raw Three code, custom loaders, and `onMount`-adjacent logic frequently aren't.

**How to avoid:**
- Keep all WebGL/Three work inside Threlte's `<Canvas>` subtree and browser-only lifecycles. Run Three side-effects in `onMount`/`$effect` (client-only), never top-level module scope.
- Guard browser globals: `import { browser } from '$app/environment'; if (browser) { ... }`.
- Lazy-load the entire Premium/3D scene via dynamic `import()` inside `onMount` (also satisfies the "Accessible mode ships zero WebGL bytes" requirement — see Pitfall 9). Dynamically imported Three code never runs during prerender.
- If a component genuinely can't SSR, scope `export const ssr = false` narrowly — but prefer dynamic import so the *page* still prerenders for SEO/a11y.

**Warning signs:**
`pnpm build` fails with `X is not defined` naming a browser global; error stack points into `three`, a loader, or your scene component. Dev works (browser) but build dies.

**Phase to address:**
The first Premium-mode 3D phase — establish the "3D is dynamically imported, browser-only" pattern before any scene is written.

---

### Pitfall 5: Undisposed geometries/materials/textures/renderer → GPU memory leak on unmount & mode toggle

**What goes wrong:**
Toggling Premium→Accessible→Premium, or navigating between pages, steadily grows GPU/JS memory until the tab crashes or the WebGL context is lost ("Context Lost" / black canvas). Because the whole selling point here is a *persistent toggle*, users will flip modes repeatedly — the exact workload that surfaces leaks.

**Why it happens:**
Three.js does NOT garbage-collect GPU resources. Geometries, materials, textures, render targets, and the `WebGLRenderer` itself must be explicitly `.dispose()`d. Threlte auto-disposes objects created *declaratively* in its graph, but anything you create imperatively (custom `BufferGeometry`, textures from a loader, post-processing passes, extra renderers) leaks unless you dispose it. Each mode-toggle mount/unmount that isn't fully torn down compounds.

**How to avoid:**
- Prefer Threlte's declarative components and `<T>` so disposal is automatic; let `<Canvas>` unmount tear down the renderer.
- For imperative Three objects, dispose in the component's `onDestroy`/`$effect` cleanup: geometries, materials, every texture, render targets, and controls.
- Use Threlte's `useLoader`/`<GLTF>` caching so shared assets aren't re-created per toggle.
- Actually unmount the WebGL subtree in Accessible mode (`{#if premium}<Scene/>{/if}`) rather than hiding it with CSS — hidden canvases keep their context and memory.
- Profile: Chrome DevTools Memory + `renderer.info` (`geometries`, `textures`, `programs` counts should return to baseline after toggling back).

**Warning signs:**
`renderer.info.memory.geometries/textures` climbs and never drops after unmount. Memory graph is a staircase across toggles. "WebGL: CONTEXT_LOST_WEBGL" after several minutes of toggling. Mobile Safari reloads the tab.

**Phase to address:**
The 3D scene architecture phase (establish disposal/teardown discipline) and the mode-toggle phase (verify full teardown on switch).

---

### Pitfall 6: Render loop keeps running when tab hidden or in Accessible mode → wasted battery/CPU, jank

**What goes wrong:**
`requestAnimationFrame` / Threlte's `useTask` frame loop keeps spinning at 60fps when the browser tab is backgrounded, the canvas is scrolled off-screen, or the user is in Accessible mode with a stray still-mounted scene. Drains laptop/phone battery, spins fans, and on return-to-tab produces a huge delta-time jump that makes animations "teleport."

**Why it happens:**
Devs wire up an always-on loop and forget the lifecycle. Threlte runs its task scheduler continuously by default; nothing pauses it on `visibilitychange`. In a marketing site the 3D is often below the fold, so most of the loop runs invisibly.

**How to avoid:**
- Pause on `document.hidden`: listen for `visibilitychange` and stop/start the Threlte task scheduler (or set `<Canvas>` render mode). Prefer Threlte's on-demand rendering (`renderMode="on-demand"`, invalidate on change) instead of always-on for mostly-static hero scenes.
- Only render when the canvas is in-viewport (IntersectionObserver) — pause otherwise.
- Never mount the loop at all in Accessible mode.
- Clamp/reset delta time after regaining visibility to avoid teleport.

**Warning signs:**
Battery/fan noise on a "static-looking" page; CPU stays high with tab backgrounded; animation jumps forward after switching back to the tab; `useTask` callbacks logging while scrolled away.

**Phase to address:**
The Premium-mode render-loop / scene-lifecycle phase.

---

### Pitfall 7: Huge un-optimized GLTF / no Draco or KTX2 compression → multi-MB downloads, mobile GPU jank

**What goes wrong:**
Hero model is a 20–80 MB `.glb` straight from Blender/Sketchfab with 4K uncompressed PNG textures. First Premium paint takes many seconds on mobile, low-end GPUs stutter or crash, and the GitHub Pages CDN + repo bloats. Textures at 4K blow the mobile texture-memory budget → context loss.

**Why it happens:**
Artists export raw; no mesh/texture compression step in the pipeline. On a static host there's no server-side transcoding, so whatever's in the repo ships as-is.

**How to avoid:**
- Run every model through `gltf-transform` / `gltfpack` (meshopt) or Draco: dedupe, weld, quantize geometry, resize textures to the size actually displayed, convert to KTX2/Basis (GPU-compressed) or at least WebP.
- Set explicit texture size budgets (e.g. ≤1–2K for web), power-of-two where needed.
- Serve the Draco/meshopt decoder from your own `static/` (path-prefixed with `base`, per Pitfall 1) — don't rely on a CDN that may be blocked.
- Lazy-load models per-section (not one giant scene), show a lightweight poster/skeleton first.
- Budget: target the whole Premium hero payload at a few MB, not tens.

**Warning signs:**
`.glb` files in repo measured in tens of MB; Lighthouse "Avoid enormous network payloads"; several-second gap before hero appears; mobile devices show context-loss/black canvas on the heaviest section.

**Phase to address:**
Asset pipeline phase (define compression tooling) and each Premium content-section phase (enforce per-section budget).

---

### Pitfall 8: No WebGL context-loss handling / no no-WebGL fallback → black canvas, dead hero

**What goes wrong:**
On GPU driver reset, tab backgrounding on mobile, too many contexts, or a browser without WebGL, the Premium canvas goes black/blank with no recovery and no message. Because Premium is "nearly every section," a lost context can wipe the whole page's visual content.

**Why it happens:**
`webglcontextlost`/`webglcontextrestored` events aren't handled; there's no capability check before committing to Premium; the app assumes WebGL always exists and always stays.

**How to avoid:**
- Feature-detect WebGL before entering Premium; if unavailable, force Accessible mode (this dovetails with defaulting to Accessible — the accessible mode is the safety net, per the project's Core Value).
- Handle `webglcontextlost` (preventDefault) and `webglcontextrestored` (rebuild scene) on the canvas; or fall back to Accessible on unrecoverable loss.
- Cap simultaneous contexts — one `<Canvas>` reused across sections beats many canvases (browsers limit active WebGL contexts, ~8–16).
- Show a graceful message/still-image if 3D can't run.

**Warning signs:**
Black rectangles where scenes should be; console `WebGL context lost`; report of "site is blank" on older/locked-down machines; many `<canvas>` elements in the DOM.

**Phase to address:**
Premium-mode resilience phase; capability-detection wired into the mode-toggle default logic.

---

### Pitfall 9: "Accessible mode" still downloads/initializes WebGL → the whole premise fails

**What goes wrong:**
The requirement is that Accessible mode ships *zero WebGL bytes*. But because Three.js/Threlte and the scene components are statically imported at the top of shared files, the WebGL bundle is in the initial chunk — so Accessible-mode users (including AT users on low-end devices, the exact audience) still pay to download Three.js, and a hidden canvas may even initialize a context. This silently violates the site's Core Value and its own PROJECT constraint.

**Why it happens:**
`import Scene from './Scene.svelte'` at module top forces the 3D into the main bundle regardless of the toggle. `{#if}` gating the *render* doesn't gate the *download* — the code was already imported.

**How to avoid:**
- Dynamically import the entire 3D layer only when Premium is active: `{#await import('./PremiumScene.svelte') then M}<M.default/>{/await}` inside `{#if premium}`. This code-splits Three/Threlte into a separate chunk fetched only in Premium.
- Verify with a bundle analyzer AND a network capture in Accessible mode: `three`, `@threlte/*`, and `.glb`/`.ktx2` requests must be ZERO.
- Default to Accessible on `prefers-reduced-motion` and on no-WebGL, so the heavy chunk is opt-in.
- Add a build-time/CI assertion or a manual checklist item: "load in Accessible mode, confirm no three.js in Network tab."

**Warning signs:**
Bundle analyzer shows `three` in the main/entry chunk; Network tab in Accessible mode shows `three`/threlte chunks or model files loading; initial Accessible payload is suspiciously large (hundreds of KB of JS).

**Phase to address:**
Mode-toggle + code-splitting phase (architectural — decide this before building scenes); verified in an accessibility/perf audit phase.

---

### Pitfall 10: Focus lost & mode change not announced when toggling → screen-reader/keyboard users stranded

**What goes wrong:**
User activates the mode toggle; the entire section subtree is swapped (canvas ↔ static markup). Keyboard focus lands on `<body>` (or vanishes), the screen reader says nothing, and the user has no idea the page changed or where they are. For a disability-equity org this is a mission-level failure, not a nitpick.

**Why it happens:**
Swapping large `{#if}` blocks destroys the focused element. Nothing moves focus to a sensible landmark or announces the change via a live region. The toggle itself may be a `<div onClick>` instead of a real control with `aria-pressed`.

**How to avoid:**
- Make the toggle a real `<button>` with `aria-pressed` (or a labeled switch) reflecting current mode; operable by Enter/Space; visible focus ring.
- On toggle, move focus deliberately (e.g. to the main heading or a `tabindex="-1"` container) so keyboard context is preserved.
- Announce the switch via an `aria-live="polite"` region: "Accessible mode on" / "Premium 3D mode on."
- Persist choice to localStorage (already required) so it doesn't reset and re-strand the user on nav.
- Ensure the toggle is reachable near the top / in the skip-link path.

**Warning signs:**
After toggling, Tab starts from the page top; VoiceOver/NVDA is silent on switch; toggle isn't reachable by keyboard; `aria-pressed` never changes.

**Phase to address:**
Mode-toggle phase, with a screen-reader test in the accessibility-verification phase.

---

### Pitfall 11: Premium motion ignores `prefers-reduced-motion`; low contrast on brand blue/orange

**What goes wrong:**
Two distinct WCAG failures: (a) Even a user who lands in (or opts into) Premium gets vestibular-triggering camera moves, parallax, and auto-playing animation with no respect for `prefers-reduced-motion: reduce` (WCAG 2.3.3). (b) DID's brand blue/orange used as text-on-background fails the 4.5:1 (AA) contrast ratio — orange text on white and mid-blue on dark are classic failures.

**Why it happens:**
The project already defaults to Accessible when reduced-motion is set — but a user can still *manually* choose Premium, and devs then assume "Premium = motion is fine." Brand colors are chosen for logo impact, not text legibility; nobody runs a contrast checker on actual text pairings.

**How to avoid:**
- Even in Premium, honor `prefers-reduced-motion` by damping/stopping non-essential motion (or gate auto-motion behind an explicit "play"); pair with Pitfall 6's on-demand rendering.
- Build the palette as design tokens with pre-verified foreground/background pairings; run every text/UI pairing through a contrast checker (target AA 4.5:1 body / 3:1 large & UI; AAA 7:1 where feasible per the AAA-in-Accessible goal). Use brand blue/orange for large display/decoration, not small body text, unless the specific pairing passes.
- Never encode meaning by color alone (color-blind users) — pair with text/icon.

**Warning signs:**
`prefers-reduced-motion` set but Premium still animates; axe/Lighthouse flags "contrast"; orange `#f7941d`-ish on white measuring ~2:1; designers hand over palette with no contrast annotations.

**Phase to address:**
Design-tokens/palette phase (contrast) and Premium-motion phase (reduced-motion).

---

### Pitfall 12: `<canvas>` with no text alternative; 3D not keyboard-operable

**What goes wrong:**
Premium sections are pure `<canvas>` — to a screen reader that's an empty graphic with no name, and any 3D interaction (rotate/click hotspots) is mouse-only. Content conveyed *only* inside the WebGL scene is invisible to AT and unreachable by keyboard.

**Why it happens:**
Canvas is a bitmap with no DOM semantics. Devs treat the parallel Accessible mode as "the a11y story" and leave Premium's canvas unlabeled — but Premium users include AT users who chose it or were defaulted there before toggling.

**How to avoid:**
- The real mitigation is content parity (Pitfall 13): all *information* lives in real DOM present in both modes; the canvas is decorative. Give the canvas an accessible name/`role="img"` + `aria-label`, or `aria-hidden="true"` if it's purely decorative and the same content exists as text nearby.
- Any interactive 3D (hotspots, product spin) needs a keyboard-operable DOM equivalent (buttons/links) — don't put unique CTAs only in the scene.
- Provide visible focus and logical tab order for all controls layered over the canvas.

**Warning signs:**
Screen-reader reads "canvas" or nothing for a whole section; Tab skips the 3D section entirely; a CTA or piece of info exists only as a clickable mesh.

**Phase to address:**
Each Premium content-section phase; audited in accessibility-verification.

---

### Pitfall 13: Content-parity drift between Premium and Accessible modes

**What goes wrong:**
Over time the two modes diverge: a new testimonial, service, or CTA gets added to the flashy Premium scene but not the Accessible markup (or vice-versa). Accessible mode silently becomes the "degraded fallback" the project explicitly forbids — different copy, missing sections, stale contact info.

**Why it happens:**
Content is authored twice (once as 3D scene props, once as static markup) in separate files. Two sources of truth drift whenever someone edits only the mode they're looking at.

**How to avoid:**
- **Single source of truth for content**: keep copy, links, service lists, and CTAs in shared data modules (`.ts`/`.json`/`.md`), consumed by BOTH the Premium scene and the Accessible markup. The modes differ in *presentation*, never in *content*.
- Add a content-parity check to CI or a manual checklist: diff the rendered text of both modes per page.
- Treat Accessible mode as the canonical content view; Premium decorates it.

**Warning signs:**
A string appears in one mode only; editing a service requires touching two files; QA finds a CTA missing in Accessible mode; contact email differs between modes.

**Phase to address:**
Content-architecture phase (establish shared content modules before building either mode's UI); enforced every content phase.

---

### Pitfall 14: Threlte ↔ Three.js version mismatch (and Svelte 5 requirement)

**What goes wrong:**
Threlte 8 is built on **Svelte 5's runes reactivity**; using it with Svelte 4 (or mixing Threlte 7 APIs) breaks compilation or reactivity. Separately, `three` is a **peer dependency** — installing a `three` version outside Threlte's supported range causes runtime errors (missing/renamed exports, e.g. Three's frequent breaking changes to color management, `BufferGeometry`, examples/addons import paths) or silent visual bugs.

**Why it happens:**
`three` ships breaking changes almost every release and is pinned by the app, not Threlte. pnpm may hoist an unexpected `three`, or a copied tutorial pins an old/new version. Svelte 5 vs 4 is a hard boundary for Threlte 8.

**How to avoid:**
- Pin `svelte@5`, matching `@sveltejs/kit`, `@threlte/core` (v8+), `@threlte/extras`, and a `three` version within Threlte 8's documented peer range; check Threlte's package.json `peerDependencies` for `three`.
- Import addons from the version-matched path (`three/examples/jsm/...` vs `three/addons/...`) consistent with the installed `three`.
- Enable Three's modern color-management defaults deliberately and test after any `three` bump.
- Use pnpm overrides to force a single `three` version across the tree; run `pnpm why three` to catch duplicates.
- Lock versions; treat `three`/Threlte bumps as a deliberate, tested change, not a routine `update`.

**Warning signs:**
`does not provide an export named ...` from `three`; runes syntax errors; two copies of `three` in the lockfile; colors look washed-out/oversaturated after an update; `@threlte/extras` components error at mount.

**Phase to address:**
Foundation phase (lock the stack versions); revisited only via deliberate, tested upgrades.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Static `import` of 3D scenes (skip dynamic import) | Simpler code, less async plumbing | Three.js ships in Accessible-mode bundle → violates zero-WebGL Core Value | Never — this is the project's defining constraint |
| CSS-hide the canvas in Accessible mode instead of unmounting | One-line toggle | WebGL context + memory stay alive; render loop keeps running | Never (breaks battery, parity, and zero-WebGL) |
| Author content twice (scene + static markup) | Fast to prototype each mode | Guaranteed parity drift over time | Only throwaway spikes; real content must be shared |
| Ship raw Blender/Sketchfab `.glb` | No asset pipeline to build | Multi-MB downloads, mobile crashes, repo bloat | MVP placeholder only, flagged for compression before launch |
| Always-on render loop (no visibility/viewport gating) | Simplest loop | Battery drain, jank, delta-time jumps | Tiny always-visible hero only; otherwise gate it |
| `ssr = false` on a whole page to dodge SSR crashes | Instant fix for `window is not defined` | Loses prerendered HTML → worse SEO/a11y/first paint | Only if dynamic-import isolation is genuinely impossible |
| Hardcode `/asset.glb` paths | Works in dev | 404s on GitHub Pages subpath | Never — always prefix with `base` |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages (subpath) | Assuming root-domain paths; forgetting `.nojekyll` | Set `paths.base` to repo name; prefix runtime assets with `base`; ship `.nojekyll` (or use `deploy-pages` action) |
| GitHub Pages (routing) | No SPA/404 fallback → deep-link 404 | Prerender all routes + `fallback: '404.html'`; pick a `trailingSlash` and keep links consistent |
| Three.js loaders (Draco/KTX2/meshopt) | Decoder loaded from bare `/` path or external CDN | Self-host decoder in `static/`, reference via `base` |
| `three` peer dep | Letting pnpm hoist any `three`; blind `pnpm update` | Pin `three` in Threlte 8's supported range; `pnpm overrides`; test after bumps |
| GitHub Actions deploy | Building without `NODE_ENV=production`/base env; wrong publish dir | Build with base env set; publish `build/`; use official Pages action to skip Jekyll |
| localStorage (mode persistence) | Reading `localStorage` during SSR/prerender → crash | Read inside `browser`/`onMount`; default server render to Accessible, hydrate to stored choice |
| Social/contact links (mailto, FB/X/LinkedIn/IG) | Only present in one mode; opens same-tab | Put in shared content module; `rel="noopener"` on external `target="_blank"` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Undisposed GPU resources across mode toggles | `renderer.info` staircase; context lost | Dispose imperative geometries/materials/textures; unmount canvas | After N toggles / minutes (mobile first) |
| Always-on RAF loop off-screen/backgrounded | High CPU on static page; fan noise; delta jumps | On-demand render; pause on `visibilitychange`/IntersectionObserver | Immediately on any mostly-static section |
| Uncompressed multi-MB GLTF + 4K textures | Seconds-long first paint; mobile black canvas | gltf-transform/gltfpack; KTX2/WebP; per-section budget | Low-end mobile GPUs, slow networks |
| Many simultaneous WebGL contexts (one canvas per section) | Context-loss on later sections | Reuse a single `<Canvas>`; cap contexts | ~8–16 contexts (browser limit) |
| Three.js in Accessible-mode bundle | Large initial JS for AT/low-end users | Dynamic-import 3D behind `{#if premium}` | Every Accessible-mode load |
| Loading all scenes eagerly at page load | Long TTI even in Premium | Lazy-load models per section on scroll | Heavier multi-scene pages |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Committing plaintext creds/EIN/portal logins from the org's Notion source | Public repo exposure of org PII | Hard exclusion (already a PROJECT constraint); scan commits; no secrets in a static public repo by design |
| Personal address / private contact in content | Doxxing of founder | Only the public `emanrimawi@gmail.com` + public socials; review copy before commit |
| External links without `rel="noopener noreferrer"` | Reverse-tabnabbing on social/out-links | Add `rel` to all `target="_blank"` links |
| Loading Draco/model decoders from third-party CDN | Supply-chain / availability / CSP issues | Self-host decoders and assets in-repo |
| Overclaiming donation/tax-deductible (501c3 pending) | Legal/trust risk (not strictly security) | No "tax-deductible donation" language; link-out only if any |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Accessible mode feels like a downgrade | Disabled users get a lesser experience — mission failure | Design Accessible mode as a first-class peer; content parity; polished 2D |
| Mode toggle hidden or hard to find | Users stuck in wrong mode | Prominent, persistent toggle near top / in nav; clearly labeled |
| No indication which mode is active | Confusion; repeated toggling | Clear `aria-pressed` + visible state label; persist to localStorage |
| Long blank/loading gap before hero 3D | Bounce before content loads | Poster image/skeleton first; progressive load; instant text content |
| Motion sickness in Premium | Vestibular users harmed | Respect reduced-motion even in Premium; damp camera moves |
| Focus/scroll position lost on toggle | Keyboard/AT users disoriented | Move focus deliberately; announce via live region; preserve scroll |

## "Looks Done But Isn't" Checklist

- [ ] **GitHub Pages deploy:** Often missing `.nojekyll` and correct `paths.base` — verify `_app/` assets + models load on the *live github.io subpath*, not just localhost.
- [ ] **Deep links:** Often missing 404 fallback — verify hard-refresh on every route (not just home) doesn't 404.
- [ ] **Accessible mode zero-WebGL:** Often still ships `three` — verify Network tab shows no three.js/threlte/`.glb` requests in Accessible mode.
- [ ] **Prerender/SSR:** Often crashes on `window` — verify `pnpm build` completes and pages emit real HTML (view-source shows content).
- [ ] **GPU disposal:** Often leaks — verify `renderer.info` returns to baseline after Premium→Accessible→Premium toggling.
- [ ] **Render loop:** Often always-on — verify CPU drops when tab is hidden / canvas scrolled off.
- [ ] **Toggle a11y:** Often silent — verify screen reader announces mode change and focus is preserved.
- [ ] **Contrast:** Often fails — verify every brand blue/orange text pairing passes AA (4.5:1) with a checker, not by eye.
- [ ] **Reduced-motion:** Often ignored in Premium — verify motion damps when `prefers-reduced-motion: reduce`.
- [ ] **Content parity:** Often drifts — verify same copy/CTAs/contact in both modes, ideally from one shared source.
- [ ] **Canvas alt:** Often unlabeled — verify canvas is `aria-hidden` (decorative) or named, with content in real DOM.
- [ ] **Version lock:** Often mismatched — verify single `three` version (`pnpm why three`) in Threlte 8's range, Svelte 5.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Missing `.nojekyll` / wrong base (blank live site) | LOW | Add `static/.nojekyll`, set `paths.base`, prefix asset URLs with `base`, redeploy |
| Deep-link 404s | LOW | Enable prerender + `fallback: '404.html'`, align `trailingSlash`, redeploy |
| SSR `window is not defined` | LOW–MEDIUM | Wrap 3D in dynamic `import()` within `onMount`/`{#if browser}`; narrow `ssr=false` last resort |
| Three.js shipping in Accessible bundle | MEDIUM | Refactor to dynamic-import the 3D layer behind `{#if premium}`; re-verify bundle |
| GPU memory leaks | MEDIUM | Add disposal in cleanup for all imperative resources; unmount canvas on toggle; profile |
| Content parity drift | MEDIUM–HIGH | Extract content to shared modules; refactor both modes to consume them (costlier the later it's done) |
| `three`/Threlte version break | LOW–MEDIUM | Pin to compatible set, `pnpm overrides`, fix addon import paths, retest visuals |
| Contrast failures | LOW | Adjust tokens to passing pairings; re-run axe/Lighthouse |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| `paths.base` / asset 404 (P1) | Foundation / deploy-scaffold | Live github.io subpath loads all assets + a test model |
| Missing `.nojekyll` (P2) | Foundation / deploy-scaffold | `build/.nojekyll` exists; `_app/` serves live |
| Deep-link 404 (P3) | Foundation / deploy-scaffold | Hard-refresh every route on live site |
| SSR/prerender crash (P4) | First Premium-3D phase | `pnpm build` green; pages emit HTML |
| GPU disposal leaks (P5) | 3D architecture + mode-toggle | `renderer.info` baseline after toggle cycles |
| Render loop not pausing (P6) | Render-loop / scene-lifecycle | CPU drops when hidden/off-screen |
| Un-optimized GLTF (P7) | Asset pipeline + each Premium section | Payload budget met; mobile stable |
| WebGL context loss (P8) | Premium resilience + toggle default | Context-loss handled; no-WebGL → Accessible |
| Accessible mode ships WebGL (P9) | Mode-toggle + code-splitting | Zero three.js in Accessible Network tab |
| Focus/announce on toggle (P10) | Mode-toggle | Screen-reader announces; focus preserved |
| Reduced-motion + contrast (P11) | Design tokens + Premium motion | axe/Lighthouse pass; motion damps |
| Canvas alt / keyboard 3D (P12) | Each Premium section | SR names/hides canvas; keyboard equivalents exist |
| Content parity drift (P13) | Content architecture (early) | Both modes render identical content from shared source |
| Threlte↔three mismatch (P14) | Foundation (version lock) | Single `three`; build + visuals correct |

## Sources

- SvelteKit adapter-static docs — prerender, `fallback`, static site generation (svelte.dev/docs/kit/adapter-static) — HIGH
- sveltejs/kit issues #4528 (paths.base 404 on Pages) and #10358 (subfolder absolute-path chunks) — HIGH
- GitHub community discussion #52062 (SvelteKit CSS/JS 404 on Pages) and Okupter GitHub-Pages-deploy guide (`.nojekyll`, 404.html) — MEDIUM/HIGH
- Threlte 8 release notes / migration guide — Svelte 5 runes adoption, API alignment (threlte.xyz, HN #42813264, DeepWiki migration guides) — MEDIUM
- `three` peer-dependency + frequent breaking-change practice; Three.js manual "How to dispose of objects" (GPU resource disposal) — HIGH
- WCAG 2.2 — 1.4.3 Contrast, 2.3.3 Animation from Interactions, 2.1.1 Keyboard, 4.1.2 Name/Role/Value; scope.org.uk accessibility model (per PROJECT) — HIGH
- Project constraints: PROJECT.md (zero-WebGL Accessible mode, paths.base + `.nojekyll`, code-split, no secrets) — HIGH

---
*Pitfalls research for: SvelteKit + Threlte dual-mode 3D marketing site on GitHub Pages*
*Researched: 2026-07-04*
