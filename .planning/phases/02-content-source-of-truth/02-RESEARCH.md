# Phase 2: Content Source of Truth - Research

**Researched:** 2026-07-04
**Domain:** Typed content modeling in SvelteKit/TypeScript + real-content sourcing from a Wix site
**Confidence:** HIGH (architecture, stack), MEDIUM (sourced copy — Wix is client-rendered; some strings need human confirmation)

## Summary

Phase 2 has two distinct workstreams that the plan must keep separate. The first is an **engineering** problem: design a single, typed, mode-agnostic content layer in `src/lib/content/` that both the future Accessible and Premium renderers import identically, so content parity (CONT-01/CONT-02) is a *structural* property of the code, not a discipline. This is well-trodden TypeScript territory — plain `const` objects typed with the `satisfies` operator, discriminated unions for "content pending" states, and a single barrel export. It should mirror the exact conventions Phase 1 established for the token modules (typed `as const` objects, a semantic layer, a barrel, and a build-time gate).

The second is a **content-sourcing** problem, and it is the more fragile one. The live Wix site at diversityincludesdisability.org renders almost all body content client-side via JavaScript, so a server-side fetch returns only a thin shell. WebFetch successfully captured the homepage's static shell — the nav (Home / Log In / About Me), the four service lines, the contact email + "Let's Connect..." subject, the Manhattan Borough President training photo, and the 2024 copyright — but the "About Me" page body and Eman's full bio are **not** retrievable by automated fetch (candidate slugs 404). The plan therefore needs an explicit **manual content-capture task** (human opens the live site, copies the real bio/mission text) rather than assuming the executor can scrape it. Attributable bio material *does* exist in reputable external sources (LinkedIn, NYLPI, Living with Amplitude, NYC DOT Equity in Motion) and can seed the About content, but the canonical wording should come from Eman's own site/approval.

**Primary recommendation:** Build `src/lib/content/{types,site,services,about,contact,socialProof,seo,index}.ts` as typed `const … satisfies` modules with a `Slot<T> = Published<T> | ContentPending` discriminated union for all social-proof data; make `attribution` a *required* field on any published social-proof item so fabrication is a type error, not a judgment call; feed per-page SEO through a typed `PageMeta` record consumed in `<svelte:head>`. Add a Wave 0 human-capture task for the About/mission copy before content is finalized.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-01 | All site copy and data live in a single typed source consumed by both modes, making content parity structural | Architecture Patterns (single-source `lib/content/` barrel; `satisfies`-typed modules; both renderers import the identical surface). Matches Phase 1 token-module style. |
| CONT-02 | Both modes present identical information and CTAs — nothing reachable in only one mode | Structural parity is *guaranteed by construction* (one data source, no per-mode duplication). Backed by a Nyquist data-parity + nav-completeness test (Validation Architecture). Component-level render parity is verified later (Phase 4/6). |
| CONT-03 | Social-proof uses only real, attributable material; unfilled slots marked "content pending", never fabricated | `ContentPending` sentinel + `Slot<T>` discriminated union; `attribution` required on published items (fabrication = type error); no-fabrication invariant test. Real anchor engagement = the Manhattan Borough President training (confirmed on live site). |
</phase_requirements>

## Real Content Inventory (sourced 2026-07-04)

> This is the highest-value output for the planner: a concrete map of what real copy EXISTS vs. what must be captured or marked pending. Confidence is per-item.

### Confirmed from the live Wix homepage (HIGH — captured verbatim from the site shell)

