---
phase: 04-accessible-section-components
plan: 01
type: tdd
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - src/lib/components/SkipLinks.svelte
  - src/lib/components/Nav.svelte
  - src/lib/components/Nav.svelte.spec.ts
  - src/routes/+layout.svelte
  - src/app.css
autonomous: true
requirements: [A11Y-01, A11Y-03, A11Y-04, A11Y-05, SECT-07]

must_haves:
  truths:
    - "The first two focusable elements on every page are 'Skip to main content' and 'Skip to navigation' links, visually hidden until focused (A11Y-01)"
    - "Activating the skip links moves focus to #main / #nav (targets carry tabindex=-1 and scroll-margin-top so the sticky header does not obscure them) (A11Y-01, WCAG 2.4.11)"
    - "The primary nav renders all five barrel routes as descriptive links via resolve() from $app/paths, with aria-current='page' on the active route (A11Y-03)"
    - "On narrow viewports the nav collapses behind a disclosure button exposing aria-expanded; Escape and focus leaving the nav both close it and Escape returns focus to the toggle (A11Y-04)"
    - "All nav interaction is native <a>/<button> and keyboard-operable with the existing :focus-visible ring (A11Y-05)"
    - "The header hosts the nav AND the existing <ModeToggle/> rendered unconditionally (no {#if}) so its aria-live region survives (MODE-05 regression guard)"
    - "The layout exposes <main id='main' tabindex='-1'> and a footer sourced from footer.copyright; the whole shell reflows to one column at 320px (SECT-07)"
  artifacts:
    - path: "src/lib/components/SkipLinks.svelte"
      provides: "Two skip links (#main, #nav) visually-hidden-until-focus"
      contains: "href=\"#main\""
    - path: "src/lib/components/Nav.svelte"
      provides: "Primary nav + runes mobile disclosure (aria-expanded, Escape/focus-out close, aria-current)"
      contains: "aria-expanded"
      min_lines: 40
    - path: "src/lib/components/Nav.svelte.spec.ts"
      provides: "Client(browser) spec: renders 5 links, aria-expanded toggles, Escape + focus-out close"
      min_lines: 40
    - path: "src/routes/+layout.svelte"
      provides: "Shell: SkipLinks + <nav id='nav'><Nav/> + <ModeToggle/> (unconditional) + <main id='main' tabindex='-1'> + footer"
      contains: "id=\"main\""
    - path: "src/app.css"
      provides: ".skip-link styles + scroll-margin-top on focus targets + responsive shell tokens"
      contains: "skip-link"
  key_links:
    - from: "src/lib/components/Nav.svelte"
      to: "$lib/content (nav) + $app/paths (resolve) + $app/state (page)"
      via: "import { nav }, resolve(item.route), page.url.pathname"
      pattern: "from '\\$lib/content'"
    - from: "src/routes/+layout.svelte"
      to: "src/lib/components/{SkipLinks,Nav}.svelte + ModeToggle.svelte"
      via: "import + render in header/main"
      pattern: "Nav"
---

<objective>
Build the accessibility chrome and primary navigation that every page depends on, and add the one missing
dev dependency (`@axe-core/playwright`). This lands `SkipLinks.svelte` (two skip links whose targets are
programmatically focusable), `Nav.svelte` (a flat five-item primary nav with a runes-driven mobile
disclosure that is the A11Y-04 target), and extends `+layout.svelte` into the real shell: skip links →
sticky header hosting `<nav id="nav">`+`<Nav/>` and the existing `<ModeToggle/>` (kept unconditional) →
`<main id="main" tabindex="-1">` → footer. All internal links use `resolve()` from `$app/paths`; active-nav
detection strips `base` + trailing slash; skip targets get `tabindex="-1"` + `scroll-margin-top`.

Purpose: A11Y-01 (skip links move focus), A11Y-04 (disclosure aria-expanded + Escape/blur close), A11Y-03
(descriptive nav link text from the barrel), A11Y-05 (keyboard-operable native controls), SECT-07 (responsive
shell + mobile disclosure). Foundation that all Wave-2 page plans compose into.

Output: `@axe-core/playwright` installed; `src/lib/components/{SkipLinks,Nav}.svelte` + `Nav.svelte.spec.ts`;
extended `src/routes/+layout.svelte`; skip-link + responsive CSS in `src/app.css`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/04-accessible-section-components/04-RESEARCH.md
@.planning/phases/04-accessible-section-components/04-VALIDATION.md
@src/routes/+layout.svelte
@src/lib/components/ModeToggle.svelte
@src/app.css

