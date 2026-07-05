---
phase: 04-accessible-section-components
plan: 04
type: tdd
wave: 2
depends_on: ["04-01"]
files_modified:
  - src/lib/components/sections/About.svelte
  - src/lib/components/sections/About.svelte.spec.ts
  - src/lib/components/sections/SocialProof.svelte
  - src/lib/components/sections/SocialProof.svelte.spec.ts
  - src/routes/about/+page.svelte
autonomous: true
requirements: [SECT-03, SECT-04]

must_haves:
  truths:
    - "The /about route renders Eman Rimawi's bio (all about.bio paragraphs) under a single h1 with about.displayName (SECT-03)"
    - "about.mission is pending, so the About page renders NO fabricated mission statement (CONT-03)"
    - "SocialProof renders the one published engagement (Manhattan Borough President / Mark Levine training) with its attribution (SECT-04)"
    - "SocialProof renders pending testimonials/press as an explicit 'coming soon' note (role=note), never as fabricated content (SECT-04, CONT-03)"
    - "All bio + engagement copy is sourced from $lib/content — no hard-coded strings (CONT-01)"
    - "<svelte:head> sets title/description from seo.about; sections start at h2 (A11Y-02)"
  artifacts:
    - path: "src/lib/components/sections/About.svelte"
      provides: "Bio paragraphs; honors pending mission"
      contains: "about.bio"
      min_lines: 15
    - path: "src/lib/components/sections/SocialProof.svelte"
      provides: "Published MBP engagement + pending markers, branching on Slot status"
      contains: "status === 'published'"
      min_lines: 20
    - path: "src/routes/about/+page.svelte"
      provides: "About route: single h1 (about.displayName) + <svelte:head> seo.about + About + SocialProof"
      contains: "<h1"
  key_links:
    - from: "src/lib/components/sections/SocialProof.svelte"
      to: "$lib/content (engagements, testimonials, press)"
      via: "import + branch on Slot.status"
      pattern: "from '\\$lib/content'"
    - from: "src/routes/about/+page.svelte"
      to: "$lib/components/sections/{About,SocialProof}.svelte + $lib/content (seo)"
      via: "import + compose"
      pattern: "About"
---

<objective>
Build the About page (SECT-03) and the Social-proof section (SECT-04). `About.svelte` renders Eman Rimawi's
attributable bio paragraphs and honors the pending `about.mission` slot (no fabrication). `SocialProof.svelte`
branches on `Slot<T>.status`: it renders the ONE published engagement (the Manhattan Borough President /
Mark Levine training with its attribution) and renders the pending testimonials/press as an honest
"coming soon" note — never inventing testimonials or logos (CONT-03). The `/about` route composes both under a
single `<h1>` (`about.displayName`) with `seo.about` in `<svelte:head>`.

Purpose: SECT-03 (About bio) + SECT-04 (real engagement shown, future slots marked pending) with the
anti-fabrication guarantee made visible by branching on the Slot union.

Output: `src/lib/components/sections/{About,SocialProof}.svelte` (+ specs); new `src/routes/about/+page.svelte`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-accessible-section-components/04-RESEARCH.md
@src/lib/content/about.ts
@src/lib/content/socialProof.ts
@src/lib/content/types.ts
@src/lib/content/seo.ts