| Field | Value | Notes |
|-------|-------|-------|
| Org name | **Diversity Includes Disability** | Site title |
| Founder | **Eman Rimawi** (legal/copyright: **Eman Rimawi-Doster**) | Homepage uses "Eman Rimawi"; footer copyright uses full name |
| Homepage tagline | "My name is Eman Rimawi" | First-person intro voice |
| Nav (current Wix) | Home · Log In · About Me | "Log In" is **out of scope** (REQUIREMENTS Out of Scope) — do NOT port it |
| Service 1 | "Intersectional Disability Equity and Inclusion trainings and facilitation" | Maps to SECT-02 "trainings & facilitation" |
| Service 2 | "Disability Consulting" | Maps to SECT-02 "disability consulting" |
| Service 3 | "Modeling for Representation" | Maps to SECT-02 "modeling for representation" |
| Service 4 | "Speaker and Panelist" | Maps to SECT-02 "speaking & panels" |
| Contact email | **emanrimawi@gmail.com** | Confirmed; matches SECT-05 |
| Contact CTA subject | "Let's Connect..." | Use as the `mailto` subject line |
| Anchor social-proof image | Photo of Eman conducting training for **Manhattan Borough President Mark Levine** | This is the real SECT-04 engagement. Attributable. |
| Second image | Eman in business attire (professional headshot) | Alt-text describes it |
| Copyright | "© 2024 Eman Rimawi-Doster" | Update year on rebuild; keep the name |

### Empty / not automatically retrievable (→ needs a capture task or "content pending")

| Field | Status | Action for the plan |
|-------|--------|---------------------|
| Full "About Me" bio text | **Not fetchable** — Wix client-renders it; slug 404s on automated fetch | HUMAN CAPTURE task: copy the real bio wording from the live site |
| Mission statement | Not present in the fetched shell | Capture from live site; if none exists, mark a `pending` slot rather than inventing one |
| Phone number | None listed | Leave absent (email-only contact is intentional per SECT-05) |
| Testimonials / quotes | None on the site | Mark as `ContentPending` (CONT-03). Do NOT fabricate. This is exactly the SOCL-01/02 v2 deferral. |
| Client logos / press list | None on the site | `ContentPending` slot (SECT-04 "marked slot for future") |
| Real social-media URLs | Wix links are **generic placeholder accounts**, not verified real handles | Confirm real handles with Eman before publishing; see candidates below |

### Social handle candidates (MEDIUM — from web search, MUST be confirmed by Eman before shipping)

The Wix site's social icons point at generic Wix placeholders, so they are **not** a reliable source. Public search surfaced these as *likely* real handles, but CONT-03's "real, attributable" bar means they need Eman's confirmation before they go live:

| Platform | Candidate URL | Confidence |
|----------|---------------|-----------|
| Instagram | https://www.instagram.com/the_eman_meow_rimawi_show/ | MEDIUM — active personal account |
| Facebook | https://www.facebook.com/emanrimawiandtheworld/ | MEDIUM |
| LinkedIn | https://www.linkedin.com/in/erimawi/ | MEDIUM — "Eman Rimawi-Doster – Diversity Includes Disability" |
| X / Twitter | Unknown | LOW — no reliable handle found; may be a `pending` slot |

**Plan guidance:** Model the four social links as data with a per-link `status`. Ship confirmed handles as `published`; ship any unconfirmed platform (e.g. X) as `pending` rather than pointing at a placeholder. This satisfies CONT-03 at the link level too.

### Attributable bio material for the About page (MEDIUM — external, reputable; seed only, confirm wording)

Eman Rimawi-Doster is a Black, Native American and Palestinian New Yorker and a bilateral leg amputee (2014, due to lupus). Spoken-word artist, educator, and youth organizer (FUREE, Casa Atabex Ache, The Jed Foundation); became a full-time disability advocate at New York Lawyers for the Public Interest in 2017, known for accessible-transit, voting-rights, and health-equity work; founded Diversity Includes Disability as a disability-equity consulting firm; Disability Consultant for DC Comics and Skybound; conference speaker; launched an adaptive clothing line. Sources: LinkedIn `/in/erimawi/`, NYLPI, Living with Amplitude, NYC DOT Equity in Motion, POWER NOT PITY podcast Ep. 5, Patreon `emanrimawinyc`.

