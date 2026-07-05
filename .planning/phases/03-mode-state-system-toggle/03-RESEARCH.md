# Phase 3: Mode State System & Toggle - Research

**Researched:** 2026-07-04
**Domain:** Client-side mode/theme state in a prerendered (adapter-static) SvelteKit + Svelte 5 app; no-flash (FOUC-free) resolution, localStorage persistence, WebGL capability detection, accessible switch UI
**Confidence:** HIGH (stack, no-flash mechanism, ARIA switch semantics, test topology all verified against the repo and current W3C/Svelte docs)

## Summary

This phase builds the mode-state substrate that **gates every later 3D task**. There is no 3D yet, and there must not be: the deliverable is a persistent, accessible Premium ⇄ Accessible toggle that (a) resolves the correct mode **before first paint** using a tiny synchronous inline `<head>` script, (b) mirrors that DOM state into a Svelte 5 runes store without hydration mismatch, (c) writes the user's choice through to `localStorage`, and (d) exposes a keyboard-operable, screen-reader-announced switch. Because the site is prerendered as static HTML with **no SSR request context**, the mode cannot be decided on the server — it must be decided in the browser, synchronously, at head-parse time, before the body renders. This is the same well-established technique dark-mode theme toggles use, adapted here for a Premium/Accessible axis plus a WebGL-capability signal.

