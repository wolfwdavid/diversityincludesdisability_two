---
phase: 05-premium-3d-layer
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/tokens/colors.ts
  - src/lib/tokens/pairs.ts
  - src/lib/tokens/tokens.css
  - src/app.css
autonomous: true
requirements: [PREM-01]

must_haves:
  truths:
    - "With data-mode='premium' (and no data-webgl='no'), the site shows light-on-dark text: white body/heading text and orange links on the blue900 surface (D-02/D-16)"
    - "Every new dark fg/bg pair is machine-verified by the existing culori WCAG gate — node scripts/check-contrast.mjs exits 0 with the new pairs listed"
    - "Text-bearing content in premium mode sits on an effectively opaque (alpha >= 0.92) night scrim so a Phase-6 axe run has a computable background (Pitfall 6)"
    - "With data-mode='premium' AND data-webgl='no', the skin reverts to the light accessible presentation (Pitfall 5)"
  artifacts:
    - path: "src/lib/tokens/colors.ts"
      provides: "night '#071c33' palette entry + dark-role semantic entries (textOnDark, linkOnDark, surfaceDark, scrim, ...)"
      contains: "night: '#071c33'"
    - path: "src/lib/tokens/pairs.ts"
      provides: "6 new dark-skin contrast pairs gated at AA-normal/AA-ui"
      contains: "bg: 'night'"
    - path: "src/lib/tokens/tokens.css"
      provides: "--did-night mirror + [data-mode='premium']:not([data-webgl='no']) token override block"
      contains: "--did-night: #071c33"
    - path: "src/app.css"
      provides: "premium stacking (z-index 1 shell), per-section scrim panels, immersive hero treatment"
      contains: "data-webgl='no'"
  key_links:
    - from: "src/lib/tokens/tokens.css"
      to: "src/lib/tokens/colors.ts"
      via: "hex values mirrored verbatim (file-header contract)"
      pattern: "#071c33"
    - from: "src/app.css"
      to: "src/lib/tokens/tokens.css"
      via: "var(--color-scrim) defined in the premium token override block"
      pattern: "--color-scrim"
    - from: "scripts/check-contrast.mjs"
      to: "src/lib/tokens/pairs.ts"
      via: "existing gate iterates pairs — new entries auto-gated"
      pattern: "night"
---

<objective>
Build the Premium dark skin and scrim system (D-02, D-15, D-16) as pure token/CSS work — zero 3D
dependency, so it runs in Wave 1 parallel with the state modules. Extends the existing contrast-gated
token system: a deeper `night` hex for scrims, dark-role semantic entries, a
`[data-mode='premium']` CSS custom-property override block, per-section opaque scrim panels, DOM
stacking above the (future) fixed canvas, and the Pitfall-5 `[data-webgl='no']` revert so a
stored-premium visitor on a WebGL-dead browser gets the accessible (light) presentation.

Purpose: PREM-01 — the premium visual shell the 3D world (05-03) renders behind. Contrast is
machine-proved NOW so Phase 6 axe runs inherit no debt (D-15).
Output: extended `colors.ts`/`pairs.ts`/`tokens.css` + premium shell rules in `app.css`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-premium-3d-layer/05-CONTEXT.md
@.planning/phases/05-premium-3d-layer/05-RESEARCH.md
@src/lib/tokens/colors.ts
@src/lib/tokens/pairs.ts
@src/lib/tokens/tokens.css
@src/app.css

<interfaces>
<!-- Current token surface (from src/lib/tokens/colors.ts) — extend, do not restructure. -->
```typescript
export const palette = {
	blue900: '#0b2a4a',
	orange500: '#e8730c',
	orangeDeep: '#c85f08',
	ink: '#12181f',
	white: '#ffffff'
} as const;
export const semantic = { text, link, heading, accent, accentBorder, focusRing, surface } as const;
```
pairs.ts entries are `{ name, fg: keyof palette, bg: keyof palette, level: 'AA-normal'|'AA-large'|'AA-ui' }`.
CRITICAL pairs.ts constraint (from its file header): the palette reference is TYPE-ONLY
(`keyof typeof import('./colors').palette`). Do NOT add a runtime `import { palette } from './colors'` —
check-contrast.mjs loads pairs.ts via Node type-stripping and an extensionless runtime import crashes it.