<interfaces>
```typescript
export const about: { displayName: string; legalName: string; intro: string; bio: readonly string[];  // 3 paragraphs
  mission: { status: 'published'; statement: string } | { status: 'pending'; reason: string } };       // PENDING
// Slot<T> = { status:'published' } & T  |  { status:'pending'; reason:string }
export const engagements: readonly ({ status:'published'; title:string; partner:string; attribution:string }
                                    | { status:'pending'; reason:string })[]; // ONE published: MBP/Mark Levine
export const testimonials: readonly (Published<Testimonial> | { status:'pending'; reason:string })[]; // all pending
export const press: readonly (Published<Press> | { status:'pending'; reason:string })[];               // all pending
export const seo: { about: { title: string; description: string }, ... };
```
RESEARCH Pattern 5 (SocialProof): `{#each engagements as e}{#if e.status === 'published'}<li><h3>{e.title}</h3><p>{e.partner}</p><p class="attribution">{e.attribution}</p></li>{/if}{/each}` then `{#if testimonials.every((t)=>t.status==='pending')}<p class="pending" role="note">Client testimonials are coming soon.</p>{/if}`.
CSS: --color-* tokens; mobile-first responsive; no non-essential motion; no raw hex.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: About.svelte (bio paragraphs, pending mission)</name>
  <files>src/lib/components/sections/About.svelte, src/lib/components/sections/About.svelte.spec.ts</files>
  <read_first>
    - src/lib/content/about.ts (displayName, bio[], pending mission)
    - src/lib/components/ModeToggle.svelte.spec.ts (client-spec conventions + requireAssertions)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Pattern 5" (pending mission arm)
  </read_first>
  <behavior>
    - Renders each of the `about.bio` paragraphs (3) as separate <p> elements.
    - Does NOT render a fabricated mission (mission is pending): asserts no invented mission sentence appears.
    - Component starts at <h2> (route owns h1) OR renders bio under the route h1 — no <h1> inside About.svelte.
  </behavior>
  <action>
    Write `About.svelte.spec.ts` FIRST (RED): mount, assert all 3 bio paragraph substrings render (e.g. "bilateral leg amputee", "New York Lawyers for the Public Interest", "adaptive clothing line"), assert no fabricated mission text. Every `it` has an assertion.
    Implement `src/lib/components/sections/About.svelte`:
    - `import { about } from '$lib/content';`
    - `<section aria-labelledby="bio-h"><h2 id="bio-h">Biography</h2>{#each about.bio as para}<p>{para}</p>{/each}{#if about.mission.status === 'published'}<p class="mission">{about.mission.statement}</p>{/if}</section>`
    - The `{#if published}` mission arm means the pending mission renders nothing (no fabrication). Do NOT add an `{:else}` with invented copy.
    - Scoped styles: `max-width:65ch` measure on paragraphs (WCAG 1.4.4/1.4.10), `--color-text`. No raw hex; no non-essential motion.
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest run --project client src/lib/components/sections/About.svelte.spec.ts` GREEN.
    - `grep -q 'about.bio' src/lib/components/sections/About.svelte` AND `grep -q 'about.mission.status' src/lib/components/sections/About.svelte`.
    - No fabricated mission: `grep -niE 'our mission is|we believe that|mission is to' src/lib/components/sections/About.svelte` returns nothing.
    - `grep -ni '<h1' src/lib/components/sections/About.svelte` returns nothing (no h1 in section).
    - `pnpm check` 0/0.
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run --project client src/lib/components/sections/About.svelte.spec.ts</automated>
  </verify>
  <done>About renders 3 barrel bio paragraphs, no fabricated mission; spec GREEN; pnpm check 0/0.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: SocialProof.svelte (published engagement + pending markers)</name>
  <files>src/lib/components/sections/SocialProof.svelte, src/lib/components/sections/SocialProof.svelte.spec.ts</files>
  <read_first>
    - src/lib/content/socialProof.ts (1 published engagement; pending testimonials/press)
    - src/lib/content/types.ts (Slot/Published/Engagement shapes)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Pattern 5" (verbatim)
  </read_first>
  <behavior>
    - Renders the one published engagement: title "Disability equity & inclusion training", partner containing "Manhattan Borough President", and its attribution string.
    - Renders a pending marker (role="note") for testimonials because all testimonials are pending.
    - Does NOT render any fabricated testimonial/press body text.
  </behavior>
  <action>
    Write `SocialProof.svelte.spec.ts` FIRST (RED): mount, assert the published engagement title + partner ("Office of the Manhattan Borough President") + attribution render; assert a `role="note"` "coming soon" element exists for pending testimonials; assert NO invented quote/author appears. Every `it` has an assertion.
    Implement `src/lib/components/sections/SocialProof.svelte` per RESEARCH Pattern 5:
    - `import { engagements, testimonials, press } from '$lib/content';`
    - `<section aria-labelledby="proof-h"><h2 id="proof-h">Recent work</h2><ul>{#each engagements as e}{#if e.status === 'published'}<li><h3>{e.title}</h3><p>{e.partner}</p><p class="attribution">{e.attribution}</p></li>{/if}{/each}</ul>{#if testimonials.every((t) => t.status === 'pending')}<p class="pending" role="note">Client testimonials are coming soon.</p>{/if}{#if press.every((p) => p.status === 'pending')}<p class="pending" role="note">Press and client logos are coming soon.</p>{/if}</section>`
    - Only branch on `status === 'published'` to expose `.title/.partner/.attribution` (compile-safe). Never render `.reason` as user copy.
    - Scoped styles: `--color-*` tokens; `.attribution{ font-size:0.9rem; }`; responsive; no non-essential motion; no raw hex.
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest run --project client src/lib/components/sections/SocialProof.svelte.spec.ts` GREEN.
    - `grep -q "status === 'published'" src/lib/components/sections/SocialProof.svelte` AND `grep -q 'role="note"' src/lib/components/sections/SocialProof.svelte`.
    - `grep -q "from '\\$lib/content'" src/lib/components/sections/SocialProof.svelte` (engagement copy from barrel).
    - No fabricated testimonial: `grep -niE '"[A-Z][^"]{15,}"' src/lib/components/sections/SocialProof.svelte` shows no invented quote string (only the "coming soon" notes + barrel bindings).
    - `grep -ni '<h1' src/lib/components/sections/SocialProof.svelte` returns nothing.
    - `pnpm check` 0/0.
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run --project client src/lib/components/sections/SocialProof.svelte.spec.ts</automated>
  </verify>
  <done>SocialProof shows the published MBP engagement + pending notes; no fabrication; spec GREEN; pnpm check 0/0.</done>
</task>

<task type="auto">
  <name>Task 3: Create the /about route (+page.svelte)</name>
  <files>src/routes/about/+page.svelte</files>
  <read_first>
    - src/lib/content/{about,seo}.ts (about.displayName, seo.about)
    - src/lib/components/sections/{About,SocialProof}.svelte (Tasks 1–2)
  </read_first>
  <action>
    Create `src/routes/about/+page.svelte`:
    - `<script lang="ts"> import About from '$lib/components/sections/About.svelte'; import SocialProof from '$lib/components/sections/SocialProof.svelte'; import { about, seo } from '$lib/content'; const meta = seo.about; </script>`
    - `<svelte:head><title>{meta.title}</title><meta name="description" content={meta.description} /></svelte:head>`
    - `<h1>{about.displayName}</h1>` (single route h1) then `<About /> <SocialProof />`.
    - No inline styles; no `+page.ts` (inherits prerender/trailingSlash).
  </action>
  <acceptance_criteria>
    - File `src/routes/about/+page.svelte` exists; `grep -c '<h1' src/routes/about/+page.svelte` equals 1 AND `grep -q 'about.displayName' src/routes/about/+page.svelte`.
    - `grep -q 'seo.about\|meta.title' src/routes/about/+page.svelte` AND `<svelte:head>` present.
    - `grep -q 'About' src/routes/about/+page.svelte` AND `grep -q 'SocialProof' src/routes/about/+page.svelte`.
    - `grep -n 'style=' src/routes/about/+page.svelte` returns nothing.
    - `pnpm check` 0/0 AND `pnpm exec vitest run --project client src/lib/components/sections/About.svelte.spec.ts src/lib/components/sections/SocialProof.svelte.spec.ts` GREEN.
  </acceptance_criteria>
  <verify>
    <automated>pnpm check && pnpm exec vitest run --project client src/lib/components/sections/About.svelte.spec.ts src/lib/components/sections/SocialProof.svelte.spec.ts</automated>
  </verify>
  <done>/about renders bio + social proof under one h1 (about.displayName) with seo.about head; check + specs GREEN.</done>
</task>

</tasks>

<verification>
- About + SocialProof client specs GREEN.
- `pnpm check` 0/0; `pnpm exec eslint .` clean.
- Route reachability + axe over /about/ verified in 04-06.
</verification>

<success_criteria>
- `/about/` shows Eman's bio + the real MBP engagement + honest pending markers, under one h1, no fabrication.
</success_criteria>

<output>
After completion, create `.planning/phases/04-accessible-section-components/04-04-SUMMARY.md`.
</output>
