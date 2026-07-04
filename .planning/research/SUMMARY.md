# Project Research Summary

**Project:** Diversity Includes Disability — Premium Website (v2)
**Domain:** Premium, accessibility-first, static-hosted 3D marketing site (SvelteKit + Threlte → GitHub Pages) with a persistent Premium-WebGL ⇄ Accessible-no-WebGL mode toggle
**Researched:** 2026-07-04
**Confidence:** HIGH

## Executive Summary

This is a dual-mode marketing site for a disability-equity consulting practice (Eman Rimawi / DID): a full-3D "Premium" WebGL experience and a genuinely first-class, zero-WebGL "Accessible" peer, switchable by a persistent in-page toggle, deployed as a fully static build to GitHub Pages. Experts build this class of site as a **prerendered accessible baseline plus a client-only progressive enhancement**: `adapter-static` prerenders semantic, WebGL-free HTML for every route (this IS the Accessible mode), and after hydration — only if the resolved mode is `premium` and WebGL is available — the client executes a single dynamic `import()` that pulls in the entire Three.js/Threlte layer. The zero-WebGL promise is therefore a *structural property of the module graph*, not a runtime hope: the WebGL payload physically cannot enter the accessible bundle because it lives behind a code-split firewall in `lib/premium/`.

The recommended stack is pinned and non-negotiable in its load-bearing details: **Threlte v8** (Svelte-5/runes-native — never v7), **`three@0.175.0` EXACT** (no caret — `three` has no semver and every 0.x minor can break Threlte and its transitive `three-mesh-bvh`/`camera-controls`), `@types/three` matched to the same minor, **`@sveltejs/adapter-static@3.0.10`** with `prerender = true`, correct `paths.base`, `trailingSlash: 'always'`, and a `static/.nojekyll` file. Testing is a hard requirement, not optional: Vitest (browser provider for WebGL-mounting components) + Playwright + `@axe-core/playwright` running WCAG 2.2 AA against **both** modes, plus a Playwright assertion that Accessible mode ships zero `three` bytes. For a disability-equity brand, accessibility features that are normally "differentiators" are **table stakes** — an inaccessible disability site is self-refuting — and the accessible experience must be a designed peer, not a stripped fallback.

The dominant risks cluster in two buckets. First, **GitHub Pages static deployment** — the "works locally, 404s live" failure family: wrong/hardcoded `paths.base`, missing `.nojekyll` (Jekyll strips `_app/`), and deep-link 404s from trailingSlash/fallback mismatch. These are cheap to prevent and must be locked in phase one with a live-subpath smoke test. Second, **WebGL lifecycle and parity** — because the whole product is a *persistent toggle*, users flip modes repeatedly, which is precisely the workload that surfaces GPU disposal leaks, always-on render loops, and content-parity drift. Mitigation is architectural and front-loaded: a single shared `<Canvas>` (avoids the ~8–16 context cap), typed single-source-of-truth content modules in `lib/content/*.ts` that both renderers consume (parity is free, not hand-maintained), on-demand rendering, and a no-flash `app.html` hydration script. The mission-critical a11y detail is the toggle itself: real `<button>`/switch semantics with `aria-pressed`, deliberate focus movement, and an `aria-live` announcement so screen-reader users are never stranded.

## Key Findings

### Recommended Stack

Full detail in `.planning/research/STACK.md` (confidence HIGH; the exact `three` pin is a flagged MEDIUM judgment call). The stack mirrors Threlte v8's dev-tested baseline (`three@0.175.0` / `svelte@5.53` / `vite@7.1` / `vitest@4.1`). The single most important discipline is that `three` is exact-pinned and treated as a deliberate, tested bump — never a routine `pnpm update` — because it has no semver stability and `@threlte/extras` transitively caps how far it can safely move.