> Treat this as *research to hand the human capturer*, not as final copy. The About page should use Eman's own approved wording; this paragraph is a factual scaffold and a fabrication-guard (so the executor knows what is true).

## User Constraints

No `CONTEXT.md` exists for this phase (no `discuss-phase` was run). Constraints are drawn from REQUIREMENTS.md and PROJECT.md:

- **Do NOT port the Wix "Log In" nav item** — explicitly out of scope (marketing site, no auth).
- **No fabrication** — testimonials/press/engagement numbers must be real and attributable, or explicitly `pending` (CONT-03).
- **No "donate / tax-deductible" wording** — org is 501(c)(3) *pending* (PROJECT.md tone note). Any giving CTA is deferred (ENGA-02).
- **No credentials, EIN, or personal address** in the repo — SECURITY.
- **Content is mode-agnostic** — nothing in `lib/content/` may import from `lib/premium/` (Phase 1 ESLint guard already enforces this; content is pure data, so this is naturally satisfied).
- **No CMS / backend / i18n** — plain in-repo TypeScript modules only.

## Standard Stack

No new dependencies. Phase 2 is pure TypeScript data authored against the already-installed toolchain.

### Already present (verified from package.json 2026-07-04)
| Library | Version | Purpose in Phase 2 |
|---------|---------|--------------------|
| typescript | ^5.9.3 | `satisfies` operator, discriminated unions, `as const` |
| svelte / @sveltejs/kit | ^5.56.1 / ^2.63.0 | `<svelte:head>` for SEO; `+page.ts`/`+layout` data |
| svelte-check | ^4.6.0 | Type gate over content modules (parity/fabrication guard) |
| vitest | ^4.1.8 | Unit tests for no-fabrication + nav-completeness invariants |
| @playwright/test | ^1.60.0 | (Later phases) render-parity/e2e; not required to author data |

**Installation:** none. `pnpm install` already satisfies this phase.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain typed `.ts` modules | JSON + generated types, or a headless CMS | Rejected: adds a build step / backend for a tiny static marketing site; violates "no CMS". Plain TS gives the strongest compile-time parity guarantee with zero infra. |
| `satisfies` typing | Zod runtime schema validation | Zod is overkill for author-controlled static data; `satisfies` catches shape errors at build with no runtime bytes. (A tiny vitest invariant test covers the few semantic rules Zod would.) |
| Markdown/MDsveX content | Typed objects | Markdown reintroduces per-block ambiguity and makes structural parity harder to assert; keep copy as typed strings. |

## Architecture Patterns

### Recommended structure (`src/lib/content/`)
```
src/lib/content/
├── types.ts        # shared content types: Slot<T>, ContentPending, PageMeta, SocialLink, Service…
├── site.ts         # org name, taglines, nav model, global SEO defaults
├── services.ts     # the 4 service pillars (SECT-02)
├── about.ts        # Eman bio blocks (SECT-03) — seeded, human-confirmed
├── contact.ts      # email, mailto subject, social links (SECT-05)
├── socialProof.ts  # real engagements (MBP training) + pending testimonial/press slots (SECT-04)
├── seo.ts          # per-route PageMeta map (title/description/OG)
└── index.ts        # barrel — the SINGLE import surface both modes use
```

**Why per-section modules + one barrel:** each section is independently editable (Success Criterion 1: "editing a single typed content module is the only change needed"), while `index.ts` gives both renderers one import (`import { services, about } from '$lib/content'`). This is the same shape as Phase 1's tokens (`colors.ts` + `pairs.ts` + semantic layer), so it matches house style.