The load-bearing risks are three: **(1) FOUC** — if mode is resolved in a component `onMount`/`$effect` instead of an inline head script, capable users flash the wrong mode; **(2) hydration mismatch** — the prerendered HTML is mode-agnostic while the client store is mode-aware, so any mode-reactive attribute (the toggle's `aria-checked`) can diverge on hydrate; **(3) localStorage origin collision** — `wolfwdavid.github.io` hosts *many* project subpaths that all share one origin's `localStorage`, so an un-namespaced key like `mode` would leak across unrelated sites. All three have concrete mitigations below.

**Primary recommendation:** Ship a pure, unit-tested `resolveMode()` function as the single source of precedence truth (`stored > reduced-motion > no-WebGL > premium-default`); mirror its logic in a minimal inline `<head>` script that stamps `data-mode` on `<html>` before paint; seed a Svelte 5 `.svelte.ts` runes store from that already-stamped attribute (client-only) and write through to a **namespaced** localStorage key on every user toggle; render the control as a native `<button role="switch" aria-checked>` with a visually-hidden `aria-live="polite"` announce region, keeping focus on the button and never navigating (so scroll is inherently preserved).

## Standard Stack

Everything needed is **already installed** — this phase adds no runtime dependencies. Verified from `package.json`.

### Core (already present)
| Library | Version (locked) | Purpose | Why Standard |
|---------|------------------|---------|--------------|
| Svelte | `^5.56.1` (runes) | Reactive store via `$state` in `.svelte.ts` | Runes work in `.svelte.ts`/`.svelte.js` modules for cross-app shared state — the idiomatic Svelte 5 replacement for writable stores |
| SvelteKit | `^2.63.0` | Router, `$app/environment` `browser` guard, `$app/paths` `base` | `browser` guard prevents SSR/prerender from touching `localStorage`/`window` |
| `@sveltejs/adapter-static` | `3.0.10` | Prerender to static HTML | Confirms there is **no SSR request** — mode must resolve client-side |
| Vitest | `^4.1.8` | Unit + component tests | Two-project split already configured (see Validation Architecture) |
| `vitest-browser-svelte` | `^2.1.1` | Mount + assert Svelte components in real Chromium | Needed for the toggle's DOM/ARIA/keyboard assertions |
| `@playwright/test` | `^1.60.0` | E2E: persistence-across-reload, no-flash smoke | Real browser reload is the only faithful FOUC/persistence check |

**No new packages.** Do **not** reach for `svelte-persisted-store`, `mode-watcher`, `@sveltejs/kit`'s hooks, or a theme library — the requirement is small, must run at head-time (before any bundle loads), and hand-rolling the ~15-line resolver is correct here (the inline script *cannot* import an npm module anyway). See Don't Hand-Roll for what genuinely should not be hand-rolled.

**Version verification:** All versions above are read directly from the repo's `package.json` (locked by Phase 1). No registry lookups needed — this phase installs nothing.

## User Constraints

No `CONTEXT.md` exists for this phase (checked `.planning/phases/03-mode-state-system-toggle/` — only this research file). The binding constraints therefore come from PROJECT.md / STATE.md decisions, treated as locked:

### Locked Decisions (from PROJECT.md + STATE.md)
- **Accessible mode is the prerendered baseline; Premium is a client-only enhancement behind one dynamic import.** Nothing in phases 1–4 may import from `lib/premium/` (enforced by ESLint `no-restricted-imports`). This phase writes **zero** Three/Threlte/WebGL-rendering code — only a cheap capability *probe*.
- **Default to Accessible when `prefers-reduced-motion: reduce` is set** (Key Decisions table, PROJECT.md) — ethical OS-intent default.
- **Accessible mode = true zero-WebGL peer** — the toggle must never load WebGL bytes when Accessible.
- **`paths.base`** is `process.env.BASE_PATH ?? ''`; `trailingSlash: 'always'`; `prerender = true` (global). Do not break these.
- **pnpm** is the package manager (STATE.md, `packageManager: pnpm@11.6.0`). Use `pnpm`, not `npm`, for all commands.
- **Content parity:** the toggle and any labels must source strings from the `$lib/content` barrel where user-facing (e.g. an accessible label), not hard-code duplicated copy.

### Open Decision the planner MUST lock (see Open Questions #1)
- **What is the default for a fully-capable, no-preference, first-time visitor?** The success criteria only pin the *Accessible* triggers (reduced-motion, no-WebGL, or a stored Accessible choice). They are silent on whether an unconstrained first visit lands on Premium or Accessible. This is a values decision for an accessibility-equity org and is not settled by the requirements text. Recommendation below; planner/user should confirm.

### Deferred Ideas (OUT OF SCOPE for Phase 3)
- Any Three.js/Threlte scene, Canvas, GLB, or `lib/premium/` code (Phase 5).
- The authoritative "WebGL actually failed to create a renderer" fallback (Phase 5 PREM-*) — Phase 3 only does the cheap head-time *probe*.
- axe/Lighthouse gates and the network-level zero-WebGL assertion (Phase 6 QA-*).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MODE-01 | Persistent header toggle switches whole site Premium ⇄ Accessible | `data-mode` on `<html>` + CSS attribute selectors are the whole-site switch surface; `<button role="switch">` in the header (`+layout.svelte`) drives it via the runes store (Architecture Pattern 3 + 4) |
| MODE-02 | Choice persists across loads/revisits via localStorage | Write-through on user toggle to a **namespaced** key; inline script reads it first (Pattern 2, Pitfall 3) |
| MODE-03 | Default Accessible when `prefers-reduced-motion: reduce`, unless explicit stored choice | Precedence step 2 in `resolveMode()`; `matchMedia('(prefers-reduced-motion: reduce)').matches` (Pattern 1) |
| MODE-04 | Resolved mode applied before first paint — no FOUC | Synchronous inline `<head>` script stamps `data-mode` before `%sveltekit.head%`/body (Pattern 1, Pitfall 1) |
| MODE-05 | Toggling announces via `aria-live`; preserves focus + scroll | Visually-hidden `aria-live="polite"` region updated on toggle; focus stays on the button; no navigation → scroll preserved inherently (Pattern 5, Pitfall 4) |
| MODE-06 | Keyboard-operable with correct switch semantics + visible focus | Native `<button role="switch" aria-checked>` (Enter/Space free); reuse existing `:focus-visible` token ring (Pattern 5, WCAG mapping) |
| MODE-07 | WebGL unsupported/unavailable → Accessible automatically | Cheap head-time `hasWebGL()` probe in the inline script + resolver; two-tier detection noted for Phase 5 (Pattern 1, WebGL Detection) |

## Architecture Patterns

### Recommended file structure (additive — nothing here imports `three`)
```
src/
├── app.html                     # + inline <head> script (mirrors resolveMode)
├── lib/
│   ├── mode/
│   │   ├── resolve.ts           # pure resolveMode() + hasWebGL() — SINGLE precedence source of truth
│   │   ├── mode.svelte.ts       # runes store: $state seeded from data-mode, write-through
│   │   ├── constants.ts         # STORAGE_KEY, MODE values, DATA_ATTR
│   │   ├── resolve.spec.ts      # server(node) project — precedence truth table
│   │   └── mode.svelte.spec.ts  # (optional) store behavior
│   └── components/
│       ├── ModeToggle.svelte
│       └── ModeToggle.svelte.spec.ts   # client(browser) project — ARIA/keyboard/live-region
└── routes/
    └── +layout.svelte           # renders header + <ModeToggle/> + aria-live region + no-transition unlock
```

### Pattern 1: No-flash resolution via synchronous inline `<head>` script (MODE-04, -03, -07)
**What:** A tiny, dependency-free `<script>` placed in `app.html` **before** `%sveltekit.head%` runs during head parsing — before the body paints. It reads localStorage + `matchMedia` + a WebGL probe, computes the mode, and stamps `document.documentElement.dataset.mode`. CSS then keys off `[data-mode]`, so the correct visual state exists on the very first paint.
**When to use:** Always, for any pre-paint state on a prerendered/static site. This is the *only* place that eliminates FOUC — a component `onMount` or `$effect` runs after hydration, i.e. after the wrong mode has already painted.
**Why it works here:** adapter-static emits static HTML with no per-request server logic, so the decision genuinely cannot happen server-side; the inline script is the earliest client hook available.

```html
<!-- app.html, inside <head>, BEFORE %sveltekit.head% -->
<!-- MIRRORS src/lib/mode/resolve.ts — keep in sync (see Pitfall 5). Values: 'premium' | 'accessible'. -->
<script>
  (function () {
    var KEY = 'did2:mode';            // NAMESPACED — shared-origin GH Pages (Pitfall 3)
    var m;
    try { m = localStorage.getItem(KEY); } catch (e) { m = null; }
    if (m !== 'premium' && m !== 'accessible') {
      var reduce = false;
      try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
      var webgl = false;
      try {
        var c = document.createElement('canvas');
        webgl = !!(window.WebGLRenderingContext &&
          (c.getContext('webgl') || c.getContext('experimental-webgl')));
      } catch (e) { webgl = false; }
      m = (reduce || !webgl) ? 'accessible' : 'premium'; // default — see Open Question #1
    }
    document.documentElement.setAttribute('data-mode', m);
  })();
</script>
```
> Source: technique is the canonical anti-FOUC theme-toggle pattern; adapter-static "no SSR request" constraint per SvelteKit adapter-static docs (svelte.dev/docs/kit/adapter-static). Confidence HIGH.

### Pattern 2: Exact precedence algorithm (the tested source of truth)
`src/lib/mode/resolve.ts` holds the canonical resolver; the inline script is a hand-mirrored copy (it can't import). Unit tests target *this* function.
```ts
// src/lib/mode/resolve.ts
export type Mode = 'premium' | 'accessible';
export const STORAGE_KEY = 'did2:mode';

export interface ModeSignals {
  stored: string | null;        // localStorage value (may be junk)
  prefersReducedMotion: boolean;
  webglAvailable: boolean;
}

/** Precedence: explicit stored choice > reduced-motion > no-WebGL > premium default. */
export function resolveMode(s: ModeSignals): Mode {
  if (s.stored === 'premium' || s.stored === 'accessible') return s.stored; // stored ALWAYS wins
  if (s.prefersReducedMotion) return 'accessible';                          // MODE-03
  if (!s.webglAvailable) return 'accessible';                              // MODE-07
  return 'premium';                                                        // default (Open Q #1)
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}
```
This truth table is directly unit-testable (see Validation Architecture). Note the resolver is **pure** (signals in, mode out) — that is what makes MODE-02/03/07 verifiable in the fast node project without a browser.

### Pattern 3: Whole-site switch surface = `data-mode` on `<html>` + CSS
The switch is not per-component wiring; it is one attribute. `[data-mode="premium"]` / `[data-mode="accessible"]` on the root drives all mode-conditional styling and, later, gates the Premium dynamic import. In Phase 3 there is no mode-divergent *content* yet, so the attribute + the toggle's own reflected state are the only observable effects — which is exactly why hydration mismatch (Pitfall 2) is manageable now and must be locked in before Phase 4/5 add divergent UI.

### Pattern 4: Svelte 5 runes store seeded from the DOM (avoids hydration mismatch)
`mode.svelte.ts` exposes reactive `$state`, but it must **not** recompute the mode independently — it must read what the inline script already stamped, so store and DOM agree.
```ts
// src/lib/mode/mode.svelte.ts
import { browser } from '$app/environment';
import { STORAGE_KEY, type Mode } from './resolve';

// SSR/prerender default = 'accessible' (the zero-WebGL baseline that ships if JS fails).
// On the client, seed from the attribute the inline script already set — do NOT re-resolve.
let current = $state<Mode>('accessible');
if (browser) {
  const stamped = document.documentElement.getAttribute('data-mode');
  if (stamped === 'premium' || stamped === 'accessible') current = stamped;
}

export function getMode(): Mode { return current; }
export function isPremium(): boolean { return current === 'premium'; }

export function setMode(next: Mode): void {
  current = next;
  if (browser) {
    document.documentElement.setAttribute('data-mode', next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode: ignore */ }
  }
}
export function toggleMode(): Mode {
  const next: Mode = current === 'premium' ? 'accessible' : 'premium';
  setMode(next);
  return next;
}
```
**Deliberate design choices:**
- **Explicit write-through, not `$effect`.** A module-level `$effect` requires `$effect.root` and complicates teardown/SSR; writing to localStorage synchronously inside `setMode` is simpler, deterministic, and easy to test. Reserve `$effect` for component-scoped concerns.
- **Exported functions, not a raw exported `$state`.** You cannot reassign an imported binding across modules; exposing getters/mutators keeps reactivity intact for consumers (`import { isPremium } from '$lib/mode/mode.svelte'`).
- **SSR default = `accessible`.** Guarantees the prerendered HTML (and the JS-disabled experience) is the accessible peer, honoring Core Value.

> Source: Svelte docs — runes usable in `.svelte.ts` for shared state ($state • Svelte Docs); Mainmatter "Global state in Svelte 5: do's and don'ts" (mainmatter.com, 2025). Confidence HIGH.

### Pattern 5: Accessible switch control (MODE-06, -05)
Build on a **native `<button>`** so Enter/Space activation and focusability are free; add `role="switch"` + `aria-checked` for switch semantics.
```svelte
<!-- ModeToggle.svelte (essence) -->
<script lang="ts">
  import { isPremium, toggleMode } from '$lib/mode/mode.svelte';
  let announce = $state('');
  function onToggle() {
    const next = toggleMode();
    announce = next === 'premium' ? 'Premium mode enabled' : 'Accessible mode enabled';
    // focus intentionally NOT moved — stays on this button (MODE-05)
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={isPremium()}
  onclick={onToggle}
  class="mode-toggle"
>
  <span class="mode-toggle__label">Premium 3D mode</span>
  <span class="mode-toggle__track" aria-hidden="true"></span>
</button>

<!-- live region lives in the layout, present at load, updated on toggle -->
```
Layout-level announce region (present in DOM from first paint so SR announces subsequent changes):
```svelte
<!-- +layout.svelte -->
<div aria-live="polite" class="visually-hidden">{announceText}</div>
```
**Rules:**
- `aria-checked` reflects Premium = on. The accessible name ("Premium 3D mode") states *what* the switch controls, so "on/off" reads sensibly.
- Do **not** move focus on toggle (MODE-05: "focus placed deliberately" = stays on the control). No SvelteKit navigation occurs, so scroll position is untouched — nothing to restore.
- Reuse the existing global `:focus-visible { outline: 2px solid var(--color-focus-ring); }` (app.css) for the visible focus state (MODE-06) — do not remove outlines.
- Any toggle track transition must be wrapped in `@media (prefers-reduced-motion: no-preference)` and suppressed on initial load (see Anti-Patterns / no-transition unlock).

> Source: W3C WAI-ARIA APG Switch Pattern (w3.org/WAI/ARIA/apg/patterns/switch/) — `role="switch"` requires `aria-checked` true/false; MDN ARIA switch role. Confidence HIGH.

### Switch vs toggle-button vs radiogroup (semantics decision)
| Option | Semantics | Fit for Premium/Accessible |
|--------|-----------|-----------------------------|
| **`<button role="switch" aria-checked>`** (recommended) | Binary on/off | Clean if named "Premium 3D mode" (checked = premium). Matches criteria "switch semantics" literally. |
| `<button aria-pressed>` (toggle button) | Pressed/unpressed | Allowed by criteria wording ("aria-pressed/role"); slightly weaker "on/off" mapping than switch. |
| `radiogroup` of two radios | Choose 1 of 2 named options | Most literally correct ("two named modes"), but heavier UI and less "toggle"-like; overkill for a header control. |
Recommendation: **switch**. The criteria explicitly name both `aria-pressed` and role, so switch is safely in-spec and the strongest binary semantic.

### Anti-Patterns to Avoid
- **Resolving mode in `onMount`/`$effect`/`+layout.svelte` script.** Runs post-hydration → guaranteed FOUC for capable users. Mode MUST be stamped by the inline head script.
- **Transition-on-load flash.** If the toggle track has a CSS `transition`, it animates during the initial mode stamp. Add a `no-transition` (or `data-mode-ready`) class removed after first paint (`requestAnimationFrame` in the layout `onMount`), and scope transitions behind `prefers-reduced-motion: no-preference`.
- **Un-namespaced localStorage key.** `wolfwdavid.github.io` hosts many sibling projects sharing one origin — a bare `mode` key collides. Use `did2:mode` (Pitfall 3).
- **Reassigning an imported `$state` from another module.** Won't propagate reactivity; export mutator functions instead.
- **Probing WebGL by actually constructing a `three` renderer.** Pulls WebGL bytes into the Accessible path and violates the zero-WebGL invariant. Use the cheap raw-canvas `getContext` probe only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Switch keyboard/focus behavior | Custom `<div>` with `tabindex` + keydown handlers | Native `<button>` + `role="switch"` + `aria-checked` | Native button gives Enter/Space, focusability, disabled semantics for free; div re-implementations routinely miss Space, focus ring, or SR role |
| Reactive cross-component state | A bespoke pub/sub or `window` event bus | Svelte 5 `$state` in `.svelte.ts` | Runes are the framework-native, tested reactivity primitive; a bus reinvents it worse |
| Reduced-motion / capability queries | Parsing UA strings, hardcoded device lists | `matchMedia('(prefers-reduced-motion: reduce)')` + canvas `getContext` probe | UA sniffing is unreliable and privacy-hostile; media queries + feature probes are the real signals |
| Screen-reader announcement | Toast library, `alert()`, forcing focus to a message | An `aria-live="polite"` region present at load | Moving focus to announce breaks MODE-05's "focus placed deliberately"; a persistent live region is the standard, non-disruptive mechanism |

**Key insight:** The *only* thing correctly hand-written here is the ~15-line inline resolver — precisely because it must execute before any module system exists. Everything user-facing (button, live region, reactivity, media queries) should lean on platform/framework primitives.

## Common Pitfalls

### Pitfall 1: FOUC because mode is resolved too late
**What goes wrong:** Capable visitors briefly see Accessible (or vice-versa) before the component decides.
**Why:** `onMount`/`$effect`/store init all run after hydration, after the first paint.
**How to avoid:** Stamp `data-mode` in the synchronous inline `<head>` script (Pattern 1). Verify with a Playwright check that reads `documentElement.dataset.mode` immediately on load.
**Warning signs:** A visible flip on first load; `data-mode` absent in the raw prerendered HTML (expected — it's set at runtime, but must be set *before paint*, not after mount).

### Pitfall 2: Hydration mismatch on the toggle's reflected state
**What goes wrong:** Prerendered HTML is mode-agnostic (SSR default `accessible`), but the client store reads `premium` from the stamped attribute → the toggle's `aria-checked`/pressed differs between server HTML and first client render; Svelte logs a hydration mismatch and may reconcile visibly.
**Why:** There is no server request to know the user's mode at prerender time.
**How to avoid:** (a) Seed the store from `data-mode` (Pattern 4) so store == DOM immediately; (b) accept that the *button's* reflected attribute is the only divergent node in Phase 3 and let Svelte reconcile it on hydrate (single attribute, no layout shift); (c) if the mismatch warning is undesirable, gate the toggle's `aria-checked` render behind `browser`/a mounted flag so the server emits a neutral default and the client sets the real value post-hydrate. Document the chosen approach so Phase 4/5 (which add mode-divergent content) inherit a consistent rule.
**Warning signs:** Console "hydration mismatch" warnings pointing at the toggle; the switch visually snapping state right after load.

### Pitfall 3: localStorage origin collision on shared GitHub Pages
**What goes wrong:** Another `wolfwdavid.github.io/*` project reads/writes the same `mode` key; the DID site inherits a stale value from an unrelated app.
**Why:** `localStorage` is keyed by **origin**, not by path/subpath — every project under the user's `github.io` account shares it.
**How to avoid:** Namespace the key: `did2:mode`. Keep the same string in `constants.ts`, `resolve.ts`, and the inline script.
**Warning signs:** Mode "remembers" a choice the user never made on this site; QA on a fresh profile behaves differently than on the dev machine.

### Pitfall 4: Breaking focus or scroll on toggle
**What goes wrong:** Re-rendering a large subtree or navigating on toggle moves focus to `<body>` and jumps scroll to top.
**Why:** Toggling should mutate an attribute/state, not navigate or remount the page.
**How to avoid:** `setMode` only flips `data-mode` + store + storage; no `goto`, no route change. Keep focus on the button (don't call `.focus()` elsewhere). Scroll is preserved because nothing scrolls.
**Warning signs:** Focus ring disappears after toggling; page scrolls to top on mode change.

### Pitfall 5: Inline script and resolver drift apart
**What goes wrong:** Someone edits precedence in `resolve.ts` but not the inline `app.html` copy (or vice-versa) → head-time decision disagrees with the store.
**Why:** The inline script cannot import the module, so logic is duplicated.
**How to avoid:** Add a comment cross-linking both; keep the inline script minimal; add a small test/assertion documenting the shared precedence (e.g. a spec that exercises `resolveMode` against the exact truth table the inline script encodes). Consider a code-review checklist item. (A Vite HTML-transform to inject is possible but overkill for ~15 lines.)
**Warning signs:** Store mode differs from `data-mode` on load for some signal combination.

### Pitfall 6: `localStorage`/`matchMedia` throwing in restricted contexts
**What goes wrong:** Safari private mode throws on `localStorage`; sandboxed iframes throw on storage; older engines lack `matchMedia`.
**Why:** These APIs are not universally available/permitted.
**How to avoid:** `try/catch` around every `localStorage` and `matchMedia`/WebGL access (shown in Patterns 1 & 4); treat any failure as "no stored choice" / conservative Accessible.
**Warning signs:** Blank page or JS error on first paint in private-mode testing.

## Code Examples

### CSS: whole-site mode hook + no initial-transition + reduced-motion
```css
/* app.css (add) */
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
/* Suppress toggle animation until after first paint, and honor reduced motion */
:root:not([data-mode-ready]) .mode-toggle__track { transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  .mode-toggle__track { transition: none !important; }
}
/* Example mode-conditional styling surface (Phase 4+ leans on this) */
:root[data-mode='premium'] { /* ... */ }
:root[data-mode='accessible'] { /* ... */ }
```

### Layout: mount-time unlock of transitions
```svelte
<!-- +layout.svelte (add) -->
<script lang="ts">
  import { onMount } from 'svelte';
  onMount(() => {
    requestAnimationFrame(() =>
      document.documentElement.setAttribute('data-mode-ready', '')
    );
  });
</script>
```

> Sources: WAI-ARIA APG Switch (w3.org/WAI/ARIA/apg/patterns/switch/); MDN `switch` role; Svelte `$state` docs. Confidence HIGH.

### WCAG 2.2 AA mapping (why each ARIA choice matters)
| Success Criterion | WCAG 2.2 AA ref | How this phase satisfies it |
|-------------------|-----------------|-----------------------------|
| Switch has a name, role, value | 4.1.2 Name, Role, Value | Native `<button role="switch" aria-checked>` + text label |
| Change announced | 4.1.3 Status Messages | `aria-live="polite"` region updated on toggle |
| Keyboard operable | 2.1.1 Keyboard | Native button (Enter/Space) |
| Visible focus | 2.4.7 Focus Visible + 2.4.11/2.4.13 (2.2 focus appearance) | Global `:focus-visible` outline token, not removed |
| No motion-triggered discomfort | 2.3.3 Animation from Interactions (AAA) + reduced-motion default | Toggle transition gated behind `prefers-reduced-motion: no-preference`; Accessible default when reduce is set |
| Target size | 2.5.8 Target Size (Minimum, 2.2 AA) | Size the switch ≥24×24 CSS px |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `writable()` stores + `$store` autosub | Svelte 5 runes (`$state` in `.svelte.ts`) | Svelte 5 (2024) | Use runes; stores still work but runes are idiomatic and this repo is runes-only |
| Resolve theme in a component effect | Synchronous inline `<head>` script | Long-standing for dark mode; unchanged | Only reliable anti-FOUC method on static/prerendered sites |
| `role="switch"` optional `aria-checked` | `aria-checked` **required** with `switch` role | ARIA 1.2+ | Must always set `aria-checked` true/false |

**Deprecated/outdated for this repo:** Svelte 4 writable-store tutorials; `svelte/store` `derived` for this use case; any "theme in cookie + SSR" pattern (no server here).

## Open Questions

1. **Default mode for a fully-capable, no-preference, first-time visitor — Premium or Accessible?**
   - What we know: Criteria pin only the *Accessible* triggers (reduced-motion, no-WebGL, stored Accessible). PROJECT.md frames Premium as "maximum visual impact" the user wants, and Accessible as the prerendered baseline.
   - What's unclear: Whether an unconstrained first visit should auto-enter Premium 3D (the resolver's `return 'premium'` above) or stay Accessible until the user opts in.
   - Recommendation: For a disability-equity org, **defaulting Accessible and treating Premium as an explicit opt-in is the more on-brand, lower-risk reading** — but it contradicts the "maximum visual impact on landing" intent. The resolver is written to make this a **one-line change** (`return 'premium'` vs `return 'accessible'`). **Planner must confirm with the user during plan-phase** and encode the decision in a task + a resolver unit test. The rest of the architecture is identical either way.

2. **Hydration-mismatch handling for the toggle's reflected state (Pitfall 2).**
   - Recommendation: Pick one rule now — either accept single-attribute reconciliation, or gate `aria-checked` behind a mounted flag — and document it, because Phase 4 adds mode-divergent content that will inherit this rule at larger scale.

3. **Header placement of the toggle.** MODE-01 says "header," but the header/nav shell is largely a Phase 4 concern. Recommendation: introduce a minimal header slot in `+layout.svelte` now to host the toggle + live region; Phase 4 fleshes out the full nav around it.

## Validation Architecture

Nyquist enabled (`workflow.nyquist_validation: true`). This section drives `VALIDATION.md`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `^4.1.8` (two projects) + Playwright `^1.60.0` (E2E) |
| Config file | `vite.config.ts` (doubles as the Vitest config; defines `client` + `server` projects) |
| Project split | **server** = node env, `src/**/*.{test,spec}.{js,ts}` **excluding** `*.svelte.*` → pure logic; **client** = real Chromium via `@vitest/browser-playwright`, `src/**/*.svelte.{test,spec}.{js,ts}` → components |
| Quick run command | `pnpm test:unit -- --run --project server` (fast precedence truth table, no browser) |
| Full unit command | `pnpm test:unit -- --run` (both projects) |
| E2E command | `pnpm exec playwright test` (persistence + no-flash smoke) |

> Note: the `package.json` `test` script internally calls `npm run ...`; recommend a small task to switch it to `pnpm` for consistency (project uses pnpm). Direct `pnpm test:unit -- --run` avoids the nested-`npm` issue.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MODE-03 | reduced-motion (no stored) → accessible | unit (node) | `pnpm test:unit -- --run --project server` | ❌ Wave 0 |
| MODE-07 | no WebGL (no stored) → accessible | unit (node) | `pnpm test:unit -- --run --project server` | ❌ Wave 0 |
| MODE-02 | stored choice always wins + persists | unit (node) + E2E | `pnpm test:unit -- --run --project server`; `pnpm exec playwright test` | ❌ Wave 0 |
| (default) | capable + no-pref → premium *(or accessible, per Open Q#1)* | unit (node) | `pnpm test:unit -- --run --project server` | ❌ Wave 0 |
| MODE-01 | toggle flips `data-mode` + store whole-site | component (client) + E2E | `pnpm test:unit -- --run --project client`; `pnpm exec playwright test` | ❌ Wave 0 |
| MODE-06 | `role="switch"` + `aria-checked` flips; Enter/Space toggles; visible focus | component (client) | `pnpm test:unit -- --run --project client` | ❌ Wave 0 |
| MODE-05 | `aria-live` text updates; focus stays on button | component (client) | `pnpm test:unit -- --run --project client` | ❌ Wave 0 |
| MODE-05 | scroll preserved on toggle | E2E | `pnpm exec playwright test` | ❌ Wave 0 |
| MODE-04 | `data-mode` set before first paint (no FOUC) | E2E (Playwright) | `pnpm exec playwright test` | ❌ Wave 0 |

**Truth-table spec (the crux, `resolve.spec.ts`, node project) — cases to assert:**
| stored | reducedMotion | webgl | expected |
|--------|---------------|-------|----------|
| `'premium'` | true | false | premium (stored wins) |
| `'accessible'` | false | true | accessible (stored wins) |
| `null` | true | true | accessible |
| `null` | false | false | accessible |
| `null` | false | true | premium *(or accessible per Open Q#1)* |
| `'garbage'` | false | true | premium *(invalid stored ignored)* |

### Sampling Rate
- **Per task commit:** `pnpm test:unit -- --run --project server` (precedence truth table — sub-second, catches the highest-value regressions).
- **Per wave merge:** `pnpm test:unit -- --run` (both projects: logic + component ARIA/keyboard) then `pnpm check` (svelte-check type/a11y gate) — matches the Phase 2 gate discipline.
- **Phase gate (before `/gsd:verify-work`):** full unit suite green + `pnpm exec playwright test` (persistence + no-flash smoke) + `pnpm check` exit 0.

### Wave 0 Gaps
- [ ] `src/lib/mode/resolve.ts` + `resolve.spec.ts` — precedence truth table (MODE-02/03/07 + default)
- [ ] `src/lib/mode/constants.ts` — `STORAGE_KEY='did2:mode'`, mode values, data attr
- [ ] `src/lib/mode/mode.svelte.ts` (+ optional `mode.svelte.spec.ts`) — store seed/write-through
- [ ] `src/lib/components/ModeToggle.svelte` + `ModeToggle.svelte.spec.ts` — client(browser) ARIA/keyboard/live-region (MODE-01/05/06)
- [ ] Inline `<head>` script added to `app.html` mirroring the resolver (MODE-04)
- [ ] `aria-live` region + `no-transition` unlock in `+layout.svelte`
- [ ] A Playwright spec for persistence-across-reload + no-flash + scroll-preserved (MODE-02/04/05) — Playwright is installed; a `*.e2e.ts`/`tests/` spec must be authored
- [ ] `.visually-hidden` + `[data-mode]` CSS in `app.css`
- [ ] (Optional cleanup) remove `src/lib/vitest-examples/*` scaffold if not wanted as reference

## Sources

### Primary (HIGH confidence)
- Repo files: `package.json`, `vite.config.ts`, `svelte.config.js`, `src/routes/+layout.{svelte,ts}`, `src/app.html`, `src/app.css`, `src/lib/content/index.ts`, `.planning/{STATE,PROJECT,REQUIREMENTS,ROADMAP,config.json}` — versions, adapter-static config, test topology, locked decisions
- W3C WAI-ARIA APG — Switch Pattern (w3.org/WAI/ARIA/apg/patterns/switch/) — `role="switch"` requires `aria-checked`
- MDN — ARIA `switch` role; `button` role — semantics of switch vs toggle button
- Svelte Docs — `$state` rune; runes in `.svelte.ts` for shared state (svelte.dev/docs/svelte/$state)
- SvelteKit Docs — adapter-static (svelte.dev/docs/kit/adapter-static) — no SSR request → client-side resolution

### Secondary (MEDIUM confidence)
- Mainmatter, "Runes and Global state: do's and don'ts" (mainmatter.com, 2025) — module-level `$state` and `$effect.root` guidance
- ui-ux-pro-max skill `shadcn-accessibility.md` / `shadcn-components.md` — focus-visible, skip-link, Switch, reduced-motion patterns (React/Radix-oriented; **translate**, do not copy, into Svelte)

### Tertiary (LOW confidence — verify if relied upon)
- General "anti-FOUC theme toggle inline script" community pattern — mechanism is standard and cross-verified against the adapter-static "no SSR" fact, but no single canonical citation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — read directly from locked `package.json`; no new deps
- No-flash mechanism: HIGH — standard technique + confirmed adapter-static no-SSR constraint
- ARIA switch semantics: HIGH — W3C APG + MDN
- Runes store pattern: HIGH — Svelte docs + 2025 Mainmatter guidance
- Default-mode decision: LOW (a values choice, not a fact) — flagged as Open Question #1 for the planner/user
- Hydration-mismatch handling: MEDIUM — approach sound; exact console-warning behavior in Svelte 5 hydrate is best confirmed empirically during implementation

**Research date:** 2026-07-04
**Valid until:** ~2026-08-04 (stable domain; Svelte 5 runes + ARIA switch are settled)
