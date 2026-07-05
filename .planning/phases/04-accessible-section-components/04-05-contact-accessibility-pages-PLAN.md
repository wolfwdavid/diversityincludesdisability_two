---
phase: 04-accessible-section-components
plan: 05
type: tdd
wave: 2
depends_on: ["04-01"]
files_modified:
  - src/lib/components/sections/Contact.svelte
  - src/lib/components/sections/Contact.svelte.spec.ts
  - src/routes/contact/+page.svelte
  - src/routes/accessibility/+page.svelte
autonomous: true
requirements: [SECT-05, SECT-06]

must_haves:
  truths:
    - "The /contact route renders a prominent 'Let's Connect' mailto:emanrimawi@gmail.com CTA built from the contact barrel (SECT-05)"
    - "All four social platforms (Facebook, X/Twitter, LinkedIn, Instagram) are listed; each is a real <a> only when its link Slot is published, otherwise rendered as plain text (no dead '#' anchor) — all four are currently pending so all four render as text (SECT-05, CONT-03)"
    - "Social link accessible names come from socialLinks[].label (e.g. 'Eman Rimawi on LinkedIn') — descriptive, no 'click here' (A11Y-03)"
    - "The /accessibility route renders a WCAG 2.2 AA accessibility statement (commitment, conformance status, measures, known limitations, feedback contact reusing contact.email, assessment method, review date) and is the nav-linked page (SECT-06)"
    - "The 04-01 placeholder stubs at src/routes/contact/+page.svelte and src/routes/accessibility/+page.svelte are fully REPLACED by their real pages (no TODO stub markers remain)"
    - "Each route owns a single <h1>; sections start at <h2>; <svelte:head> from seo.contact / seo.accessibility (A11Y-02)"
  artifacts:
    - path: "src/lib/components/sections/Contact.svelte"
      provides: "mailto CTA + social links branching on Slot status (published=<a>, pending=text)"
      contains: "mailto:"
      min_lines: 20
    - path: "src/lib/components/sections/Contact.svelte.spec.ts"
      provides: "Client spec: mailto href + published=<a>/pending=text + labels"
      min_lines: 25
    - path: "src/routes/contact/+page.svelte"
      provides: "Contact route (replaces 04-01 stub): single h1 + seo.contact head + Contact section"
      contains: "<h1"
    - path: "src/routes/accessibility/+page.svelte"
      provides: "Accessibility statement page (replaces 04-01 stub, 7 conventional parts) + seo.accessibility head, single h1"
      contains: "WCAG 2.2"
  key_links:
    - from: "src/lib/components/sections/Contact.svelte"
      to: "$lib/content (contact, socialLinks)"
      via: "mailto from contact.email; branch on link.status"
      pattern: "from '\\$lib/content'"
    - from: "src/routes/accessibility/+page.svelte"
      to: "$lib/content (contact, seo)"
      via: "feedback email reuses contact.email (CONT-01)"
      pattern: "contact.email"
---

<objective>
Build the Contact section (SECT-05) and the Accessibility Statement page (SECT-06). `Contact.svelte` renders a
prominent `mailto` "Let's Connect" CTA from the `contact` barrel and lists all four social platforms, branching
on each `SocialLink.link` Slot: a published link renders a real `<a href>`, a pending one renders as plain text
(NO dead `#` anchor — RESEARCH Pattern 5 + Pitfall). All four are currently pending, so all four render as
text with their descriptive labels. The `/contact` and `/accessibility` routes currently exist only as 04-01
placeholder stubs; this plan REPLACES both with their real pages. The `/accessibility` route renders a credible
WCAG 2.2 AA statement (GOV.UK/scope.org.uk model) whose feedback contact reuses `contact.email` (CONT-01).
Each route owns one `<h1>`.

Purpose: SECT-05 (mailto CTA + social links, honest pending rendering) and SECT-06 (nav-linked accessibility
statement). A11Y-03 descriptive link text inherited from barrel labels.