**Core technologies:**
- **SvelteKit 2.69 + Svelte 5.56 (runes)** — app framework/router/SSG; runes (`$state`/`$derived`/`$effect`) drive the mode store and reactive scenes; required by Threlte v8
- **`@threlte/core@8.5.16` + `@threlte/extras@9.21.0`** — declarative Svelte-native Three.js; SSR-safe `<Canvas>`, `useGltf`/`useDraco`/controls — far less boilerplate than raw three
- **`three@0.175.0` (EXACT, no caret) + `@types/three@0.175.x`** — WebGL engine; exact-pinned to avoid the no-semver breakage that is this stack's #1 failure point
- **`@sveltejs/adapter-static@3.0.10`** — the only adapter producing the fully static output Pages needs; with `paths.base` + `trailingSlash: 'always'` + `static/.nojekyll`
- **Vite 7** — Threlte v8's dev-tested bundler pairing (Vite 8 is *allowed* by SvelteKit but unproven with Threlte — stay on 7)
- **Vitest 4 + Playwright 1.61 + `@axe-core/playwright` 4.12** — component/E2E/a11y; WCAG 2.2 AA on both modes; the zero-WebGL regression gate
- **`gltf-transform`/`gltfpack` (dev CLI) + self-hosted Draco decoder** — build-time GLB compression; decoder copied into `static/draco/` (never CDN), referenced via `base`

### Expected Features

Full detail in `.planning/research/FEATURES.md` (confidence HIGH). The differentiator is not "we are accessible" (table stakes here) but **"our accessible experience is a first-class peer to a genuinely premium 3D one,"** with the toggle itself functioning as a visible mission statement.

**Must have (table stakes):**
- Persistent Premium⇄Accessible toggle: localStorage-persisted, `prefers-reduced-motion`→Accessible default (precedence: stored choice > OS reduced-motion > Premium), `aria-live` announcement, switch semantics, no-flash hydration
- Per-mode code-splitting so Accessible ships **zero WebGL bytes** — the non-negotiable perf/a11y guarantee
- Content parity across modes from a single source; contrast-checked DID blue/orange design tokens (AA floor)
- Home (hero/mission/services/CTA), Services detail (4 pillars), About Eman Rimawi, Contact (`mailto:` + FB/X/LinkedIn/IG) — in both modes
- Accessibility Statement in primary nav (scope.org.uk model, honest known-issues), skip links, semantic headings, keyboard-first nav, visible focus, descriptive links, `aria-expanded` disclosure menus that close on Escape/blur
- Responsive both modes; SEO basics + OG image + favicon; static deploy under repo base path + `.nojekyll`; WebGL-unsupported → graceful Accessible fallback

**Should have (competitive):**
- Full-3D Premium across most sections (not accent-only) — maximum visual impact
- Reduced-motion-aware Premium mode (vestibular-safe even for users who stay in Premium)
- Testimonials/social proof and speaking/press highlights — **content-dependent, do not fabricate**

**Defer (v2+):**
- Blog/news feed (recurring content burden; not in current site)
- Outbound donation link (Zeffy/PayPal) — **blocked on 501(c)(3) pending; no "tax-deductible/donate" language**
- Static contact form (Formspree-style); multi-language — no current demand
- **Anti-features to reject:** auth/login, CMS/backend, in-site payments, two separately deployed sites, "WebGL accessible mode," auto-play carousels/audio, cookie-heavy tracking, and any credentials/EIN/PII in the repo (hard security exclusion)

### Architecture Approach

Full detail in `.planning/research/ARCHITECTURE.md` (confidence HIGH on patterns, MEDIUM on exact pins). The spine: **Accessible mode is the prerendered baseline; Premium is a client-only enhancement layered on top via exactly one dynamic import.** Data flows one direction, read-only, from typed content modules into both renderers, so parity is structural. The dependency direction is: content → (accessible baseline ∥ mode state) → premium enhancement → polish — and **nothing in the shell/sections may import from `lib/premium/`**, enforced by a lint/review rule.

**Major components:**
1. **`lib/content/*.ts` (single source of truth)** — typed, mode-agnostic copy/services/bio/contact/nav/SEO; both modes import it so a content edit updates both atomically
2. **Mode state (`mode.svelte.ts` + `reducedMotion` + `webgl` probes)** — the only mutable state; layered default resolution (stored > reduced-motion > premium); mutated only via `setMode`/`toggleMode`; localStorage side-effect; `app.html` inline no-flash script sets `html[data-mode]` pre-hydration
3. **Shell (`+layout.svelte`)** — skip links, nav, `<ModeToggle>`, footer, `<slot/>`; prerendered, semantic, zero WebGL imports
4. **Section layer** — per-section Accessible components always render (the baseline); a `<Section>` wrapper registers a scene id when premium
5. **Premium layer (`lib/premium/`)** — the code-split firewall; entered by one `{#await import('PremiumStage')}` gated on `premium && webglSupported`; a **single global `<Canvas>`** hosting all per-section scenes (shared renderer/camera; avoids the ~8–16 WebGL-context cap)

### Critical Pitfalls