### Pattern 1: `const … satisfies` typed content (not annotated-variable)
**What:** Author literal data, then apply `satisfies` a type. This preserves the *narrow literal* types (so `services.map` etc. stays precisely typed and autocompletes) while still enforcing the shape.
**When:** every content module.
```ts
// src/lib/content/services.ts
import type { Service } from './types';

export const services = [
  {
    id: 'trainings',
    title: 'Trainings & Facilitation',
    summary: 'Intersectional Disability Equity and Inclusion trainings and facilitation.',
  },
  { id: 'consulting', title: 'Disability Consulting', summary: '…' },
  { id: 'modeling',   title: 'Modeling for Representation', summary: '…' },
  { id: 'speaking',   title: 'Speaker & Panelist', summary: '…' },
] as const satisfies readonly Service[];
```
> Prefer `satisfies` over `const services: Service[] = …`. The annotation form widens literals and loses key-level type safety. (TS 4.9+; project is on 5.9 — HIGH confidence.)

### Pattern 2: `Slot<T>` discriminated union for content-pending (CONT-03 core)
**What:** A tagged union that forces every consumer to handle the "pending" branch and makes publishing require attribution.
```ts
// src/lib/content/types.ts
export type ContentPending = {
  readonly status: 'pending';
  readonly reason: string; // e.g. "Awaiting attributable testimonial from Eman"
};

export type Published<T> = { readonly status: 'published' } & T;

/** Either real, attributable content OR an explicit pending marker. Never a bare value. */
export type Slot<T> = Published<T> | ContentPending;

export type Testimonial = {
  quote: string;
  author: string;
  attribution: string; // REQUIRED — a source/role/link. Cannot publish without it.
};

export type Engagement = {
  title: string;        // "Disability-equity training"
  partner: string;      // "Manhattan Borough President Mark Levine"
  attribution: string;  // how it's evidenced (photo/press/URL)
};
```
```ts
// src/lib/content/socialProof.ts
import type { Slot, Engagement, Testimonial } from './types';

export const engagements = [
  {
    status: 'published',
    title: 'Disability equity & inclusion training',
    partner: 'Office of the Manhattan Borough President (Mark Levine)',
    attribution: 'Delivered by DID; documented on diversityincludesdisability.org',
  },
] as const satisfies readonly Slot<Engagement>[];

export const testimonials = [
  { status: 'pending', reason: 'Awaiting attributable testimonial (v2 SOCL-01)' },
] as const satisfies readonly Slot<Testimonial>[];
```
**Why this defeats fabrication structurally:** to show a testimonial the author must write `status: 'published'` AND supply a non-empty `attribution`. There is no shape for "a quote with no source". A renderer switching on `status` must render the pending placeholder for pending slots — pending content can't be silently dropped, and real content can't exist without a source. This turns CONT-03 from a reviewer's vigilance into a type/lint rule.

### Pattern 3: Typed SEO via `PageMeta` → `<svelte:head>`
**What:** One typed record of per-route metadata; each page reads its entry and emits tags in `<svelte:head>`. Global defaults live in `site.ts`.
```ts
// src/lib/content/types.ts
export type PageMeta = {
  title: string;        // ≤ ~60 chars
  description: string;  // ~50–160 chars
  ogImage?: string;
};
```
```ts
// src/lib/content/seo.ts
import type { PageMeta } from './types';
export const seo = {
  home:    { title: 'Diversity Includes Disability', description: 'Intersectional disability equity trainings, consulting, modeling & speaking with Eman Rimawi.' },
  about:   { title: 'About Eman Rimawi | Diversity Includes Disability', description: '…' },
  services:{ title: 'Services | Diversity Includes Disability', description: '…' },
  contact: { title: 'Contact | Diversity Includes Disability', description: '…' },
  accessibility: { title: 'Accessibility Statement | Diversity Includes Disability', description: '…' },
} as const satisfies Record<string, PageMeta>;
```
```svelte
<!-- consumed in a +page.svelte or layout -->
<script lang="ts">
  import { seo } from '$lib/content';
  const meta = seo.about;
</script>
<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
</svelte:head>
```
> Because the site is fully prerendered (adapter-static), these tags are baked into the static HTML — good for SEO/crawlers even though the rest is Svelte. No runtime head-management library needed.