Output: `src/lib/components/sections/Contact.svelte` (+ spec); real `src/routes/contact/+page.svelte`;
real `src/routes/accessibility/+page.svelte`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-accessible-section-components/04-RESEARCH.md
@src/lib/content/contact.ts
@src/lib/content/types.ts
@src/lib/content/seo.ts

<interfaces>
```typescript
export const contact: { email: string; mailtoSubject: string; ctaLabel: string }; // emanrimawi@gmail.com / "Let's Connect..." / "Let's Connect"
export const socialLinks: readonly {
  platform: string; label: string; link: { status:'published'; url:string } | { status:'pending'; reason:string };
}[]; // 4 items (Facebook, X (Twitter), LinkedIn, Instagram) — ALL currently pending
export const seo: { contact: {title;description}, accessibility: {title;description}, ... };
```
The `/contact` and `/accessibility` routes already exist as 04-01 placeholder stubs (`<h1>Contact</h1>` /
`<h1>Accessibility Statement</h1>` + a `TODO(04-05)` comment each). This plan REPLACES both stub files entirely
— overwrite them, do not create second files.
RESEARCH Pattern 6 (mailto): `mailto:${contact.email}?subject=${encodeURIComponent(contact.mailtoSubject)}`.
RESEARCH Pattern 5 (social): published → `<a href={link.url}>{label}</a>`; pending → plain text `{label}` (NO anchor, NO '#').
Accessibility statement conventions (RESEARCH § Metadata): (1) commitment/scope, (2) conformance "conforms to WCAG 2.2 level AA", (3) measures taken (semantic HTML, keyboard operable, zero-WebGL accessible mode as a true peer, contrast-checked palette), (4) known limitations (Premium 3D is an enhancement; some social handles pending), (5) feedback + contact (reuse contact.email), (6) how assessed (self + automated axe WCAG 2.2 AA + keyboard/SR), (7) review/preparation date.
CSS: --color-* tokens; no non-essential motion; no raw hex.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Contact.svelte (mailto CTA + Slot-branched social links)</name>
  <files>src/lib/components/sections/Contact.svelte, src/lib/components/sections/Contact.svelte.spec.ts</files>
  <read_first>
    - src/lib/content/contact.ts (email, mailtoSubject, ctaLabel, socialLinks all pending)
    - src/lib/components/ModeToggle.svelte.spec.ts (client-spec conventions + requireAssertions)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Pattern 5" (social) + "Pattern 6" (mailto)
  </read_first>
  <behavior>
    - Renders a CTA anchor: href = `mailto:emanrimawi@gmail.com?subject=...`, visible text `contact.ctaLabel` ("Let's Connect").
    - Lists all 4 social platforms. For a PENDING link → renders the label as plain text with NO href/anchor and NO '#'. For a PUBLISHED link → renders `<a href={url}>{label}</a>`.
    - Since all 4 are pending, the spec asserts 4 platform labels appear as text and NO social <a> (only the mailto anchor is a link).
  </behavior>
  <action>
    Write `Contact.svelte.spec.ts` FIRST (RED):
    - Assert a link named /Let's Connect/i whose href starts with `mailto:emanrimawi@gmail.com`.
    - Assert all 4 labels present ("Diversity Includes Disability on Facebook", "Diversity Includes Disability on X", "Eman Rimawi on LinkedIn", "Eman Rimawi on Instagram").
    - Assert there is NO anchor with `href="#"` and NO social platform link (query links; only the mailto is an <a>).
    - Every `it` has an assertion.
    Implement `src/lib/components/sections/Contact.svelte`:
    - `import { contact, socialLinks } from '$lib/content';`
    - `const mailto = \`mailto:${contact.email}?subject=${encodeURIComponent(contact.mailtoSubject)}\`;`
    - `<section aria-labelledby="contact-h"><h2 id="contact-h">Contact</h2><a class="cta" href={mailto}>{contact.ctaLabel}</a><ul class="social">{#each socialLinks as s (s.platform)}<li>{#if s.link.status === 'published'}<a href={s.link.url}>{s.label}</a>{:else}<span class="pending">{s.label}</span>{/if}</li>{/each}</ul></section>`
    - NEVER emit `href="#"` or a disabled anchor for a pending link. Only branch on `status === 'published'` to access `.url` (compile-safe). Never render `.reason` as user copy.
    - Scoped styles: `.cta` reuses accent tokens (as Hero); `.social{ list-style:none; padding:0; }`; `--color-*` only; no non-essential motion; no raw hex.
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest run --project client src/lib/components/sections/Contact.svelte.spec.ts` GREEN.
    - `grep -q 'mailto:' src/lib/components/sections/Contact.svelte` AND `grep -q "s.link.status === 'published'" src/lib/components/sections/Contact.svelte`.
    - NO dead anchor: `grep -nE 'href=("|\x27)#("|\x27)' src/lib/components/sections/Contact.svelte` returns nothing.
    - `grep -q 'socialLinks' src/lib/components/sections/Contact.svelte` (labels from barrel) AND `grep -ni 'click here' src/lib/components/sections/Contact.svelte` returns nothing.
    - `grep -ni '<h1' src/lib/components/sections/Contact.svelte` returns nothing.
    - `pnpm check` 0/0.
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run --project client src/lib/components/sections/Contact.svelte.spec.ts</automated>
  </verify>
  <done>Contact renders mailto CTA + 4 pending social labels as text (no dead links); spec GREEN; pnpm check 0/0.</done>
</task>

<task type="auto">
  <name>Task 2: Replace the /contact stub with the real route (+page.svelte)</name>
  <files>src/routes/contact/+page.svelte</files>
  <read_first>
    - src/routes/contact/+page.svelte (the 04-01 placeholder stub: `<h1>Contact</h1>` + `TODO(04-05)` comment — REPLACE it entirely)
    - src/lib/content/seo.ts (seo.contact)
    - src/lib/components/sections/Contact.svelte (Task 1)
  </read_first>
  <action>
    REPLACE the existing 04-01 placeholder stub `src/routes/contact/+page.svelte` entirely (it currently holds only `<h1>Contact</h1>` + a `TODO(04-05)` comment — no leftover TODO or bare stub may remain):
    - `<script lang="ts"> import Contact from '$lib/components/sections/Contact.svelte'; import { seo } from '$lib/content'; const meta = seo.contact; </script>`
    - `<svelte:head><title>{meta.title}</title><meta name="description" content={meta.description} /></svelte:head>`
    - `<h1>Contact</h1>` (single route h1) then `<Contact />`.
    - No inline styles; no `+page.ts`.
  </action>
  <acceptance_criteria>
    - `src/routes/contact/+page.svelte` is the real page (stub replaced); `grep -c '<h1' src/routes/contact/+page.svelte` equals 1 AND `grep -ni 'TODO(04-05)' src/routes/contact/+page.svelte` returns nothing (stub marker gone).
    - `grep -q 'seo.contact\|meta.title' src/routes/contact/+page.svelte` AND `<svelte:head>` present AND `grep -q 'Contact' src/routes/contact/+page.svelte`.
    - `grep -n 'style=' src/routes/contact/+page.svelte` returns nothing.
    - `pnpm check` 0/0.
  </acceptance_criteria>
  <verify>
    <automated>pnpm check</automated>
  </verify>
  <done>/contact stub replaced: single h1 + Contact section + seo.contact head; check GREEN.</done>
</task>

<task type="auto">
  <name>Task 3: Replace the /accessibility stub with the real statement route (+page.svelte)</name>
  <files>src/routes/accessibility/+page.svelte</files>
  <read_first>
    - src/routes/accessibility/+page.svelte (the 04-01 placeholder stub: `<h1>Accessibility Statement</h1>` + `TODO(04-05)` comment — REPLACE it entirely)
    - src/lib/content/{contact,seo}.ts (contact.email for feedback; seo.accessibility)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § Metadata "Accessibility Statement conventions" (7 parts)
    - src/lib/content/site.ts (nav already includes the /accessibility route — SECT-06 nav link exists)
  </read_first>
  <action>
    REPLACE the existing 04-01 placeholder stub `src/routes/accessibility/+page.svelte` entirely (it currently holds only `<h1>Accessibility Statement</h1>` + a `TODO(04-05)` comment — no leftover TODO or bare stub may remain) with the WCAG 2.2 AA statement (GOV.UK/scope.org.uk model):
    - `<script lang="ts"> import { contact, seo } from '$lib/content'; const meta = seo.accessibility; const feedback = \`mailto:${contact.email}\`; const reviewed = '2026-07-05'; </script>`
    - `<svelte:head><title>{meta.title}</title><meta name="description" content={meta.description} /></svelte:head>`
    - `<h1>Accessibility Statement</h1>` (single route h1). Then `<section aria-labelledby>`+`<h2>` blocks for the seven conventional parts:
      1. Commitment & scope — this website (diversityincludesdisability.org rebuild).
      2. Conformance status — a sentence containing the literal "WCAG 2.2 level AA" (the site conforms).
      3. Measures taken — semantic HTML, keyboard-operable with visible focus, an Accessible mode that ships ZERO WebGL as a genuine peer (not a degraded fallback), contrast-checked DID palette.
      4. Known limitations — the Premium 3D mode is a client-only enhancement; some social handles are pending confirmation.
      5. Feedback — a real `<a href={feedback}>Email us at {contact.email}</a>` (reuse the barrel email; CONT-01).
      6. How assessed — self-assessment plus automated axe WCAG 2.2 AA scans and keyboard/screen-reader testing.
      7. Preparation/review date — render `{reviewed}`.
    - Descriptive link text (no "click here"); no inline styles; no `+page.ts`; `--color-*` tokens if any scoped styles; no non-essential motion.
  </action>
  <acceptance_criteria>
    - `src/routes/accessibility/+page.svelte` is the real page (stub replaced); `grep -c '<h1' src/routes/accessibility/+page.svelte` equals 1 AND `grep -ni 'TODO(04-05)' src/routes/accessibility/+page.svelte` returns nothing (stub marker gone).
    - `grep -q 'WCAG 2.2' src/routes/accessibility/+page.svelte` (conformance status present).
    - `grep -q 'contact.email' src/routes/accessibility/+page.svelte` (feedback reuses barrel email — CONT-01).
    - At least 5 `<h2` section headings: `grep -c '<h2' src/routes/accessibility/+page.svelte` >= 5.
    - `grep -ni 'click here' src/routes/accessibility/+page.svelte` returns nothing AND `grep -n 'style=' src/routes/accessibility/+page.svelte` returns nothing.
    - `pnpm check` 0/0.
  </acceptance_criteria>
  <verify>
    <automated>pnpm check</automated>
  </verify>
  <done>/accessibility stub replaced: 7-part WCAG 2.2 AA statement under one h1, feedback via barrel email, in the primary nav; check GREEN.</done>
</task>

</tasks>

<verification>
- Contact client spec GREEN; `pnpm check` 0/0; `pnpm exec eslint .` clean.
- Route reachability (incl. /accessibility/ in nav) + axe over /contact/ + /accessibility/ verified in 04-06.
</verification>

<success_criteria>
- `/contact/` shows the mailto CTA + 4 social platforms (pending as text, no dead links).
- `/accessibility/` is reachable from the primary nav and states WCAG 2.2 AA conformance with a feedback contact.
- Both 04-01 stubs are fully replaced with their real pages.
</success_criteria>

<output>
After completion, create `.planning/phases/04-accessible-section-components/04-05-SUMMARY.md`.
</output>
</output>
</content>