Top items from `.planning/research/PITFALLS.md` (14 pitfalls total, confidence HIGH; each mapped to an owning phase there).

1. **`paths.base` wrong / hardcoded absolute asset URLs (P1)** — total asset 404 on the live github.io subpath while dev/preview look perfect. Set `paths.base` from repo name; prefix **every** runtime asset URL (models, draco path, textures) with `base`; add a live-subpath smoke test. *Foundation phase.*
2. **Missing `.nojekyll` (P2)** — Jekyll strips `_app/`; live site loads unstyled with no JS. Ship `static/.nojekyll` (or use the official `deploy-pages` action which bypasses Jekyll); verify `build/.nojekyll` exists. *Foundation phase.*
3. **Accessible mode still ships WebGL (P9)** — static top-level import of any premium/`three` module hoists Three.js into the shared chunk, silently breaking the Core Value. Dynamic-`import()` the entire 3D layer behind `{#if premium}`; add a CI/Playwright network assertion that Accessible mode requests zero `three`/threlte/`.glb`. *Mode-toggle + code-splitting phase.*
4. **Undisposed GPU resources + always-on render loop across toggles (P5/P6)** — the persistent toggle is the exact workload that surfaces leaks; memory staircases to context-loss. Prefer Threlte declarative disposal, dispose imperative resources in cleanup, actually **unmount** (not CSS-hide) the canvas in Accessible mode, use on-demand `renderMode` + pause on `visibilitychange`/off-screen. *3D architecture + render-loop phases.*
5. **Focus lost & mode change unannounced on toggle (P10)** — swapping the subtree strands SR/keyboard users; mission-level failure. Real `<button>` with `aria-pressed`, deliberate focus move to main heading, `aria-live="polite"` announcement. *Mode-toggle phase.*
6. **Threlte↔three version mismatch (P14) + SSR `window is not defined` (P4)** — pin the tested set, `pnpm why three` to catch duplicates; keep all WebGL in browser-only lifecycles behind dynamic import so prerender never evaluates it. Plus **content-parity drift (P13)** and **reduced-motion/contrast (P11)** — solved by the shared content modules and contrast-checked tokens respectively.

## Implications for Roadmap

The research yields an unusually explicit build order because the architecture deliberately ships a **complete, accessible, deployable site before any WebGL exists** — satisfying and de-risking the non-negotiable Core Value first, then layering Premium as pure enhancement that can never regress the peer.

### Phase 1: Foundation, Tokens & Live Deploy
**Rationale:** Prerequisite for everything, and it front-loads the entire GitHub-Pages failure family (P1/P2/P3) plus the version lock (P14) — cheapest bugs to prevent, most expensive to discover late. Proving a green live-subpath deploy early is the single highest-leverage risk reduction.
**Delivers:** Scaffolded SvelteKit app on the pinned stack; `adapter-static` + `paths.base` + `trailingSlash: 'always'` + `static/.nojekyll`; contrast-checked DID blue/orange tokens (`tokens.css`); shell (`+layout`, skip links, nav, footer); accessibility-statement route stub; a green deploy to `wolfwdavid.github.io/diversityincludesdisability_two/` with a live-subpath smoke test.
**Addresses (FEATURES):** design tokens, semantic layout/landmarks, skip links, static deploy, SEO basics.
**Avoids (PITFALLS):** P1 (base/asset 404), P2 (`.nojekyll`), P3 (deep-link 404), P11 (contrast tokens), P14 (version lock).

### Phase 2: Content Source of Truth
**Rationale:** Must exist before either renderer — both consume it, and this is the structural guarantee against parity drift (P13). Small but foundational; every later phase depends on it.
**Delivers:** `lib/content/types.ts` + `nav.ts`/`services.ts`/`bio.ts`/`contact.ts`/`seo.ts`, typed and mode-agnostic, populated from the current Wix site content.
**Uses (STACK):** TypeScript 5.9 typed interfaces.
**Implements (ARCH):** the content layer / parity contract.
**Avoids (PITFALLS):** P13 (content-parity drift).

### Phase 3: Mode State System & Toggle
**Rationale:** Sections branch on mode, so the mode store + toggle are foundational and must land before section work (retrofitting is costly). The toggle can flip a mode with no premium layer present yet. This phase also owns the hardest a11y detail (P10).
**Delivers:** `mode.svelte.ts` (layered resolution + localStorage), `reducedMotion`/`webgl` probes, `app.html` no-flash script, `<ModeToggle>` with `aria-pressed`/switch semantics + `aria-live` announcement + deliberate focus handling.
**Uses (STACK):** Svelte 5 runes, `$app/environment` browser guards.
**Implements (ARCH):** state layer + Pattern 1 (no-flash hydration).
**Avoids (PITFALLS):** P10 (focus/announce), localStorage-during-SSR crash.

