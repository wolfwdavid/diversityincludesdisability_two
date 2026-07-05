# Phase 4: Accessible Section Components - Research

**Researched:** 2026-07-05
**Domain:** WCAG 2.2 AA section/page components in a prerendered (adapter-static) SvelteKit 2.69 + Svelte 5 (runes) app; semantic HTML, skip links, disclosure nav, keyboard/focus management, 200% zoom reflow, zero-WebGL guarantee
**Confidence:** HIGH (stack is already installed and pinned; all patterns verified against the live repo, the installed SvelteKit 2.69.1 runtime, and current W3C/WAI-ARIA APG guidance)

## Summary

Phase 4 is the phase where the Core Value is actually met: it turns the empty-but-deployed shell (Phase 1), the typed content barrel (Phase 2), and the mode-state substrate (Phase 3) into a complete, live, WCAG 2.2 AA website that ships **zero WebGL**. No new framework is introduced. Every page is plain semantic HTML + scoped Svelte components that read from the `$lib/content` barrel and internal-link via `resolve()` from `$app/paths`. There is essentially **nothing 3D here** — the ESLint `no-restricted-imports` guard already makes a `lib/premium/` import a lint error, so "zero WebGL" is largely a structural property you inherit, not something you build.

The real work is **information architecture + accessibility discipline**: five routes (`/`, `/services`, `/about`, `/contact`, `/accessibility`), a set of section components (Hero, Mission, ServicesOverview, ServicesDetail, About, SocialProof, Contact), a primary `<nav>` with a **mobile disclosure toggle** (the A11Y-04 `aria-expanded` + Escape/blur target), skip links to `#main` and `#nav`, a single ordered heading tree per page, descriptive link text, visible focus (already globally set), and a layout that reflows and stays functional at 200% zoom / 320px width. The `SocialProof` component must render the one real MBP engagement and show the pending testimonial/press slots as honest "content pending" markers — branching on `Slot<T>.status`, never fabricating.