Verified contrast ratios (culori 4.0.2, from 05-RESEARCH.md Pattern 7 — pre-checked, will pass):
| white on blue900 = 14.54 | orange500 on blue900 = 4.77 | white on #071c33 = 17.17 |
| orange500 on #071c33 = 5.63 | orangeDeep on blue900 = 3.53 (AA-ui only) |

DOM hooks that already exist:
- `<html data-mode='premium'|'accessible'>` stamped pre-paint by app.html head script
- app.css lines 100-106: empty `:root[data-mode='premium']` / `:root[data-mode='accessible']` hook blocks
- Layout shell classes: `.site-header` (sticky, background: var(--color-surface)), `.site-main` (max-width 70rem), `.site-footer`
- Section roots inside .site-main: `<section class="hero">` (h1 + p.lead + a.cta), `<section class="mission">`,
  `<section class="services-overview">`, plus unclassed `<section aria-labelledby=...>` in About/Contact/SocialProof/ServicesDetail
  (ServicesDetail nests `<section>` inside `<section>`)
- `data-webgl` attribute on `<html>` will be set by the 05-03 entry gate ('ok'|'no'); this plan only writes the CSS that keys off it
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Dark-skin tokens — night hex, dark semantic roles, contrast pairs, premium token override</name>
  <files>src/lib/tokens/colors.ts, src/lib/tokens/pairs.ts, src/lib/tokens/tokens.css</files>
  <read_first>
    - src/lib/tokens/colors.ts (current palette/semantic shape + mirror contract in header)
    - src/lib/tokens/pairs.ts (entry shape + the TYPE-ONLY import constraint in its header)
    - src/lib/tokens/tokens.css (mirror contract; current :root block)
    - scripts/check-contrast.mjs (how pairs are loaded — Node type-stripping over .ts)
  </read_first>
  <action>
    1. `src/lib/tokens/colors.ts` — add to `palette` (keep `as const`):
       `night: '#071c33' // premium scrim core; deepest night surface behind text panels (D-02, Pitfall 6)`
       Add dark-role entries to `semantic` (same hexes, inverted application — D-02/D-16):
       ```ts
       // Premium dark-skin roles (Phase 5, D-02/D-16) — light-on-dark application of the same palette
       textOnDark: palette.white,
       linkOnDark: palette.orange500,
       headingOnDark: palette.white,
       accentBorderOnDark: palette.orangeDeep,
       focusRingOnDark: palette.white,
       surfaceDark: palette.blue900,
       scrim: palette.night
       ```
    2. `src/lib/tokens/pairs.ts` — append exactly these 6 entries (expected ratios in comments; NO runtime import added):
       ```ts
       { name: 'body text on premium dark surface', fg: 'white', bg: 'blue900', level: 'AA-normal' }, // 14.54
       { name: 'link/accent on premium dark surface', fg: 'orange500', bg: 'blue900', level: 'AA-normal' }, // 4.77
       { name: 'body text on night scrim', fg: 'white', bg: 'night', level: 'AA-normal' }, // 17.17
       { name: 'link/accent on night scrim', fg: 'orange500', bg: 'night', level: 'AA-normal' }, // 5.63
       { name: 'orange-deep border on premium dark surface', fg: 'orangeDeep', bg: 'blue900', level: 'AA-ui' }, // 3.53
       { name: 'focus ring vs premium dark surface', fg: 'white', bg: 'blue900', level: 'AA-ui' } // 14.54
       ```
    3. `src/lib/tokens/tokens.css` — add `--did-night: #071c33;` to the `:root` raw-hex group (mirror
       contract with colors.ts), then append the premium override block AFTER the existing `:root` block:
       ```css
       /* Premium dark skin (Phase 5, D-02/D-16). Gated :not([data-webgl='no']) so a stored-premium
          visitor on a WebGL-dead browser reverts to the light accessible presentation (Pitfall 5).
          All pairs below are gated by scripts/check-contrast.mjs (see pairs.ts). */
       :root[data-mode='premium']:not([data-webgl='no']) {
       	--color-text: var(--did-white);
       	--color-link: var(--did-orange-500);
       	--color-heading: var(--did-white);
       	--color-accent: var(--did-orange-500);
       	--color-accent-border: var(--did-orange-deep);
       	--color-focus-ring: var(--did-white);
       	--color-surface: var(--did-blue-900);
       	--color-scrim: rgb(7 28 51 / 0.94); /* night @ 0.94 — effectively opaque (Pitfall 6) */
       }
       ```
       Note: 7 28 51 is #071c33 in decimal RGB. Do NOT use a lower alpha than 0.92.
  </action>
  <acceptance_criteria>
    - `grep -q "night: '#071c33'" src/lib/tokens/colors.ts`
    - `grep -q "scrim: palette.night" src/lib/tokens/colors.ts`
    - `grep -c "bg: 'night'" src/lib/tokens/pairs.ts` outputs 2
    - `grep -c "bg: 'blue900'" src/lib/tokens/pairs.ts` outputs 4
    - `grep -q -- "--did-night: #071c33" src/lib/tokens/tokens.css`
    - `grep -q "data-webgl='no'" src/lib/tokens/tokens.css` (the :not() guard is present)
    - pairs.ts still has NO runtime import of colors (`grep -c "^import" src/lib/tokens/pairs.ts` outputs 0)
    - `node scripts/check-contrast.mjs` exits 0 and its output lists all 12 pairs (6 old + 6 new) as PASS
  </acceptance_criteria>
  <verify>
    <automated>node scripts/check-contrast.mjs && pnpm check</automated>
  </verify>
  <done>Contrast gate green over 12 pairs including all 6 dark pairs; tokens.css defines the premium override block behind the :not([data-webgl='no']) guard; svelte-check 0/0.</done>