### Phase 4: Accessible Section Components (baseline complete site)
**Rationale:** At this milestone the **entire site is live, accessible (WCAG 2.2 AA), and deployable** — the Core Value is met with zero WebGL in existence. Deliberately ordered before Premium so the peer can never be an afterthought.
**Delivers:** Full-parity semantic components for Home, Services (4 pillars), About, Contact, Accessibility Statement, in both nav and content; keyboard nav, visible focus, `aria-expanded` menus (close on Escape/blur), responsive layout, OG image/favicon.
**Addresses (FEATURES):** all P1 table-stakes pages and the a11y floor.
**Avoids (PITFALLS):** the scope.org.uk disclosure-menu bug; contrast failures on real text pairings.

### Phase 5: Premium 3D Layer
**Rationale:** Pure enhancement, depends on content (2), mode/webgl gate (3), and the accessible DOM as scroll skeleton (4). Can be built section-by-section without ever regressing the accessible peer. This phase establishes the code-split firewall and the disposal/lifecycle discipline that the persistent toggle stresses.
**Delivers:** `lib/premium/` firewall, single global `<Canvas>` in `PremiumStage`, `PremiumMount` gate (dynamic import behind `premium && webgl`), per-section scenes, asset pipeline (gltf-transform + self-hosted Draco), on-demand render loop, GPU disposal, WebGL context-loss handling + graceful fallback.
**Uses (STACK):** Threlte v8, `three@0.175.0`, `@threlte/extras`, gltf-transform/gltfpack.
**Implements (ARCH):** Pattern 2 (single dynamic import) + Pattern 3 (progressive enhancement).
**Avoids (PITFALLS):** P4 (SSR crash), P5 (disposal), P6 (render loop), P7 (un-optimized GLTF), P8 (context loss), P9 (zero-WebGL), P12 (canvas alt / keyboard 3D).

### Phase 6: Verification & Polish
**Rationale:** The "looks done but isn't" checklist is long and mostly invisible on localhost; a dedicated audit phase turns each Core-Value promise into a verified gate.
**Delivers:** axe/Lighthouse pass on both modes; Playwright zero-WebGL network assertion; screen-reader + keyboard pass across both modes; `renderer.info` baseline-after-toggle check; reduced-motion-in-Premium damping; per-section payload budgets; deep-link hard-refresh on live site.
**Avoids (PITFALLS):** re-verifies P5/P6/P9/P10/P11/P12/P13 as regression gates.

### Phase Ordering Rationale

- **Dependency direction discovered:** content → (accessible baseline ∥ mode state) → premium enhancement → polish. Nothing in phases 1–4 may import from `lib/premium/`.
- **Core Value first:** a fully accessible, deployable site exists at end of Phase 4, before any WebGL — the mission-critical promise is satisfied and de-risked before the risky 3D work begins.
- **Risk front-loading:** the cheapest-to-prevent / most-expensive-to-discover pitfalls (Pages deploy family, version lock) are locked in Phase 1 with a live smoke test; the persistent-toggle stress workload (disposal/parity) is addressed architecturally, not patched later.

### Research Flags

Phases likely needing deeper research (`/gsd:research-phase`) during planning:
- **Phase 5 (Premium 3D):** highest technical risk — specific scene composition, scroll/camera rig on a single shared Canvas, GLTF asset sourcing/optimization, on-demand render invalidation, and context-loss recovery all warrant per-scene research. Also gated on real 3D asset availability (see gaps).
- **Phase 1 (deploy method):** brief research to decide official Pages action vs `gh-pages` branch (see gaps) and confirm the `paths.base`/env-var wiring for preview-vs-prod parity.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Content):** trivial typed-data modules; no research needed.
- **Phase 3 (Mode state):** well-documented "theme toggle without FOUC" pattern applied to a render mode; STACK/ARCH already give working code.
- **Phase 4 (Accessible components):** established scope.org.uk-modeled a11y patterns; ARCHITECTURE + FEATURES already specify them. Use the `ui-ux-pro-max` skill for palette/type/layout rather than external research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against the npm registry on 2026-07-04; the single judgment call — exact `three@0.175.0` pin vs latest 0.185 — is flagged MEDIUM but the *mechanism* (exact-pin, no semver) is HIGH |
| Features | HIGH | scope.org.uk a11y model verified directly; consultant-site patterns MEDIUM (WebSearch, corroborated across sources); toggle/a11y best practices verified against MDN |
| Architecture | HIGH | Core SvelteKit/Svelte 5/Threlte patterns verified against official docs + release notes; MEDIUM only on exact pinned version numbers |
| Pitfalls | HIGH | Stack-specific failure modes verified against adapter-static docs, sveltejs/kit issues #4528/#10358, Threlte 8/Svelte 5 migration notes, and Three.js disposal guidance |