### Pattern 4: Nav model as data (drives both renderers + parity)
Model the primary nav (including the Accessibility Statement link, SECT-06) as a typed array in `site.ts`. Both modes render from it, so a page can never be "reachable in only one mode" (CONT-02). Use base-path-aware routes — Phase 1 established `resolve()` from `$app/paths` for internal links; store route keys (e.g. `/about`) and let components resolve them.

### Anti-Patterns to Avoid
- **Per-mode copy duplication** — any string that lives in both an Accessible component and a Premium component. This is the exact failure Phase 2 exists to prevent; all copy comes from `$lib/content`.
- **Bare-value social proof** — a `testimonials: {quote,author}[]` with no `status`/`attribution`. Reintroduces the fabrication risk.
- **`const x: T[] =` annotations** on content — widens literals; prefer `satisfies`.
- **Premature i18n** — no locale layer, no message catalogs, no `t()` wrappers. English-only strings inline. (See Pitfalls.)
- **Importing content into `lib/premium` differently than into accessible components** — both must import from the same barrel.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime shape validation of author data | A custom validator / Zod schemas | `satisfies` + `svelte-check` build gate | Data is author-controlled and static; compile-time typing is sufficient and ships zero runtime bytes |
| Per-page `<title>`/meta management | A head-manager store or library | Native `<svelte:head>` + typed `PageMeta` | SvelteKit + prerender already bakes head tags into static HTML |
| Base-path-aware internal links | String concatenation of `base + path` | `resolve()` from `$app/paths` (already the Phase 1 convention) | Correct under GitHub Pages subpath; consistent with existing code |
| "Content pending" UX state | Ad-hoc `if (!data) …` scattered in components | The `Slot<T>` discriminated union | One typed contract; exhaustiveness makes omissions impossible |

**Key insight:** The whole phase is *deliberately* low-tech. The value is in the *type shapes*, not in any library. The strongest parity/anti-fabrication guarantees come from making illegal states unrepresentable, not from tooling.

## Common Pitfalls

### Pitfall 1: Trying to scrape the Wix site automatically
**What goes wrong:** The executor writes a fetch/scrape task for the bio and gets an empty shell.
**Why:** Wix renders body content client-side; server fetch returns a JS bootstrap, not the copy. The homepage shell yielded nav + services + email, but the "About Me" body and any mission text are not in the fetched HTML (candidate slugs 404 on automated fetch).
**How to avoid:** Add an explicit **human content-capture task** in the plan: a person opens the live site in a browser, copies the real About/mission wording, and pastes it into `about.ts`. Seed `about.ts` with the attributable external bio (above) as a fallback scaffold, clearly flagged for human confirmation.
**Warning signs:** A plan task that says "fetch the About page and extract the bio" with no human step.

### Pitfall 2: Placeholder social links masquerading as real
**What goes wrong:** Porting the Wix social icons verbatim ships links to generic placeholder accounts — a subtle CONT-03 violation.
**Why:** The current Wix icons point at Wix defaults, not Eman's real handles.
**How to avoid:** Per-link `status`; publish only Eman-confirmed handles; mark unconfirmed platforms (X/Twitter) `pending`.
**Warning signs:** A social URL in `contact.ts` that nobody has clicked to verify.

### Pitfall 3: Parity asserted only at the data layer, then broken in components
**What goes wrong:** `lib/content` is single-source, but a Phase-4/5 component hard-codes a string or renders a section only in one mode.
**Why:** Phase 2 can guarantee a single *source*, but not (yet) that every component *consumes* it — components don't exist until later phases.
**How to avoid:** Document the invariant explicitly for downstream phases ("no user-facing string outside `$lib/content`"); leave the component-level render-parity assertion to the Phase 6 QA gate. Phase 2's tests cover data-level completeness (nav resolves, every section keyed).
**Warning signs:** A literal quote/heading string appearing in a `.svelte` file in a later phase.