</task>

<task type="auto">
  <name>Task 2: Premium shell CSS — stacking, per-section scrim panels, immersive hero</name>
  <files>src/app.css</files>
  <read_first>
    - src/app.css (current shell rules: .site-main container, empty premium hook block at lines ~100-106)
    - src/routes/+layout.svelte (shell class names: .site-header/.site-main/.site-footer; header has background: var(--color-surface))
    - src/lib/components/sections/Hero.svelte (root `section.hero` with `h1`, `p.lead`, `a.cta` — the D-13 hero surface)
    - src/lib/components/sections/ServicesDetail.svelte (nested section-in-section — needs the double-scrim reset)
  </read_first>
  <action>
    Fill the currently-empty `:root[data-mode='premium']` hook area in `src/app.css` with the premium
    shell system. Every rule MUST be gated `:root[data-mode='premium']:not([data-webgl='no'])` (Pitfall 5 —
    when the 05-03 gate stamps data-webgl='no', ALL premium styling must vanish, reverting to the light
    accessible presentation). Add exactly this system (adjust only formatting to prettier):

    ```css
    /* ===== Premium mode shell (Phase 5, D-13/D-15/D-16) =====
       The 3D canvas (05-03) is position:fixed at z-index 0; the DOM shell stacks above it.
       Gated :not([data-webgl='no']) so the no-WebGL fallback is the light accessible page. */
    :root[data-mode='premium']:not([data-webgl='no']) .site-header,
    :root[data-mode='premium']:not([data-webgl='no']) .site-main,
    :root[data-mode='premium']:not([data-webgl='no']) .site-footer {
    	position: relative;
    	z-index: 1;
    }

    /* Scrim panels (D-15, Pitfall 6): every top-level section sits on an effectively opaque
       night panel; the world stays visible in inter-section gaps and page gutters. */
    :root[data-mode='premium']:not([data-webgl='no']) .site-main section {
    	background: var(--color-scrim);
    	border-radius: 0.75rem;
    	padding: 1.5rem;
    	margin-block: 1.5rem;
    }
    /* Nested sections (ServicesDetail pillars) inherit the parent panel — no double scrim. */
    :root[data-mode='premium']:not([data-webgl='no']) .site-main section section {
    	background: transparent;
    	padding: 0;
    	margin-block: 0;
    }

    /* Immersive Home hero (D-13): the world fills the first viewport; the headline + CTA
       float above it on tight text-fitting scrims instead of one big panel. */
    :root[data-mode='premium']:not([data-webgl='no']) .site-main section.hero {
    	background: transparent;
    	min-height: calc(100svh - 8rem);
    	display: grid;
    	align-content: center;
    	justify-items: start;
    	gap: 1rem;
    }
    :root[data-mode='premium']:not([data-webgl='no']) .site-main section.hero :is(h1, .lead) {
    	background: var(--color-scrim);
    	padding: 0.5rem 1rem;
    	border-radius: 0.5rem;
    	width: fit-content;
    }
    :root[data-mode='premium']:not([data-webgl='no']) .site-main section.hero .cta {
    	background: var(--did-orange-500);
    	color: var(--did-ink); /* gated pair: ink on orange500 = 5.86 */
    	padding: 0.75rem 1.25rem;
    	border-radius: 0.5rem;
    }
    ```

    Notes:
    - The sticky `.site-header` already uses `background: var(--color-surface)` — in premium it becomes
      opaque blue900 automatically via the Task-1 token remap. Do not restyle it here.
    - Keep the existing empty `:root[data-mode='accessible']` hook block untouched.
    - Do NOT add any transition/animation properties — motion policy is owned by the canvas layer (D-03),
      and the accessible baseline must stay motion-free (A11Y-08).
  </action>
  <acceptance_criteria>
    - `grep -c ":root\[data-mode='premium'\]:not(\[data-webgl='no'\])" src/app.css` outputs >= 6
    - `grep -q "z-index: 1" src/app.css`
    - `grep -q "var(--color-scrim)" src/app.css`
    - `grep -q "section.hero" src/app.css`
    - `grep -q "100svh" src/app.css`
    - No premium rule in app.css lacks the :not guard: `grep -n "data-mode='premium'\]" src/app.css | grep -v "data-webgl" | grep -v accessible` outputs at most the pre-existing empty hook-comment line (line ~101) and nothing else
    - `pnpm build` succeeds
  </acceptance_criteria>
  <verify>
    <automated>pnpm lint && pnpm build</automated>
  </verify>
  <done>Premium shell CSS in place: shell stacks at z-index 1, sections carry opaque night scrims, hero is a transparent full-viewport grid with tight text scrims, and every premium rule vanishes under data-webgl='no'. Lint + build green.</done>
</task>

</tasks>

<verification>
- `node scripts/check-contrast.mjs` exits 0 with 12 PASS lines (A11Y-06 gate extended to the dark skin)
- `pnpm check` reports 0 errors / 0 warnings
- `pnpm lint` clean (prettier + eslint)
- `pnpm build` succeeds; built CSS contains the `[data-mode='premium']` override (grep `build/_app/immutable` for `data-mode=premium` in CSS assets)
- Zero-WebGL invariant untouched: no file in this plan imports from `$lib/premium/`
</verification>

<success_criteria>
- Premium dark skin exists entirely as token/CSS work with every fg/bg pair machine-verified AA
- The skin + scrims key off `[data-mode='premium']:not([data-webgl='no'])` so the Pitfall-5 fallback is structural
- Accessible mode rendering is byte-identical in behavior (rules are premium-scoped only)
</success_criteria>

<output>
After completion, create `.planning/phases/05-premium-3d-layer/05-01-SUMMARY.md`
</output>