**Primary recommendation:** Build a thin `+layout.svelte` chrome (skip links → sticky header hosting `<Nav>` + the existing `<ModeToggle>` → `<main id="main" tabindex="-1">` → footer), one route `+page.svelte` per nav entry that sets `<svelte:head>` from `seo` and renders composed section components from `$lib/components/sections/`, and a single `Nav.svelte` whose only interactive complexity is a runes-driven mobile disclosure (`$state` open flag, `aria-expanded`, Escape + focus-out close). Gate it with three cheap automated layers already available in the repo: `svelte-check` (Svelte's compile-time a11y warnings), `vitest-browser-svelte` component specs (roles/labels/keyboard), and Playwright per-page E2E (skip-link focus move, disclosure Escape/blur, `@axe-core/playwright` WCAG 2.2 AA scan). Adding `@axe-core/playwright` is the one Wave-0 install.

## User Constraints (derived from STATE.md + PROJECT.md — no CONTEXT.md exists)

No `CONTEXT.md` was created for this phase (verified: `.planning/phases/04-accessible-section-components/` contains only this research file — planned without `discuss-phase`, matching phases 1–3). The binding constraints therefore come from the locked decisions accumulated in STATE.md / PROJECT.md and MUST be honored verbatim by the planner:

### Locked Decisions
- **Accessible mode is the prerendered baseline; Premium is a client-only enhancement behind ONE dynamic import.** Nothing in phases 1–4 may import from `lib/premium/` — enforced structurally by ESLint `no-restricted-imports` (`patterns: ['$lib/premium/*', '**/lib/premium/*']`). Phase 4 writes **zero** Three/Threlte/WebGL/Canvas/GLB code.
- **All internal links MUST use `resolve()` from `$app/paths`** (base-aware for the GH Pages subpath). `trailingSlash: 'always'` and `prerender = true` are global (`src/routes/+layout.ts`) — do not break them.
- **Content lives ONLY in the single barrel `src/lib/content/index.ts`** (`$lib/content`). Both modes import from it; no per-mode or duplicated copy. Social-proof: only the real MBP (Mark Levine) training is `published`; everything else ships as typed `pending` `Slot<T>` — **NO fabrication** (CONT-03, tsc-enforced via `Published<T>`).
- **Nav model is fixed** in `src/lib/content/site.ts`: Home, Services, About, Contact, **Accessibility Statement** (route keys only, resolved downstream). The Wix "Log In" item is intentionally omitted.
- **ModeToggle is a native `<button role="switch">`** already mounted in a sticky `<header>` in `+layout.svelte`; an `aria-live="polite"` announce region is **colocated inside it and rendered unconditionally**. Phase 4 builds the nav **around** this slot and MUST NOT unmount the toggle or its live region.
- **DID blue/orange token palette + the semantic CSS custom properties are locked** (`src/lib/tokens/tokens.css` + `colors.ts`); A11Y-06 contrast is already gated by the build-blocking `check-contrast.mjs`. New components consume the `--color-*` tokens — do NOT introduce raw hex.
- **pnpm** is the package manager (`pnpm@11.6.0`). Use `pnpm`, never bare `npm run`.
- **Node 24 type-stripping** runs `check-contrast.mjs` directly against `.ts`; keep token hexes mirrored between `colors.ts` and `tokens.css`.

### Claude's Discretion
- Visual layout/composition of each section (grid vs stack, spacing rhythm) within the locked tokens — use the `ui-ux-pro-max` skill for layout/type/spacing guidance (see below).
- Component decomposition and file layout under `$lib/components/` (recommended structure below).
- Whether to introduce `@axe-core/playwright` now (recommended) vs. defer the formal axe gate to Phase 6.

### Deferred Ideas (OUT OF SCOPE for Phase 4)
- Any Three.js/Threlte scene, `<Canvas>`, GLB, or `lib/premium/` code (**Phase 5**).
- The network-level "Accessible mode loads no `three` chunk" Playwright assertion and the full axe/Lighthouse both-mode gate (**Phase 6**, QA-01/02/03). Phase 4 may run axe per page as a smoke gate, but the formal cross-mode gate is Phase 6.
- Real testimonials, client logos, press lists, scheduler/donation links, blog (v2: SOCL/ENGA/BLOG). Keep the pending slots pending.
- Confirming/replacing the `pending` bio-mission and the four `pending` social-link handles — that is a human content-capture pass, not a build task. Render them as pending; do not invent handles.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SECT-01 | Home: hero, mission, services overview, primary CTA | Route `/` composes `Hero` + `Mission` + `ServicesOverview` + a `mailto`/contact CTA from `contact.ctaLabel`; `services` + `about.intro`/`site.tagline` from the barrel (Architecture: Route/Section split) |
| SECT-02 | Services detail: 4 pillars | Route `/services` maps `services` (4 `Service` items) → `ServicesDetail` list; each pillar a `<section aria-labelledby>` with `h2` (Pattern: content-driven list) |
| SECT-03 | About: Eman Rimawi bio | Route `/about` renders `about.bio[]` paragraphs + `about.displayName` h1; `about.mission` is a `pending` slot → render pending marker (Pattern: pending-slot rendering) |
| SECT-04 | Social-proof: real engagement + marked pending slots | `SocialProof` branches on `engagements`/`testimonials`/`press` `Slot<T>.status`: render the published MBP engagement, render pending items as an explicit "content coming soon" note (Pattern: pending-slot rendering) |
| SECT-05 | Contact: prominent `mailto` CTA + social links | `Contact` builds `mailto:${contact.email}?subject=` from the barrel; iterates `socialLinks` rendering published `<a>` and pending as non-link text (Pattern: mailto + Slot links) |
| SECT-06 | Accessibility statement page in primary nav | Route `/accessibility`; nav item already present; content structure per GOV.UK/scope.org.uk model (see "Accessibility Statement Conventions") |
| SECT-07 | Responsive mobile→desktop | rem/`clamp()` fluid type + CSS Grid/flex, no fixed-px containers, mobile-first media queries (Pattern: responsive/zoom) |
| A11Y-01 | Skip links to main + nav | Two skip links as first focusable elements in `+layout.svelte`; targets `#main` + `#nav` with `tabindex="-1"` (Pattern: skip links) |
| A11Y-02 | Single h1, ordered h2/h3 | One `<h1>` per route page; sections use `<h2>`; sub-items `<h3>`; svelte-check + axe `heading-order` enforce (Pattern: heading hierarchy) |
| A11Y-03 | Descriptive link text | Nav/CTA/social labels sourced from barrel `label`/`ctaLabel` (already descriptive, e.g. "Eman Rimawi on LinkedIn"); axe `link-name` + no "click here" (Pitfall: generic link text) |
| A11Y-04 | Disclosure menus: `aria-expanded`, close on Escape/blur | Mobile nav toggle = `<button aria-expanded={open} aria-controls="nav-menu">`; runes `$state` + Escape keydown + `focusout` close (Pattern: disclosure menu) |
| A11Y-05 | Keyboard-operable, visible focus | Native `<a>`/`<button>` only; global `:focus-visible` ring already in `app.css` — never `outline:none` (Pattern: focus) |
| A11Y-07 | Usable at 200% zoom / resized text | rem units, `clamp()`, reflow at 320px, no `user-scalable=no` (already correct), no fixed-height text containers (Pattern: responsive/zoom, WCAG 1.4.4/1.4.10) |
| A11Y-08 | Zero WebGL, no non-essential motion | ESLint guard already enforces no `lib/premium` import; only motion is the existing toggle track (reduced-motion-guarded). Add nothing animated (Pattern: zero-WebGL proof) |

*(A11Y-06 contrast is DONE in Phase 1 via the build-blocking `check-contrast.mjs` gate — not re-litigated here; new components must use the locked `--color-*` tokens so they inherit passing pairs.)*

## Standard Stack

**Everything needed is already installed and pinned by Phases 1–3.** This phase adds **no runtime dependencies** and **one dev dependency** (axe, optional-but-recommended).

### Core (already present — verified in `package.json`)
| Library | Version (locked) | Purpose in Phase 4 | Why Standard |
|---------|------------------|--------------------|--------------|
| Svelte | `^5.56.1` (runes) | Section components; `$state` for the mobile disclosure; `$derived` for active-nav | Runes are the idiomatic Svelte 5 reactivity; no store boilerplate needed for a tiny open/closed flag |
| SvelteKit | `2.69.1` (`^2.63.0`) | File-based routes, `$app/paths` `resolve()`/`base`, `$app/state` `page` for active nav, `<svelte:head>` for SEO | Prerendered static output; `resolve()` is the base-aware link primitive already adopted |
| `@sveltejs/adapter-static` | `3.0.10` | Prerenders all 5 routes to `index.html` under the subpath | The only adapter that yields the fully static HTML GH Pages needs |
| TypeScript | `^5.9.3` | Types for barrel consumption + `Slot<T>` narrowing | `Published<T>` narrowing is what keeps SocialProof honest at compile time |
| `svelte-check` | `^4.6.0` | Compile-time a11y warnings (`pnpm check`) | Svelte's built-in a11y linting (missing alt, label-has-associated-control, redundant roles, etc.) — first cheap gate |

### Testing (already present)
| Library | Version | Purpose in Phase 4 | When to Use |
|---------|---------|--------------------|-------------|
| Vitest | `^4.1.8` | Two-project runner (`client` browser + `server` node) | Component specs + any pure-logic helpers |
| `vitest-browser-svelte` | `^2.1.1` | Mount components in real Chromium; assert roles/labels/keyboard | Per-section component a11y specs (`*.svelte.spec.ts`) |
| `@playwright/test` | `^1.60.0` | Per-page E2E: skip-link focus, disclosure Escape/blur, keyboard walkthrough | Real-browser behaviors (`*.e2e.ts`) |

### Wave-0 install (recommended)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@axe-core/playwright` | `4.12.1` (bundles `axe-core@4.12.1`) | Automated WCAG 2.2 AA scan per page in E2E | **NOT yet installed** (STACK.md specced it; `node_modules/@axe-core` absent). `pnpm add -D @axe-core/playwright`. Supports `wcag22aa` tag. The formal both-mode gate is Phase 6 (QA-01), but running it per page now catches regressions while the Core Value is being built. |

**Do NOT add:** any UI/component library, CSS framework (Tailwind/etc.), headless-menu library (Melt/Bits UI), icon font, animation library, or SvelteKit head-management library. The nav disclosure is ~20 lines of runes; a full menu library is overkill and adds bytes to the accessible baseline. See Don't Hand-Roll for the line.

**Version verification:** All "already present" versions read directly from the repo `package.json` (locked Phase 1). `$app/state` confirmed available in the installed `@sveltejs/kit@2.69.1` runtime (`node_modules/.pnpm/@sveltejs+kit@2.69.1.../runtime/app/state/` exists). `@axe-core/playwright@4.12.1` version/axe-parity taken from the Phase-1 STACK.md registry lookup (HIGH).

## Architecture Patterns

### Recommended Project Structure
```
src/
├── routes/
│   ├── +layout.ts                 # (exists) prerender=true, trailingSlash='always'
│   ├── +layout.svelte             # EXTEND: skip links + <Nav/> + <main id="main"> + <footer>
│   ├── +page.svelte               # REPLACE placeholder: Home (Hero+Mission+ServicesOverview+CTA)
│   ├── services/+page.svelte      # NEW: ServicesDetail
│   ├── about/+page.svelte         # NEW: About
│   ├── contact/+page.svelte       # NEW: Contact
│   └── accessibility/+page.svelte # NEW: Accessibility Statement
├── lib/
│   ├── content/                   # (exists) the barrel — consume, do not modify
│   ├── components/
│   │   ├── ModeToggle.svelte       # (exists) DO NOT unmount / keep aria-live intact
│   │   ├── Nav.svelte              # NEW: primary nav + mobile disclosure (A11Y-04)
│   │   ├── SkipLinks.svelte        # NEW: to #main + #nav (A11Y-01)
│   │   ├── Seo.svelte              # OPTIONAL: <svelte:head> wrapper reading `seo`
│   │   └── sections/
│   │       ├── Hero.svelte
│   │       ├── Mission.svelte
│   │       ├── ServicesOverview.svelte
│   │       ├── ServicesDetail.svelte
│   │       ├── About.svelte
│   │       ├── SocialProof.svelte
│   │       └── Contact.svelte
│   └── tokens/                     # (exists) --color-* + add layout tokens if needed
```
**Rationale:** Routes are thin (set `<svelte:head>` + compose sections); sections are presentational and barrel-driven; `Nav`/`SkipLinks` are chrome in the layout. This keeps a single `<h1>` per route (owned by the route or its lead section) and makes each section independently testable in the `client` Vitest project.

### Pattern 1: Skip links (A11Y-01) — must actually move focus
Skip links must be the **first focusable elements** in the DOM, visually hidden until focused, and their targets must be **programmatically focusable** (native `<main>`/`<nav>` are not focusable by default — add `tabindex="-1"`).

```svelte
<!-- SkipLinks.svelte — rendered FIRST in +layout.svelte, before the header -->
<a class="skip-link" href="#main">Skip to main content</a>
<a class="skip-link" href="#nav">Skip to navigation</a>

<style>
  .skip-link {
    position: absolute;
    left: 0.5rem;
    top: -3rem;                 /* off-screen until focused */
    z-index: 100;
    padding: 0.5rem 0.75rem;
    background: var(--color-surface);
    color: var(--color-link);
    border: 2px solid var(--color-focus-ring);
    border-radius: 0.375rem;
    transition: top 120ms ease;
  }
  .skip-link:focus { top: 0.5rem; }   /* becomes visible on keyboard focus */
  @media (prefers-reduced-motion: reduce) { .skip-link { transition: none; } }
</style>
```
```svelte
<!-- +layout.svelte skeleton -->
<SkipLinks />
<header class="site-header">
  <nav id="nav" aria-label="Primary"> <Nav /> </nav>
  <ModeToggle />           <!-- KEEP: unconditional, aria-live intact -->
</header>
<main id="main" tabindex="-1">
  {@render children()}
</main>
<footer>…{footer.copyright}…</footer>
```
**Critical:** the `#main`/`#nav` targets need `tabindex="-1"` or the browser jumps the scroll but leaves focus behind (fails keyboard-walkthrough QA-03 and A11Y-01 intent). With `trailingSlash: 'always'`, in-page `#hash` links are fine — they don't touch the router.

### Pattern 2: Primary Nav + mobile disclosure (A11Y-04, A11Y-05) — runes, no library
The primary nav is a flat list of 5 items on desktop. On mobile it collapses behind a **disclosure button** — that button is the A11Y-04 target: it exposes `aria-expanded` and closes on Escape and blur (focus leaving the nav).

```svelte
<!-- Nav.svelte -->
<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';      // Svelte-5 replacement for $app/stores (SvelteKit 2.12+)
  import { nav } from '$lib/content';

  let open = $state(false);
  let navEl: HTMLElement | undefined = $state();

  // trailingSlash:'always' → normalize before comparing for the active item
  const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);
  const current = $derived(strip(page.url.pathname.replace(base ?? '', '') || '/'));

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) { open = false; toggleBtn?.focus(); }
  }
  function onFocusout(e: FocusEvent) {
    // close when focus leaves the whole nav (blur requirement)
    if (open && navEl && !navEl.contains(e.relatedTarget as Node)) open = false;
  }
  let toggleBtn: HTMLButtonElement | undefined = $state();
</script>

<div bind:this={navEl} onkeydown={onKeydown} onfocusout={onFocusout}>
  <button
    bind:this={toggleBtn}
    type="button"
    class="nav-toggle"
    aria-expanded={open}
    aria-controls="nav-menu"
    onclick={() => (open = !open)}
  >
    <span class="visually-hidden">Menu</span>
    <!-- inline SVG hamburger, aria-hidden -->
  </button>

  <ul id="nav-menu" class="nav-menu" data-open={open}>
    {#each nav as item (item.route)}
      <li>
        <a
          href={resolve(item.route)}
          aria-current={current === strip(item.route) ? 'page' : undefined}
        >{item.label}</a>
      </li>
    {/each}
  </ul>
</div>
```
Notes:
- **`aria-current="page"`** marks the active route for SR + styling (WCAG 2.4.8 orientation; not color-only).
- The disclosure is only *needed* for mobile, but the button can be CSS-hidden on wide viewports (`@media (min-width: 48rem){ .nav-toggle{display:none} .nav-menu{ /* always visible */ } }`). Ensure the menu is visible on desktop **regardless of `open`** so keyboard users on desktop never depend on the toggle.
- **`import { base } from '$app/paths'`** is needed for the pathname normalization above (added to the import).
- Do **not** trap focus inside the menu for a simple disclosure (that pattern is for modal menubars); Escape-to-close + focus-out-to-close is the APG "Disclosure (Show/Hide)" pattern and satisfies A11Y-04.

### Pattern 3: Route page = head + composed sections (SECT-01/02/03/06)
```svelte
<!-- src/routes/services/+page.svelte -->
<script lang="ts">
  import { seo } from '$lib/content';
  import ServicesDetail from '$lib/components/sections/ServicesDetail.svelte';
  const meta = seo.services;
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
</svelte:head>

<h1>Services</h1>
<ServicesDetail />
```
- Each route owns exactly one `<h1>`. Sections render `<h2>`/`<h3>`. Baking `<title>`/description into `<svelte:head>` is prerendered by adapter-static — **no head library** (already the Phase-2 decision for SEO).

### Pattern 4: Content-driven section (SECT-02) — sections as labelled regions
```svelte
<!-- ServicesDetail.svelte -->
<script lang="ts">
  import { services } from '$lib/content';
</script>

<ul class="service-list">
  {#each services as s (s.id)}
    <li>
      <section aria-labelledby={`svc-${s.id}`}>
        <h2 id={`svc-${s.id}`}>{s.title}</h2>
        <p>{s.summary}</p>
      </section>
    </li>
  {/each}
</ul>
```

### Pattern 5: Pending-slot rendering (SECT-04, SECT-03 mission, SECT-05 social) — branch on `status`
The barrel exposes `Slot<T> = Published<T> | ContentPending`. Narrow on `status` — this is compile-checked (`.attribution`/`.url` only exist on the published arm) and is the anti-fabrication guarantee made visible:
```svelte
<!-- SocialProof.svelte -->
<script lang="ts">
  import { engagements, testimonials } from '$lib/content';
</script>

<section aria-labelledby="proof-h">
  <h2 id="proof-h">Recent work</h2>
  <ul>
    {#each engagements as e}
      {#if e.status === 'published'}
        <li>
          <h3>{e.title}</h3>
          <p>{e.partner}</p>
          <p class="attribution">{e.attribution}</p>
        </li>
      {/if}
    {/each}
  </ul>

  {#if testimonials.every((t) => t.status === 'pending')}
    <!-- Honest, non-fabricated placeholder (CONT-03) -->
    <p class="pending" role="note">Client testimonials are coming soon.</p>
  {/if}
</section>
```
For `socialLinks` (SECT-05): render a real `<a href>` only when `link.status === 'published'`; render a pending platform as **plain text (no anchor)** so there is no dead/`#` link. For `about.mission` (SECT-03): if `pending`, omit or show a neutral note — never invent a mission statement.

### Pattern 6: Contact mailto (SECT-05)
```svelte
<script lang="ts">
  import { contact, socialLinks } from '$lib/content';
  const href = `mailto:${contact.email}?subject=${encodeURIComponent(contact.mailtoSubject)}`;
</script>

<a class="cta" {href}>{contact.ctaLabel}</a>   <!-- "Let's Connect" -->
```
Descriptive text comes from `contact.ctaLabel`; each social link's accessible name comes from `socialLinks[].label` (e.g. "Eman Rimawi on LinkedIn") — satisfies A11Y-03 automatically.

### Pattern 7: Responsive + 200% zoom (SECT-07, A11Y-07)
- **rem everywhere for type/spacing.** Never set body text in `px`. Use `clamp()` for fluid headings: `font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);`.
- **No fixed-width or fixed-height text containers.** Use `max-width` in `ch`/`rem` (`max-width: 65ch` for measure) and let height be content-driven so text can grow without clipping (WCAG 1.4.4 Resize Text).
- **Reflow to a single column at 320px CSS width** (= 1280px viewport @ 400% / typical 200% on a laptop). Mobile-first: base styles are single-column; `@media (min-width: 48rem)` adds grid columns. This satisfies WCAG 1.4.10 Reflow (no 2-D scroll at 320px).
- Viewport meta is already correct (`width=device-width, initial-scale=1`, no `user-scalable=no`) in `app.html` — **do not add `maximum-scale` or `user-scalable=no`** (that would fail A11Y-07).
- Use CSS Grid/flex with `gap`; avoid absolute positioning for content flow.

### Anti-Patterns to Avoid
- **`outline: none` / removing focus rings** — global `:focus-visible` ring is in `app.css`; never override it to none (fails A11Y-05, WCAG 2.4.7).
- **`<div onclick>` as a button/link** — use native `<a>`/`<button>`; svelte-check will flag it and it breaks keyboard operability.
- **Hard-coded copy in components** — always import from `$lib/content` (CONT-01/02). A duplicated string is the one thing the whole architecture exists to prevent.
- **Raw hex in component `<style>`** — use `--color-*` tokens so contrast stays gated.
- **`#`-href or disabled anchors for pending social links** — render pending as text, not a dead link (A11Y-03 + honesty).
- **Static top-level `import … from '$lib/premium/…'`** — lint error; and it would pull WebGL into the accessible bundle (A11Y-08). Nothing in this phase touches premium.
- **`$app/stores` (`import { page } from '$app/stores'`)** — deprecated in SvelteKit 2.12+; use `$app/state` (`import { page } from '$app/state'`) which is available in the installed 2.69.1 and is the runes-friendly API.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Base-aware internal URLs | Manual string concat of `base + route` | `resolve()` from `$app/paths` | Already the locked pattern; handles base + trailingSlash correctly, 404-safe on Pages |
| Active-route detection | Manual `location.pathname` parsing/subscription | `page` from `$app/state` (`page.url.pathname`) | Runes-native, SSR/prerender-safe, no store subscription boilerplate |
| Per-page `<title>`/meta | A head-management library | `<svelte:head>` reading `seo` | Prerendered into static HTML for free; Phase-2 decision |
| Screen-reader-only text | New CSS each time | The existing `.visually-hidden` utility in `app.css` | Already defined and used by ModeToggle; reuse it |
| Focus ring | Per-component focus styling | Global `:focus-visible` in `app.css` | One consistent ring; already token-colored |
| WCAG rule checking | A custom a11y linter | `svelte-check` + `@axe-core/playwright` (`wcag22aa`) | Mature rule sets; custom checks would miss edge cases |

**Key insight:** The disclosure menu is the ONE piece of custom interactivity, and it is genuinely ~20 lines of runes (open flag + Escape + focus-out). A headless-menu library (Melt UI, Bits UI) would add dependency weight to the *accessible baseline* to solve a problem the native disclosure pattern already solves. Hand-roll the disclosure; do not hand-roll URL/head/focus/a11y-linting.

## Common Pitfalls

### Pitfall 1: Skip link that scrolls but doesn't move focus
**What goes wrong:** `<a href="#main">` jumps the viewport but keyboard focus stays on the link; the next Tab returns to the header, defeating the skip.
**Why:** `<main>` isn't focusable by default.
**How to avoid:** `tabindex="-1"` on `#main` and `#nav`. Verify in Playwright: after activating the skip link, `document.activeElement` is `#main`.
**Warning sign:** E2E shows `activeElement` still in the header after Enter on the skip link.

### Pitfall 2: Active-nav comparison broken by `trailingSlash: 'always'`
**What goes wrong:** `page.url.pathname` is `/services/` (trailing slash) and includes the `base` subpath (`/diversityincludesdisability_two/services/`), so a naive `=== item.route` (`/services`) never matches.
**Why:** base prefix + trailing slash.
**How to avoid:** Strip `base` and the trailing slash before comparing (see Pattern 2 `strip()`), or compare against `resolve(item.route)`.
**Warning sign:** No nav item ever shows `aria-current="page"`.

### Pitfall 3: `svelte-check` a11y warnings treated as non-blocking
**What goes wrong:** Svelte emits a11y warnings (e.g. `a11y_no_redundant_roles`, `a11y_label_has_associated_control`, `a11y_missing_attribute`) but the build/CI ignores warnings, so violations ship.
**Why:** `pnpm check` reports warnings; they must be a gate.
**How to avoid:** Treat any Svelte a11y warning as a phase-blocking failure (0 warnings, as Phase 3 achieved: "`pnpm check` → 0 errors, 0 warnings"). Fix the markup, don't suppress.
**Warning sign:** `svelte-check` output shows non-zero a11y warnings.

### Pitfall 4: Destroying the ModeToggle `aria-live` region while building the nav
**What goes wrong:** Refactoring the header wraps `<ModeToggle>` in an `{#if}` or replaces it, unmounting the colocated `aria-live` announcer; mode-change announcements go silent (regresses MODE-05).
**Why:** The live region only announces if it was already in the DOM before the change.
**How to avoid:** Keep `<ModeToggle />` rendered unconditionally in the header; build nav as siblings around it (explicit Phase-3 handoff note).
**Warning sign:** The Phase-3 aria-live E2E/component spec fails after nav work.

### Pitfall 5: Heading hierarchy drift across composed sections
**What goes wrong:** A section component ships its own `<h1>`, so a page ends up with two `<h1>`s, or a section jumps `h2`→`h4`.
**Why:** Sections are reused and authored independently.
**How to avoid:** Convention — route pages own the single `<h1>`; section components start at `<h2>`. axe `heading-order` + `page-has-heading-one` and svelte-check catch it.
**Warning sign:** axe reports `heading-order` or multiple `h1`.

### Pitfall 6: Inline styles / raw hex creeping in (the current placeholder does this)
**What goes wrong:** `src/routes/+page.svelte` currently uses inline `style="…"` with `var(--…)` and even a raw token var; copying that style into new sections scatters presentation and risks non-token colors.
**Why:** Placeholder was a Phase-1 deploy smoke page.
**How to avoid:** Replace the placeholder entirely; put styles in scoped `<style>` blocks using `--color-*` tokens. No raw hex, no inline color.
**Warning sign:** `check-contrast` can't reason about a color because it's inline/raw.

### Pitfall 7: A non-essential transition sneaking into the accessible baseline (A11Y-08)
**What goes wrong:** A hover/scroll animation or `transition` is added for polish; it counts as non-essential motion in the mode whose contract is "no non-essential motion."
**Why:** Motion is easy to add in CSS.
**How to avoid:** Keep the accessible mode motion-free except essential affordances; wrap any transition in `@media (prefers-reduced-motion: reduce){ transition:none }` AND keep it essential-only. The skip-link slide is borderline-essential (reveals the control) and is reduced-motion-guarded — acceptable; decorative scroll/parallax is not.
**Warning sign:** A `@keyframes`/`transition` with no functional purpose in a section component.

## Code Examples

### Verified: `resolve()` for internal links (already in the repo)
```svelte
<!-- Source: src/routes/+page.svelte (Phase 1) + $app/paths docs -->
<script lang="ts">
  import { resolve } from '$app/paths';
</script>
<a href={resolve('/about')}>About Eman Rimawi</a>
```

### Verified: `$app/state` page for active nav (SvelteKit 2.69.1 runtime confirmed present)
```svelte
<script lang="ts">
  import { page } from '$app/state';       // NOT $app/stores (deprecated)
  const path = $derived(page.url.pathname); // reactive, no $ store prefix
</script>
```

### Recommended: axe WCAG 2.2 AA scan in a per-page E2E (Wave-0)
```ts
// tests/a11y.e2e.ts  — Source: @axe-core/playwright README + WCAG tag docs
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = 'http://localhost:4173/diversityincludesdisability_two';
for (const path of ['/', '/services/', '/about/', '/contact/', '/accessibility/']) {
  test(`axe WCAG 2.2 AA: ${path}`, async ({ page }) => {
    await page.goto(BASE + path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```
*(URLs carry the base subpath + trailing slash, mirroring the Phase-3 `tests/mode.e2e.ts` convention.)*

### Recommended: keyboard skip-link E2E
```ts
// Source: pattern from tests/mode.e2e.ts (Phase 3)
test('skip link moves focus to main (A11Y-01)', async ({ page }) => {
  await page.goto(BASE + '/');
  await page.keyboard.press('Tab');                 // first focusable = skip link
  await expect(page.locator('a.skip-link:focus')).toBeVisible();
  await page.keyboard.press('Enter');
  const id = await page.evaluate(() => document.activeElement?.id);
  expect(id).toBe('main');
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import { page } from '$app/stores'` + `$page` | `import { page } from '$app/state'` + `page.url…` | SvelteKit 2.12 (Dec 2024) | Runes-native, no `$`-prefix subscription; `$app/stores` is deprecated. Use `$app/state`. |
| Svelte 4 `export let` + reactive `$:` | Svelte 5 `$props()` / `$state` / `$derived` | Svelte 5 (2024) | Section components use `$props()`; disclosure uses `$state`. Repo is runes-mode. |
| WCAG 2.1 target | **WCAG 2.2 AA** (adds 2.4.11 Focus Not Obscured, 2.5.8 Target Size min 24px, 3.3.7 Redundant Entry, 3.3.8 Accessible Auth) | WCAG 2.2 Rec, Oct 2023 | axe `wcag22aa` tag covers the automatable ones; ModeToggle already honors 2.5.8 (24px). Ensure sticky header doesn't obscure focused elements (2.4.11) — keep header short / add `scroll-margin-top` on focus targets. |
| Menu libraries for nav | Native WAI-ARIA **Disclosure (Show/Hide)** pattern | Stable | A flat nav + mobile disclosure needs no library. |

**Deprecated/outdated:**
- `$app/stores` — replaced by `$app/state` (do not introduce it here).
- Any "accessible 3D" idea — out; accessible mode is a true zero-WebGL peer.

**Note (WCAG 2.2 2.4.11 Focus Not Obscured):** the header is `position: sticky; top: 0`. When a keyboard user tabs to content near the top, the sticky header can cover the focused element. Mitigate by adding `scroll-margin-top: <header-height>` to focusable content (or `scroll-padding-top` on the scroll container) so focused elements scroll clear of the header.

## Open Questions

1. **Hero visual for accessible mode**
   - What we know: Premium hero is a WebGL scene (Phase 5). Accessible mode must present an equivalent, zero-WebGL hero (headline + intro + CTA), per CONT-02 parity.
   - What's unclear: whether a hero image is desired. No optimized image asset exists in `static/` yet; PROJECT mentions `@sveltejs/enhanced-img` as optional.
   - Recommendation: Ship a **text/CSS hero** (site.tagline / about.intro + primary CTA) for Phase 4 — no image dependency, guaranteed accessible. If a headshot is added later it needs real alt text; do not block Phase 4 on an asset.

2. **Whether to add `@axe-core/playwright` now vs. Phase 6**
   - What we know: The formal both-mode axe gate is Phase 6 (QA-01). It is not yet installed.
   - What's unclear: appetite for adding a dev dep mid-phase.
   - Recommendation: Add it in Wave 0 and run per-page in accessible mode now. It is the cheapest possible regression guard for the exact requirements this phase delivers, and Phase 6 then just extends it to Premium mode. Low risk, high value.

3. **Footer scope**
   - What we know: `footer.copyright` exists in the barrel; nav has 5 items.
   - What's unclear: whether the footer should repeat nav / social links.
   - Recommendation: Minimal footer (copyright + maybe a secondary nav list). Keep social links in the Contact section (single source) to avoid a second pending-slot rendering site. Planner's discretion.

## Validation Architecture

*(nyquist_validation is enabled in `.planning/config.json` — section included.)*

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.9 (two projects: `client` = Playwright-browser Chromium; `server` = node) + Playwright 1.61 for E2E |
| Config file | `vite.config.ts` (Vitest projects), `playwright.config.ts` (E2E; `webServer` builds+previews under `BASE_PATH=/diversityincludesdisability_two`) |
| Quick run command | `pnpm exec vitest run --project client src/lib/components` |
| Full suite command | `pnpm check && pnpm exec vitest run && pnpm exec playwright test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SECT-01 | Home renders hero+mission+services+CTA from barrel | component | `pnpm exec vitest run --project client src/lib/components/sections/Hero.svelte.spec.ts` | ❌ Wave 0 |
| SECT-02 | 4 service pillars render, each an h2 region | component | `pnpm exec vitest run --project client src/lib/components/sections/ServicesDetail.svelte.spec.ts` | ❌ Wave 0 |
| SECT-03 | About renders bio paragraphs; pending mission not fabricated | component | `pnpm exec vitest run --project client src/lib/components/sections/About.svelte.spec.ts` | ❌ Wave 0 |
| SECT-04 | Published MBP engagement shown; pending testimonials marked | component | `pnpm exec vitest run --project client src/lib/components/sections/SocialProof.svelte.spec.ts` | ❌ Wave 0 |
| SECT-05 | mailto href built from barrel; published social = `<a>`, pending = text | component | `pnpm exec vitest run --project client src/lib/components/sections/Contact.svelte.spec.ts` | ❌ Wave 0 |
| SECT-06 | /accessibility route renders statement + is in nav | e2e | `pnpm exec playwright test tests/pages.e2e.ts` | ❌ Wave 0 |
| SECT-07 | reflow at 320px, no horizontal scroll | e2e (viewport) | `pnpm exec playwright test tests/reflow.e2e.ts` | ❌ Wave 0 |
| A11Y-01 | skip link moves focus to `#main` | e2e (keyboard) | `pnpm exec playwright test tests/a11y-keyboard.e2e.ts` | ❌ Wave 0 |
| A11Y-02 | single h1, ordered headings | axe + component | `pnpm exec playwright test tests/a11y.e2e.ts` (axe `heading-order`, `page-has-heading-one`) | ❌ Wave 0 |
| A11Y-03 | descriptive link names, no "click here" | axe + component | axe `link-name` in `tests/a11y.e2e.ts` | ❌ Wave 0 |
| A11Y-04 | disclosure `aria-expanded` toggles; Escape + focus-out close | component | `pnpm exec vitest run --project client src/lib/components/Nav.svelte.spec.ts` | ❌ Wave 0 |
| A11Y-05 | all interactive elements keyboard-operable + visible focus | e2e (keyboard) | `tests/a11y-keyboard.e2e.ts` | ❌ Wave 0 |
| A11Y-07 | usable at 200% zoom / resized text | e2e (viewport/reflow) | `tests/reflow.e2e.ts` (320px width, assert no `scrollWidth > clientWidth`) | ❌ Wave 0 |
| A11Y-08 | zero WebGL, no non-essential motion | lint + static | `pnpm exec eslint .` (no-restricted-imports guard) + grep build output for `three` (Phase-6 network assert defers) | ✅ ESLint guard exists |
| — | Svelte compile-time a11y warnings clean | typecheck | `pnpm check` (must be 0 warnings) | ✅ script exists |

### Sampling Rate
- **Per task commit:** `pnpm check` (0 warnings) + the touched component's `client` spec.
- **Per wave merge:** `pnpm exec vitest run` (both projects) + `pnpm exec playwright test` (pages + a11y + keyboard).
- **Phase gate:** Full suite green + `@axe-core/playwright` WCAG 2.2 AA = 0 violations on all 5 routes + `pnpm exec eslint .` clean, before `/gsd:verify-work`. Manual residual: one keyboard-only + one screen-reader walkthrough of every page (formalized as QA-03 in Phase 6, but smoke it here since the Core Value is declared met).

### Wave 0 Gaps
- [ ] `pnpm add -D @axe-core/playwright` (v4.12.1) — the only missing dependency; enables the WCAG 2.2 AA gate.
- [ ] `src/routes/{services,about,contact,accessibility}/+page.svelte` — routes do not exist yet (only `/` placeholder).
- [ ] Replace `src/routes/+page.svelte` placeholder (inline-styled) with the real Home composition.
- [ ] `src/lib/components/{SkipLinks,Nav,Seo?}.svelte` + `src/lib/components/sections/*.svelte` — none exist.
- [ ] Extend `src/routes/+layout.svelte`: add SkipLinks + `<nav id="nav">`+`<Nav/>` + `<main id="main" tabindex="-1">` + footer, **keeping `<ModeToggle/>` unconditional**.
- [ ] Test files: `tests/a11y.e2e.ts`, `tests/a11y-keyboard.e2e.ts`, `tests/reflow.e2e.ts`, `tests/pages.e2e.ts`, and `*.svelte.spec.ts` per section (client project) + `Nav.svelte.spec.ts` (disclosure keyboard).
- [ ] Optional layout tokens (spacing scale / measure) in `src/lib/tokens/` if the sections need shared spacing vars beyond the color tokens.

## Sources

### Primary (HIGH confidence)
- Repo inspection: `package.json`, `svelte.config.js`, `vite.config.ts`, `playwright.config.ts`, `eslint.config.js`, `src/app.html`, `src/app.css`, `src/routes/+layout.{svelte,ts}`, `src/routes/+page.svelte`, all `src/lib/content/*`, `src/lib/tokens/*`, `src/lib/components/ModeToggle.svelte`, `src/lib/mode/*`, `tests/mode.e2e.ts` — the ground truth for stack + patterns already established.
- Installed SvelteKit 2.69.1 runtime tree confirms `$app/state` is available (`.../runtime/app/state/`).
- `.planning/` docs: PROJECT.md, ROADMAP.md, REQUIREMENTS.md, STATE.md, Phase 2/3 SUMMARY + Phase 3 RESEARCH — locked decisions, requirement text, handoffs.
- WAI-ARIA Authoring Practices — Disclosure (Show/Hide) pattern (`aria-expanded`, Escape/focus-out close) — the A11Y-04 basis.
- WCAG 2.2 Understanding docs: 1.4.4 Resize Text, 1.4.10 Reflow (320px), 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.5.8 Target Size — the A11Y-07/05 basis.

### Secondary (MEDIUM confidence)
- Phase-1 STACK.md registry lookups for `@axe-core/playwright@4.12.1` (bundles `axe-core@4.12.1`, WCAG 2.2 rule sets) — not re-verified against npm this phase; it is not yet installed.
- `ui-ux-pro-max` skill (v2.5.0) Accessibility/Layout/Typography quick-reference — used for layout/type/spacing/a11y heuristics (note: its stack scripts target React Native; only the framework-agnostic principles apply here).

### Tertiary (LOW confidence)
- None. All load-bearing claims are grounded in the repo or W3C specs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — read directly from the pinned repo; adds only one well-known dev dep.
- Architecture: HIGH — extends existing, already-working Phase-1/2/3 patterns (barrel, `resolve()`, tokens, sticky header, runes store).
- Pitfalls: HIGH — most are drawn from the repo's own Phase-3 notes (trailing-slash, aria-live, base path) and W3C-specified failure modes.
- Accessibility statement conventions: MEDIUM — GOV.UK/scope.org.uk model is well-established but the exact copy is content-dependent (Eman's confirmation for contact/date/known-issues).

**Accessibility Statement conventions (SECT-06):** a credible WCAG 2.2 AA statement (GOV.UK / scope.org.uk model) should contain: (1) commitment/scope ("this website"), (2) conformance status — "conforms to WCAG 2.2 level AA", (3) what's accessible / measures taken (semantic HTML, keyboard operable, zero-WebGL accessible mode as a true peer, contrast-checked palette), (4) known limitations / non-accessible content (e.g. Premium 3D mode is an enhancement; some social handles pending), (5) feedback + contact mechanism (`emanrimawi@gmail.com` — reuse `contact` from the barrel), (6) how it was assessed (self-assessment + automated axe WCAG 2.2 AA + keyboard/SR testing), (7) preparation/review date. Source copy from the barrel where it overlaps contact; the statement body can be a new typed content module OR authored in the route — planner's discretion, but keep contact details barrel-sourced (CONT-01).

**Research date:** 2026-07-05
**Valid until:** 2026-08-04 (30 days — stable pinned stack; only volatile item is the `@axe-core/playwright` version, worth a `npm view` at install time)