### Pitfall 4: Premature internationalization
**What goes wrong:** Wrapping strings in a `t()`/message layer "for later" adds indirection with no payoff.
**Why:** There's no localization requirement; it's a marketing site in English.
**How to avoid:** Inline English strings. If i18n is ever needed, the typed modules are already a clean seam to add it.

### Pitfall 5: Stale copyright / fabricated freshness
**What goes wrong:** Copying "© 2024" or inventing "trusted by N organizations".
**How to avoid:** Compute the year (or set 2026) for copyright; never state engagement counts unless attributable.

## Code Examples

### Barrel export (the single import surface — CONT-01)
```ts
// src/lib/content/index.ts
export * from './types';
export { site, nav } from './site';
export { services } from './services';
export { about } from './about';
export { contact, socialLinks } from './contact';
export { engagements, testimonials } from './socialProof';
export { seo } from './seo';
```

### Contact with per-link pending status (CONT-03 at link level)
```ts
// src/lib/content/contact.ts
import type { Slot } from './types';

export type SocialLink = { platform: string; url: string; label: string };

export const contact = {
  email: 'emanrimawi@gmail.com',
  mailtoSubject: "Let's Connect...",
  ctaLabel: "Let's Connect",
} as const;

export const socialLinks = [
  { status: 'pending', reason: 'Confirm real handle with Eman' }, // Instagram/FB/LinkedIn once verified
] as const satisfies readonly Slot<SocialLink>[];
```

### Exhaustive rendering of a Slot (how a renderer consumes pending safely)
```ts
function renderSlot(slot: Slot<Testimonial>) {
  switch (slot.status) {
    case 'published': return realTestimonial(slot);     // has attribution by type
    case 'pending':   return pendingPlaceholder(slot);  // tasteful "coming soon"
    // no default — TS errors if a status is unhandled (exhaustiveness)
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `const x: T[] = […]` annotations | `const x = […] as const satisfies T[]` | TS 4.9 (2022) | Keeps literal types while enforcing shape — better for content maps |
| Head libraries (svelte-head-management) | Native `<svelte:head>` + prerender | SvelteKit 1+/2 | Baked-in static meta; no lib needed |
| JSON + codegen'd types | Inline typed TS modules | — | Simpler for author-controlled static copy; one fewer build step |

**Deprecated/outdated:** none material to this phase.

## Open Questions

1. **Full About/mission wording**
   - Known: services, name, email, the MBP engagement, attributable external bio.
   - Unclear: Eman's own on-site bio/mission copy (Wix client-renders it; not fetchable).
   - Recommendation: human-capture task; seed with the attributable scaffold, flag for confirmation.
2. **Real social handles (esp. X/Twitter)**
   - Known: Instagram/FB/LinkedIn candidates exist.
   - Unclear: whether they're the accounts Eman wants linked; no reliable X handle.
   - Recommendation: publish confirmed handles; `pending` for unconfirmed.
3. **Accessibility statement copy (SECT-06)**
   - Known: follow the scope.org.uk model (structure).
   - Unclear: DID-specific commitments/wording.
   - Recommendation: model the *structure* as typed content now; the specific statement text can be authored in Phase 4 or captured here as a `pending`/draft block. Decide in planning whether the a11y-statement copy belongs in Phase 2 data or Phase 4.

## Validation Architecture

`workflow.nyquist_validation` is `true` — this section applies. Typed content parity + the no-fabrication invariant are strong validation candidates.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.8 (+ `svelte-check` 4.6 for the type gate) |
| Config file | Embedded in `vite.config.ts` (Phase-1 scaffold; example specs live in `src/lib/vitest-examples/`) |
| Quick run command | `pnpm exec vitest run src/lib/content` |
| Full suite command | `pnpm exec vitest run && pnpm exec svelte-check` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | Content modules type-check against their declared shapes; single barrel resolves | type-check | `pnpm exec svelte-check` | ❌ Wave 0 (modules don't exist yet) |
| CONT-02 | Every primary-nav route key maps to a real page/section; no orphan or one-mode-only entry | unit | `pnpm exec vitest run src/lib/content/nav.spec.ts` | ❌ Wave 0 |
| CONT-02 | Every section referenced by nav has a corresponding content export (completeness) | unit | `pnpm exec vitest run src/lib/content/content.spec.ts` | ❌ Wave 0 |
| CONT-03 | No `status:'published'` social-proof item has empty `attribution`; every `pending` has a `reason` | unit | `pnpm exec vitest run src/lib/content/fabrication.spec.ts` | ❌ Wave 0 |
| CONT-03 | No placeholder/lorem/"click here"/fake-number strings in content | unit | (same fabrication spec — string denylist) | ❌ Wave 0 |
| — | Every `seo` entry has non-empty title (≤~60) and description (~50–160) | unit | `pnpm exec vitest run src/lib/content/seo.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm exec vitest run src/lib/content` (fast; <5s)
- **Per wave merge:** `pnpm exec vitest run && pnpm exec svelte-check`
- **Phase gate:** full suite + `svelte-check` green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/content/types.ts` — shared types (blocks every module + test)
- [ ] `src/lib/content/fabrication.spec.ts` — CONT-03 no-fabrication invariant (attribution required; denylist)
- [ ] `src/lib/content/nav.spec.ts` — CONT-02 nav-route completeness
- [ ] `src/lib/content/content.spec.ts` — section/content completeness
- [ ] `src/lib/content/seo.spec.ts` — SEO field bounds
- [ ] Human content-capture task (About/mission copy from live Wix site) before content is finalized
- [ ] Confirm real social handles with Eman (or mark `pending`)
- [ ] Framework install: none — Vitest + svelte-check already configured in Phase 1