**Overall confidence:** HIGH

### Gaps to Address

These are open questions requiring the user's input or a deliberate decision during planning — they do not block roadmap creation but should be surfaced early:

- **Real testimonials / client logos / press highlights:** content-dependent P2 features. Do NOT fabricate. Flag as needs-content; deferred to v1.x, triggered when Eman supplies real attributable quotes/engagements.
- **3D asset sourcing:** Phase 5 needs actual optimized GLB models/scenes. No assets exist yet; MVP may use placeholder geometry flagged for compression before launch. Handle in Phase 5 planning.
- **Legacy Wix redirects:** preserving/redirecting indexed diversityincludesdisability.org URLs is P2, triggered only if old-site analytics show valuable inbound links. Needs the user to confirm whether analytics/URL inventory is available.
- **Booking/contact model:** v1 decision is `mailto:emanrimawi@gmail.com` + socials (no backend). Confirm whether a scheduler (Calendly-style link-out) is wanted before build — mailto is the assumed default.
- **Deploy method:** official Pages action (`upload-pages-artifact` + `deploy-pages`, bypasses Jekyll — recommended) vs `gh-pages` branch (needs committed `.nojekyll`). Decide in Phase 1; the official action is the lower-risk default.
- **`three` version policy post-launch:** stay exact-pinned at 0.175.0; any bump to 0.180+ is a deliberate, E2E-gated change only after confirming `three-mesh-bvh@0.9.x`/`camera-controls@3.x` still resolve. Document as a maintenance rule.

## Sources

### Primary (HIGH confidence)
- npm registry (2026-07-04) — `@threlte/core@8.5.16`, `@threlte/extras@9.21.0`, `three`/`@types/three`, `@sveltejs/kit@2.69.1`, `@sveltejs/adapter-static@3.0.10`, `svelte@5.56.4`, `vite`, `vitest@4.1.9`, `@playwright/test@1.61.1`, `@axe-core/playwright@4.12.1` — version pins + peer ranges
- SvelteKit docs — adapter-static / static site generation: `paths.base`, `trailingSlash`, `.nojekyll`, prerender, `fallback`
- sveltejs/kit issues #4528 (paths.base 404 on Pages) and #10358 (subfolder absolute-path chunks)
- Threlte docs + GitHub — package set, single-Canvas guidance, `useGltf`/`useDraco`, Svelte 5 support, `ssr.noExternal: ['three']`
- Three.js manual "How to dispose of objects" — GPU resource disposal
- scope.org.uk accessibility page — skip links, `aria-expanded` disclosure menus, WCAG 2.2 AAA aim, honest known-issues model
- MDN — `prefers-reduced-motion`, forced-colors, ARIA live regions; WCAG 2.2 (1.4.3, 2.3.3, 2.1.1, 4.1.2)
- `.planning/PROJECT.md` — scope, constraints, Core Value

### Secondary (MEDIUM confidence)
- Threlte 8 release/migration notes (threlte.xyz, HN #42813264, DeepWiki) — Svelte 5 runes adoption
- Consultant/coach marketing-site guides (nanoglobals, elementor, luisazhou) — premium positioning patterns, corroborated across sources
- Geoff Rich / Alvin Bryan — prefers-reduced-motion store in SvelteKit; OpenReplay / flaming.codes — dynamic import mechanics
- Three.js + SvelteKit integration guide (2026) — SSR externalization notes
- GitHub community discussion #52062 + Okupter Pages-deploy guide — `.nojekyll` / 404.html

### Tertiary (LOW confidence)
- Exact `three@0.175.0` pin as the ideal target (vs latest 0.185) — an inference from Threlte's dev-tested baseline; validate by keeping the E2E suite green on any deliberate bump

---
*Research completed: 2026-07-04*
*Ready for roadmap: yes*