<interfaces>
<!-- Barrel exports the executor consumes (from src/lib/content/index.ts) — use directly, do not explore. -->
From $lib/content (src/lib/content/site.ts):
```typescript
export const nav: readonly { route: string; label: string }[] = [
  { route: '/', label: 'Home' },
  { route: '/services', label: 'Services' },
  { route: '/about', label: 'About' },
  { route: '/contact', label: 'Contact' },
  { route: '/accessibility', label: 'Accessibility Statement' }
];
export const site: { name: string; founder: string; legalName: string; tagline: string };
export const footer: { copyright: string }; // "© <year> Eman Rimawi-Doster"
```
SvelteKit primitives (installed 2.69.1):
```typescript
import { resolve, base } from '$app/paths';   // base-aware links; base = '/diversityincludesdisability_two'
import { page } from '$app/state';             // NOT $app/stores (deprecated); page.url.pathname is reactive
```
Locked CSS tokens available in src/lib/tokens/tokens.css (use these, never raw hex):
  --color-text --color-link --color-heading --color-accent --color-accent-border --color-focus-ring --color-surface
Existing app.css utilities: `.visually-hidden` (SR-only), global `:focus-visible { outline: 2px solid var(--color-focus-ring); }`.
NOTE: `--color-surface-muted` does NOT exist — only referenced with a fallback in ModeToggle. Do not rely on it.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install @axe-core/playwright + SkipLinks.svelte + responsive/skip CSS</name>
  <files>package.json, pnpm-lock.yaml, src/lib/components/SkipLinks.svelte, src/app.css</files>
  <read_first>
    - src/app.css (existing globals: .visually-hidden, :focus-visible, mode hooks — extend, do not overwrite)
    - src/routes/+layout.svelte (current shell to be extended in Task 3)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Pattern 1: Skip links" and § "Pattern 7: Responsive + 200% zoom"
  </read_first>
  <action>
    1. Run `pnpm add -D @axe-core/playwright` (resolves 4.12.x, bundles axe-core). This is the only Wave-0 install; it enables the WCAG 2.2 AA gate in plan 04-06. Do NOT add any UI/CSS/menu/icon/animation library.
    2. Create `src/lib/components/SkipLinks.svelte` with exactly two links as the first focusable content:
       ```svelte
       <a class="skip-link" href="#main">Skip to main content</a>
       <a class="skip-link" href="#nav">Skip to navigation</a>
       ```
       No script block needed. Do NOT scope colors here as raw hex.
    3. In `src/app.css`, append (do not remove existing rules):
       - `.skip-link` rule: `position:absolute; left:0.5rem; top:-3rem; z-index:100; padding:0.5rem 0.75rem; background:var(--color-surface); color:var(--color-link); border:2px solid var(--color-focus-ring); border-radius:0.375rem; transition:top 120ms ease;` and `.skip-link:focus{ top:0.5rem; }`.
       - Reduced-motion guard: `@media (prefers-reduced-motion: reduce){ .skip-link{ transition:none; } }` (A11Y-08 — the ONLY motion allowed is this essential control-reveal).
       - WCAG 2.4.11 (Focus Not Obscured) mitigation for the sticky header: `#main, #nav { scroll-margin-top: 4rem; }` and `:target { scroll-margin-top: 4rem; }`.
       - Responsive shell base (SECT-07): a `.site-main{ max-width:70rem; margin-inline:auto; padding:1rem; }` container used by `<main>`, mobile-first (single column by default). Use rem units only; no fixed px widths on text containers.
    Use only `--color-*` tokens; no raw hex; no `outline:none` anywhere.
  </action>
  <acceptance_criteria>
    - `grep -q '@axe-core/playwright' package.json` (dev dependency present) AND `node_modules/@axe-core/playwright` exists.
    - `src/lib/components/SkipLinks.svelte` contains both `href="#main"` and `href="#nav"` and the exact visible text "Skip to main content" / "Skip to navigation".
    - `grep -q 'skip-link' src/app.css` AND `grep -q 'scroll-margin-top' src/app.css` AND `grep -q 'prefers-reduced-motion' src/app.css`.
    - No raw hex added to app.css skip-link rules: `grep -nE '#[0-9a-fA-F]{3,6}' src/app.css` returns only pre-existing lines inside tokens (none in the new .skip-link block).
    - `pnpm check` → 0 errors, 0 a11y warnings.
  </acceptance_criteria>
  <verify>
    <automated>pnpm check</automated>
  </verify>
  <done>@axe-core/playwright installed; SkipLinks.svelte + skip/responsive/scroll-margin CSS present; pnpm check 0/0.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Nav.svelte primary nav + mobile disclosure (RED→GREEN)</name>
  <files>src/lib/components/Nav.svelte, src/lib/components/Nav.svelte.spec.ts</files>
  <read_first>
    - src/lib/content/site.ts (exact `nav` shape + route keys)
    - src/lib/components/ModeToggle.svelte.spec.ts (client-spec conventions: `vitest/browser` page/userEvent, `vitest-browser-svelte` render; note vite.config test.expect.requireAssertions=true)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Pattern 2: Primary Nav + mobile disclosure" (copy the runes disclosure verbatim) and § "Pitfall 2" (active-nav base/trailing-slash strip)
  </read_first>
  <behavior>
    - Renders exactly 5 links, one per `nav` item, with the barrel `label` as text and `href` = `resolve(item.route)`.
    - The disclosure `<button>` starts `aria-expanded="false"`; clicking it flips to `"true"` and back.
    - Pressing Escape while open sets `aria-expanded="false"` and returns focus to the toggle button.
    - Moving focus out of the nav (focusout to a node outside the nav) closes it (`aria-expanded="false"`).
    - The active route link carries `aria-current="page"` (test by mounting at `/` and asserting the Home link).
  </behavior>
  <action>
    Write `src/lib/components/Nav.svelte.spec.ts` FIRST (RED), a client(browser) spec mirroring ModeToggle.svelte.spec.ts conventions:
    - `import { page, userEvent } from 'vitest/browser'`, `import { render } from 'vitest-browser-svelte'`.
    - Assert 5 links via `page.getByRole('link')` count / labels ("Home","Services","About","Contact","Accessibility Statement").
    - Assert the toggle `page.getByRole('button', { name: /menu/i })` starts `aria-expanded="false"`, click → "true".
    - Assert Escape (`userEvent.keyboard('{Escape}')`) closes it and `document.activeElement` is the toggle button.
    - Assert focus-out closes it (focus the toggle, open, then focus a node outside `navEl` and dispatch focusout).
    - Every `it` MUST contain an assertion (requireAssertions is on).
    Then implement `src/lib/components/Nav.svelte` (GREEN) using the RESEARCH Pattern 2 runes code EXACTLY:
    - `import { resolve, base } from '$app/paths'; import { page } from '$app/state'; import { nav } from '$lib/content';`
    - `let open = $state(false); let navEl = $state<HTMLElement>(); let toggleBtn = $state<HTMLButtonElement>();`
    - `const strip = (p) => (p.length > 1 ? p.replace(/\/$/, '') : p);`
    - `const current = $derived(strip(page.url.pathname.replace(base ?? '', '') || '/'));`
    - Root `<div bind:this={navEl} onkeydown={onKeydown} onfocusout={onFocusout}>` with:
      - `<button bind:this={toggleBtn} type="button" class="nav-toggle" aria-expanded={open} aria-controls="nav-menu" onclick={() => (open = !open)}><span class="visually-hidden">Menu</span><span aria-hidden="true" class="nav-toggle__bars"></span></button>`
      - `<ul id="nav-menu" class="nav-menu" data-open={open}>` mapping `nav` → `<li><a href={resolve(item.route)} aria-current={current === strip(item.route) ? 'page' : undefined}>{item.label}</a></li>`
      - `onKeydown`: `if (e.key === 'Escape' && open) { open = false; toggleBtn?.focus(); }`
      - `onFocusout`: `if (open && navEl && !navEl.contains(e.relatedTarget as Node)) open = false;`
    - Scoped `<style>`: mobile-first — `.nav-menu[data-open='false']{ display:none; }` on narrow; `@media (min-width:48rem){ .nav-toggle{ display:none; } .nav-menu{ display:flex; gap:1rem; } }` so DESKTOP always shows the menu regardless of `open` (keyboard users never depend on the toggle). Links use `--color-link`; `[aria-current='page']` styled with weight/underline (NOT color-only). No `outline:none`; no transitions except none-essential.
    Do NOT trap focus (this is the APG Disclosure pattern, not a modal menubar).
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest run --project client src/lib/components/Nav.svelte.spec.ts` passes (all cases GREEN).
    - `grep -q 'aria-expanded' src/lib/components/Nav.svelte` AND `grep -q 'aria-controls=\"nav-menu\"' src/lib/components/Nav.svelte`.
    - `grep -q "from '\\$app/state'" src/lib/components/Nav.svelte` (NOT `$app/stores`) AND `grep -q "from '\\$app/paths'" src/lib/components/Nav.svelte`.
    - `grep -q 'aria-current' src/lib/components/Nav.svelte`.
    - `grep -q "from '\\$lib/content'" src/lib/components/Nav.svelte` (labels/routes from the barrel — no hard-coded nav copy).
    - No `outline:none` in Nav.svelte: `grep -niE 'outline:\s*none' src/lib/components/Nav.svelte` returns nothing.
    - `pnpm check` → 0 errors, 0 a11y warnings.
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run --project client src/lib/components/Nav.svelte.spec.ts</automated>
  </verify>
  <done>Nav.svelte disclosure spec GREEN; aria-expanded toggles, Escape + focus-out close, 5 barrel links with aria-current; pnpm check 0/0.</done>
</task>

<task type="auto">
  <name>Task 3: Extend +layout.svelte into the full accessible shell</name>
  <files>src/routes/+layout.svelte</files>
  <read_first>
    - src/routes/+layout.svelte (current shell — MUST keep `<ModeToggle/>` unconditional, the app.css import, favicon link, `{@render children()}`, and the rAF data-mode-ready unlock)
    - .planning/phases/03-mode-state-system-toggle/03-03-SUMMARY.md § "Pitfall 4 / Next Phase Readiness" (do NOT unmount the aria-live region)
    - src/lib/components/{SkipLinks,Nav}.svelte (built in Tasks 1–2)
  </read_first>
  <action>
    Edit `src/routes/+layout.svelte` to the full shell WITHOUT removing any existing behavior:
    - Add imports: `import SkipLinks from '$lib/components/SkipLinks.svelte'; import Nav from '$lib/components/Nav.svelte';`
    - Render order in the template (SkipLinks MUST be first focusable):
      ```svelte
      <SkipLinks />
      <header class="site-header">
        <nav id="nav" tabindex="-1" aria-label="Primary"><Nav /></nav>
        <ModeToggle />   <!-- KEEP unconditional — do NOT wrap in {#if} -->
      </header>
      <main id="main" tabindex="-1" class="site-main">
        {@render children()}
      </main>
      <footer class="site-footer">{footer.copyright}</footer>
      ```
    - `import { footer } from '$lib/content';` for the copyright line.
    - Keep the existing `onMount(() => requestAnimationFrame(() => document.documentElement.setAttribute('data-mode-ready', '')))` and the favicon `<svelte:head>`.
    - Update `.site-header` styles: keep `position:sticky; top:0; z-index:10; background:var(--color-surface);` but change layout to `display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.5rem 1rem;` so nav sits left, ModeToggle right. Add `.site-footer{ padding:1rem; color:var(--color-text); }`. Keep header height modest so `scroll-margin-top:4rem` clears it (WCAG 2.4.11).
    - `#nav` and `#main` MUST carry `tabindex="-1"` (skip-link focus targets — Pitfall 1).
  </action>
  <acceptance_criteria>
    - `grep -q 'id="main"' src/routes/+layout.svelte` AND `grep -q 'tabindex="-1"' src/routes/+layout.svelte` on both `#main` and `#nav` (2 matches).
    - `grep -q '<ModeToggle' src/routes/+layout.svelte` AND `grep -vq '{#if' src/routes/+layout.svelte` around the ModeToggle (still unconditional — no `{#if}` wrapping it).
    - `grep -q 'SkipLinks' src/routes/+layout.svelte` AND SkipLinks appears before `<header` in file order.
    - `grep -q 'footer.copyright' src/routes/+layout.svelte`.
    - `pnpm exec vitest run --project client src/lib/components/ModeToggle.svelte.spec.ts` still 8/8 GREEN (aria-live region NOT destroyed).
    - `pnpm check` → 0 errors, 0 a11y warnings.
  </acceptance_criteria>
  <verify>
    <automated>pnpm check && pnpm exec vitest run --project client src/lib/components/ModeToggle.svelte.spec.ts</automated>
  </verify>
  <done>Layout renders SkipLinks → header(nav+ModeToggle) → main#main → footer; ModeToggle spec still 8/8; pnpm check 0/0.</done>
</task>

</tasks>

<verification>
- `pnpm check` → 0 errors, 0 a11y warnings.
- `pnpm exec vitest run --project client src/lib/components` → Nav + ModeToggle specs GREEN.
- `pnpm exec eslint .` clean (no `$lib/premium` import introduced — A11Y-08 structural guard intact).
- Manual/wave-merge (deferred to 04-06): skip-link focus move + disclosure Escape/blur under Playwright.
</verification>

<success_criteria>
- Two skip links are the first focusable elements; targets `#main`/`#nav` are focusable (tabindex=-1) with scroll-margin.
- Primary nav renders all 5 barrel routes via resolve(), marks the active route, and collapses to an aria-expanded disclosure that closes on Escape/blur.
- ModeToggle remains unconditionally mounted with its aria-live region intact.
- @axe-core/playwright is installed for the 04-06 gate.
</success_criteria>

<output>
After completion, create `.planning/phases/04-accessible-section-components/04-01-SUMMARY.md`.
</output>