## Sources

### Primary (HIGH confidence)
- Live homepage shell — https://diversityincludesdisability.org (via WebFetch, 2026-07-04): nav, 4 services, email, "Let's Connect..." subject, MBP training photo, copyright
- `robots.txt`/`sitemap.xml` probe — confirmed Wix client-render (no static content URLs enumerable)
- Project files: `.planning/REQUIREMENTS.md`, `ROADMAP.md`, `PROJECT.md`, `STATE.md`; `src/lib/tokens/{colors,pairs}.ts`, `src/lib/index.ts`, `package.json`, `eslint.config.js`, `svelte.config.js` (Phase-1 conventions)
- TypeScript `satisfies` / discriminated unions — TS 5.9 (installed), stable language features

### Secondary (MEDIUM confidence)
- Eman Rimawi bio — LinkedIn `/in/erimawi/`, New York Lawyers for the Public Interest, Living with Amplitude, NYC DOT Equity in Motion, POWER NOT PITY Ep. 5, Patreon `emanrimawinyc` (WebSearch 2026-07-04)

### Tertiary (LOW confidence — flagged for validation)
- Social handle candidates (Instagram/Facebook/LinkedIn) — require Eman's confirmation before publishing; X/Twitter handle unknown

## Metadata

**Confidence breakdown:**
- Architecture (typed modules, `Slot<T>`, SEO): HIGH — stable TS/SvelteKit patterns, mirrors Phase 1
- Confirmed real copy (services/email/MBP engagement): HIGH — captured from the live site
- About bio / mission / socials: MEDIUM/LOW — Wix client-renders; needs human capture + Eman confirmation
- Validation approach: HIGH — Vitest/svelte-check already in place

**Research date:** 2026-07-04
**Valid until:** ~2026-08-04 for architecture; content inventory should be re-checked against the live site at capture time (the Wix site can change).
