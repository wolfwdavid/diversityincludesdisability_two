# Feature Research

**Domain:** Premium, accessibility-first 3D marketing website for a disability-equity consulting practice (Diversity Includes Disability / Eman Rimawi)
**Researched:** 2026-07-04
**Confidence:** HIGH

Scope of this research: two overlapping feature landscapes that this single site must satisfy simultaneously —
(a) a **premium consultant/practitioner marketing site** (hero, services, bio, social proof, contact/booking CTA), and
(b) a **best-in-class accessible site** modeled on scope.org.uk — plus the **dual-mode toggle system** (Premium WebGL ⇄ Accessible zero-WebGL) that is this project's defining differentiator. Because the org's mission is disability equity, several things that are normally "differentiators" (accessibility features) are **table stakes** here, and the accessible experience must be a genuine peer, not a fallback.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = the site feels incomplete or — worse for a disability-equity brand — hypocritical.

#### A. Premium marketing-site table stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero section (headline value prop + primary CTA) | First screen must state who DID is and what they do in one glance; "confusion is the #1 conversion killer" | MEDIUM | Premium mode = WebGL scene; Accessible mode = static heading + image/gradient. Both carry the same headline + CTA. |
| Clear value proposition / mission statement | Visitors decide in seconds whether they're in the right place | LOW | Single concise mission line ("intersectional disability equity"), reused in `<meta>` description. |
| Services overview + services detail | Core of a consulting site; DID has 4 distinct offers (trainings & facilitation, consulting, modeling for representation, speaking & panels) | MEDIUM | Split into 4 pillars, each with a short blurb and its own detail. Premium: 3D card/scene per pillar; Accessible: semantic cards. |
| About / bio page (Eman Rimawi) | Practitioner sites sell trust in the person; the founder IS the brand | LOW | Headshot + bio pulled from current Wix site. Needs proper alt text. |
| Contact / "Let's Connect" CTA | Primary conversion path; a marketing site with no way to reach out is broken | LOW | mailto:emanrimawi@gmail.com + social links (FB, X, LinkedIn, IG). No form backend needed (static). |
| Social links / off-site presence | Establishes real-world authority and reachability | LOW | Icons must have accessible names (not icon-only without labels). |
| Persistent primary navigation | Standard wayfinding; users expect a nav across pages | LOW | Must include the Accessibility Statement link (scope.org.uk pattern). |
| Footer (contact, socials, copyright, a11y statement, legal tone) | Expected site furniture; secondary nav + trust signals | LOW | Avoid "donate / tax-deductible" language — org is 501(c)(3) *pending*. |
| Responsive layout (mobile → desktop) | Majority of traffic is mobile; non-negotiable | MEDIUM | Required in **both** modes. Premium 3D must reflow/scale on small screens. |
| Fast first paint / performant load | Bounce risk; also an a11y concern (cognitive load, low-end devices) | MEDIUM | 3D lazy-loaded/code-split so the shell paints fast. |
| SEO basics (title, meta description, OG tags, sitemap) | Discoverability; replacing an existing indexed Wix site | LOW | Static build; per-route `<title>`/meta. Preserve/redirect key URLs from the old site if possible. |
| Favicon + social share (OG/Twitter) image | Baseline polish; links shared in outreach must look credible | LOW | Provide a static OG image that works even if Premium mode never loads. |

#### B. Accessibility table stakes (scope.org.uk model — non-negotiable for THIS brand)

For a disability-equity org these are **not** differentiators; an inaccessible disability site is a self-refuting product. WCAG 2.2 AA is the floor across both modes; Accessible mode targets AAA where feasible.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Skip links ("Skip to main content", "Skip to navigation") | Verified scope.org.uk pattern; lets keyboard/SR users bypass repeated nav | LOW | First focusable elements; visible on focus. Scope also offers "Skip to search" — omit unless a search exists. |
| Accessibility Statement page, linked in **primary nav** | Verified scope.org.uk pattern; states standard targeted (WCAG 2.2, AAA aim), known issues, and a contact route | LOW–MEDIUM | Honest "known issues" section is part of the model. Prominent placement signals the values. |
| Semantic heading hierarchy (single h1 → logical h2/h3) | SR navigation by headings; scope.org.uk lists heading structure as a tracked concern | LOW | Enforce one h1 per route; no skipped levels. Same structure in both modes (content parity). |
| Keyboard-first navigation (full operability, no traps) | WCAG 2.1.1 / 2.1.2; core to AT users | MEDIUM | Everything reachable and operable by keyboard, including the mode toggle and any 3D-mode escape. |
| Visible focus states throughout | WCAG 2.4.7 (AA) / 2.4.11 Focus Not Obscured (2.2) | LOW | High-contrast focus ring on the DID palette; never `outline: none` without a replacement. |
| Descriptive link text (no "click here"/"read more" alone) | scope.org.uk model; SR users navigate by link list | LOW | Links describe destination out of context. |
| ARIA disclosure menus with `aria-expanded` | scope.org.uk uses `aria-expanded` disclosure menus; known bug there = "menus not closing on tab off" — avoid that | MEDIUM | Menu button toggles `aria-expanded`; closes on Escape and on blur/tab-out. |
| `prefers-reduced-motion` honored | WCAG 2.3.3; vestibular safety (motion → nausea/vertigo) | MEDIUM | Drives the **default mode** (see toggle system) AND suppresses non-essential motion even inside Premium. |
| Sufficient color contrast (WCAG AA, AAA in Accessible mode) | Low-vision users; DID palette must be contrast-checked | LOW–MEDIUM | Tokenize blue/orange with verified ratios (≥4.5:1 text, ≥3:1 large/UI). Provide AAA-grade pairings in Accessible mode. |
| Resizable text / zoom to 200% without loss | WCAG 1.4.4 / 1.4.10 reflow; scope.org.uk points users to browser zoom guidance | LOW | Use rem-based type; no fixed-px containers that clip on zoom. |
| Meaningful image alt text | WCAG 1.1.1; headshots and any informative imagery | LOW | Decorative 3D/visuals get empty alt / `aria-hidden`. |
| Respects OS forced-colors / high-contrast mode | Windows High Contrast users; scope references display modes | MEDIUM | Test in forced-colors; don't rely on background images for meaning. |
| Language + landmark structure (`lang`, `<main>`, `<nav>`, `<header>`, `<footer>`) | SR landmark navigation | LOW | One `<main>` per page as the skip-link target. |
| Reachable, labeled contact route for a11y problems | scope.org.uk explicitly invites contact when barriers block access | LOW | Named in the accessibility statement. |

#### C. Dual-mode toggle system table stakes (the defining feature)

This is the project's core value: "the accessible mode is a genuine peer, not a degraded fallback." These are must-haves for the toggle itself.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Persistent mode toggle (Premium ⇄ Accessible) | The product's central promise | MEDIUM | Global control, present on every route; visible label + icon, not icon-only. |
| State persisted to `localStorage` | Users shouldn't re-choose every visit/page; verified best practice | LOW | Read on load, hydrate before first meaningful paint to avoid flash of wrong mode. |
| Default to Accessible when `prefers-reduced-motion: reduce` | Ethical default; respects OS-level intent. Best practice: combine OS query OR stored choice | MEDIUM | Precedence: explicit stored user choice > OS reduced-motion > default (Premium). Compute once at boot. |
| Content parity across modes | Core value — nothing hidden in one mode; same info + CTAs | MEDIUM–HIGH | Single content source rendered two ways. Parity must be structurally guaranteed, not hand-maintained. |
| Per-mode asset loading / code-splitting | Accessible mode must ship **zero WebGL bytes**; perf + reliability | HIGH | Threlte/Three.js dynamically imported only when Premium is active. Static build must not eagerly bundle 3D into the shared chunk. |
| Announce mode change to screen readers | Dynamic UI change must be perceivable to SR users | MEDIUM | `aria-live="polite"` status region announces e.g. "Accessible mode on." Toggle exposes pressed state (`aria-pressed` or role=switch `aria-checked`). |
| Toggle is itself keyboard-operable + focus-visible | It's the most important control on the site | LOW | Native `<button>`/switch semantics; Enter/Space activate; clear focus ring. |
| No layout/scroll jump on switch | Switching modes shouldn't disorient (esp. cognitive/AT users) | MEDIUM | Preserve scroll position / anchor; avoid full reload if feasible. |
| Graceful degradation if WebGL unavailable | Premium must not white-screen on no-WebGL / low-end GPU | MEDIUM | Detect WebGL support; auto-fall back to Accessible and inform the user. |

### Differentiators (Competitive Advantage)

Features that set DID apart. For a disability-equity brand, the differentiator is not "we're accessible" (table stakes) but **"our accessible experience is a first-class peer to a genuinely premium 3D one."**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Full-3D Premium mode across most sections (not accent-only) | Maximum visual impact; signals a modern, well-resourced practice; memorable | HIGH | Threlte scenes for hero + section backgrounds. Biggest build + perf risk; see PITFALLS. |
| True peer Accessible mode (static/2D equivalent of every section) | Embodies the mission — accessibility as excellence, not compromise | MEDIUM–HIGH | Accessible mode should be *designed*, not stripped: strong typography, imagery, layout — a premium static site in its own right. |
| The toggle as a visible mission statement | The switch itself communicates DID's values before a word is read | LOW–MEDIUM | Frame it in UI copy ("Choose your experience — both are first-class"). |
| Reduced-motion-aware Premium mode | Even users who stay in Premium get vestibular-safe motion | MEDIUM | Premium honors `prefers-reduced-motion` for non-essential animation without dropping to Accessible. |
| Services organized by audience/sector | scope of DID's work (trainings, consulting, modeling, speaking) reads as deep expertise when segmented | LOW | Optional grouping; "three rows by sector signals deep expertise" pattern from consultant sites. |
| Testimonials / client social proof | Trust for a consulting practice; results-oriented quotes convert | LOW–MEDIUM | **Content-dependent** — only if Eman can supply real quotes/clients. Do not fabricate. Flag as needs-content. |
| Speaking/press highlights (talks, panels, features) | Authority signal specific to a speaker/model | LOW | Logos or a list of past engagements; accessible logo alt text. |
| Contrast-checked branded design tokens | Brand + accessibility unified (blue/orange at verified AA/AAA ratios) | MEDIUM | A reusable token system is itself a differentiator vs. the old Wix site. |

### Anti-Features (Commonly Requested, Often Problematic)

Explicitly NOT built for this marketing site. Documented to prevent scope creep. Most are already Out of Scope in PROJECT.md.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Authentication / member login | The current Wix site has a "Log In" button | No gated content on a marketing site; adds a backend, security surface, and a11y burden for zero value | Remove entirely. Public content only. |
| CMS / dynamic backend | "Easy content edits" | Breaks the static-GitHub-Pages model; server to secure/maintain; over-engineering for a few pages | Content lives in the repo (markdown/JSON). Edits via PR. |
| In-site payments / donations checkout | Nonprofits collect donations | 501(c)(3) is **pending** — "tax-deductible/donate" claims are legally risky now; PCI + a11y burden | Defer. If needed, link out (Zeffy/PayPal) with no in-site payment. Avoid "tax-deductible" wording. |
| Blog / news feed | "SEO, publish regularly" | Not in current Wix site; recurring content obligation; CMS pressure; scope creep | Defer to v2. Static "speaking/press" list covers authority for now. |
| Contact form with server handling | Forms feel standard | Needs a backend/third party; spam + a11y validation complexity on a static host | `mailto:` link + social. Add a static-form service (Formspree) only if demanded later. |
| Two separately deployed sites (a11y site + premium site) | "Simplest way to guarantee both experiences" | Content drifts apart; double the deploys; violates content-parity guarantee | Single codebase + in-page toggle (already the key decision). |
| WebGL "accessible mode" (3D with reduced motion) | "Reuse the 3D, just calm it down" | Still ships WebGL bytes; unreliable on low-end/AT; not a true peer | Accessible mode = zero WebGL, static/2D — the peer experience. |
| Cookie consent banner / analytics-heavy tracking | "Measure everything" | Adds friction, a11y focus-trap risk, and privacy overhead; often unnecessary for a static brochure | Ship no third-party tracking, or a privacy-respecting, cookieless analytic. Then no banner needed. |
| Auto-playing audio/video or carousels | "Dynamic, engaging" | Motion/auto-advance harms vestibular + cognitive users; WCAG pause/stop obligations | Static imagery; if video, user-initiated with captions/controls. |
| Grant tracker / internal org tooling | Exists in sibling `Websites/Rimawi/` | Different audience (internal ops), different security posture; would bloat the marketing site | Keep separate; do not import. |
| Storing any credentials/EIN/PII in repo | "Convenience" | SECURITY — Notion source has plaintext creds; a public repo must never contain them | Hard exclusion; nothing sensitive enters this repo. |

## Feature Dependencies

```
[Design tokens: contrast-checked blue/orange palette]
    └──required by──> [All UI in both modes]
                          └──required by──> [Visible focus states, AA/AAA contrast]

[Mode toggle system]  ◀── the linchpin ──
    ├──requires──> [localStorage persistence]
    ├──requires──> [prefers-reduced-motion detection + precedence logic]
    ├──requires──> [aria-live status region for announcements]
    └──requires──> [per-mode code-splitting / dynamic Threlte import]
                       └──required by──> [Premium 3D scenes]  &  [Accessible zero-WebGL guarantee]

[Content source (single, mode-agnostic)]
    └──required by──> [Content parity]
                          └──required by──> [Every section in BOTH Premium and Accessible mode]

[Semantic layout: landmarks + heading hierarchy]
    └──required by──> [Skip links]  &  [Screen-reader navigation]

[Accessibility Statement page]
    └──enhanced by──> [Honest "known issues" section]  (scope.org.uk pattern)

[Premium 3D mode] ──conflicts──> [Zero-WebGL guarantee]  → resolved ONLY by code-splitting
[Auto-play motion] ──conflicts──> [prefers-reduced-motion honoring]  → don't build auto-play
```

### Dependency Notes

- **Mode toggle must exist before per-mode sections:** every content section renders differently per mode, so the toggle + mode context/store is foundational and belongs in the earliest phase. Sections built before the toggle would have to be retrofitted.
- **Design tokens precede all UI:** contrast-checked tokens gate both branding and the AA/AAA accessibility requirement; build them first.
- **Single content source precedes content parity:** if Premium and Accessible pull from one content model, parity is structural (free); if they each hand-roll content, parity rots. This is an architecture decision that must land before section work.
- **Code-splitting enables the zero-WebGL promise:** the "Accessible ships zero WebGL bytes" requirement is impossible unless Threlte/Three.js is dynamically imported behind the Premium branch. This constrains the build config from day one, not as a late optimization.
- **prefers-reduced-motion feeds the default:** the OS query is consumed both by the toggle's default-mode logic AND by in-Premium motion suppression — one detection, two consumers.
- **Skip links depend on landmarks:** skip targets (`#main`) require the semantic `<main>` landmark to exist first.
- **Premium 3D conflicts with the zero-WebGL guarantee** unless resolved by code-splitting — never eagerly import 3D in shared chunks.
- **Auto-play motion conflicts with reduced-motion honoring** — the clean resolution is to not build auto-advancing/auto-playing UI at all.

## MVP Definition

### Launch With (v1)

Minimum to validate the core promise: a premium site whose accessible mode is a true peer.

- [ ] Mode toggle (Premium ⇄ Accessible) with localStorage persistence — the product's reason to exist
- [ ] prefers-reduced-motion → default Accessible, with stored-choice precedence — ethical default
- [ ] aria-live announcement + switch semantics on the toggle — the mode change must be perceivable
- [ ] Per-mode code-splitting so Accessible ships zero WebGL — the non-negotiable perf/a11y guarantee
- [ ] Contrast-checked DID design tokens (AA+) — gates all UI
- [ ] Home (hero, mission, services overview, primary CTA) in both modes — core landing
- [ ] Services detail (4 pillars) in both modes — the offer
- [ ] About Eman Rimawi in both modes — trust/authority
- [ ] Contact / "Let's Connect" (mailto + social links) — conversion path
- [ ] Accessibility Statement page linked in primary nav — scope.org.uk model + brand values
- [ ] Skip links, semantic headings, keyboard nav, visible focus, descriptive links, aria-expanded menus — a11y floor
- [ ] Responsive in both modes — mobile majority
- [ ] SEO basics + OG image + favicon — replacing an indexed site
- [ ] Static build deploys to GitHub Pages under repo base path (+ `.nojekyll`) — the deploy target
- [ ] WebGL-unsupported graceful fallback to Accessible — reliability

### Add After Validation (v1.x)

- [ ] Testimonials / client social proof — **trigger:** Eman supplies real, attributable quotes
- [ ] Speaking/press highlights section — **trigger:** a list of engagements is compiled
- [ ] Richer Premium 3D scenes on secondary sections — **trigger:** hero 3D proves performant on real devices
- [ ] Preserve/redirect legacy Wix URLs — **trigger:** old-site analytics show valuable inbound links
- [ ] Cookieless privacy-respecting analytics — **trigger:** DID wants engagement data

### Future Consideration (v2+)

- [ ] Blog / news — **defer:** recurring content burden; not in current site
- [ ] Outbound donation link (Zeffy/PayPal) with compliant wording — **defer:** until 501(c)(3) status resolves
- [ ] Static contact form (Formspree-style) — **defer:** mailto covers v1; add only if outreach volume demands
- [ ] Multi-language — **defer:** no current demand signal

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Mode toggle + persistence + reduced-motion default | HIGH | MEDIUM | P1 |
| Per-mode code-splitting (zero-WebGL Accessible) | HIGH | HIGH | P1 |
| aria-live mode announcement + switch semantics | HIGH | MEDIUM | P1 |
| Contrast-checked design tokens | HIGH | MEDIUM | P1 |
| Skip links / semantic headings / keyboard / focus | HIGH | MEDIUM | P1 |
| Accessibility Statement page (in nav) | HIGH | LOW | P1 |
| ARIA disclosure menus (aria-expanded, closes on Escape/blur) | HIGH | MEDIUM | P1 |
| Home + Services + About + Contact (both modes) | HIGH | MEDIUM | P1 |
| Static deploy to GitHub Pages (base path, .nojekyll) | HIGH | LOW | P1 |
| WebGL-unsupported fallback | HIGH | MEDIUM | P1 |
| Full-3D Premium hero | HIGH | HIGH | P1 |
| Responsive layout (both modes) | HIGH | MEDIUM | P1 |
| SEO basics + OG image | MEDIUM | LOW | P1 |
| 3D scenes on secondary sections | MEDIUM | HIGH | P2 |
| Testimonials / social proof | MEDIUM | LOW | P2 (needs content) |
| Speaking/press highlights | MEDIUM | LOW | P2 |
| Legacy URL redirects | MEDIUM | LOW | P2 |
| Cookieless analytics | LOW | LOW | P3 |
| Blog / news | LOW | HIGH | P3 |
| Outbound donation link | LOW | LOW | P3 (blocked on 501c3) |
| Static contact form | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | scope.org.uk (a11y model) | Premium consultant/coach sites (2026) | Our Approach |
|---------|---------------------------|----------------------------------------|--------------|
| Hero | Content-first, low-motion | Minimalist, text-driven, clear value prop; premium = restraint, not flash | Premium 3D hero **with** a crystal-clear headline; Accessible = elegant static hero. Same copy/CTA both. |
| Motion | Reduced-motion respected, no gratuitous animation | Often heavy scroll/parallax | Motion is opt-in via mode; reduced-motion → Accessible by default. |
| Skip links | "Skip to content / search / navigation" | Usually absent | Adopt (minus search). First focusable elements. |
| Accessibility statement | Prominent, honest known-issues, WCAG 2.2 AAA aim | Usually missing or buried | Prominent in primary nav; honest known-issues section. |
| Disclosure menus | `aria-expanded`; known bug = won't close on tab-off | Varies | `aria-expanded` + close on Escape/blur (fix the scope.org.uk bug). |
| Booking CTA | Contact-oriented | "Apply"/"Book a call"/Calendly to signal exclusivity | "Let's Connect" via mailto + socials (no backend in v1); premium tone. |
| Social proof | Impact stats, case studies | Testimonials grouped by sector, results-driven | v1: authority via bio + speaking; testimonials in v1.x when real quotes exist. |
| Text resize / contrast | Zoom guidance + AAA aim | Rarely prioritized | rem type, 200% zoom-safe, AA everywhere / AAA in Accessible mode. |

## Sources

- scope.org.uk accessibility page — verified skip links ("Skip to main content / search / navigation"), `aria-expanded` disclosure menus, WCAG 2.2 AAA aim, honest known-issues section, 6-month testing cadence, external AT guidance (AbilityNet "My Computer My Way", WAI "Better Web Browsing"). Confidence: HIGH.
- MDN — Using media queries for accessibility (`prefers-reduced-motion`, forced-colors) and ARIA live regions. Confidence: HIGH.
- The A11Y Project — OS/browser accessibility display modes. Confidence: HIGH.
- Consultant/coach marketing site guides (2026): [nanoglobals.com](https://nanoglobals.com/marketing-consultant-websites/), [elementor.com](https://elementor.com/blog/inspiring-coaching-websites-to-model/), [luisazhou.com](https://luisazhou.com/blog/marketing-for-coaches/) — premium positioning, minimalist hero, sector-grouped social proof, "Apply/Book" CTAs. Confidence: MEDIUM (WebSearch-derived, patterns corroborated across sources).
- a11y toggle + localStorage + aria-live best practices: [a11ywithlindsey.com](https://www.a11ywithlindsey.com/blog/reducing-motion-improve-accessibility/), [MDN media queries for accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries_for_accessibility), [universaldesign.ie ARIA announcements](https://universaldesign.ie/communications-digital/web-and-mobile-accessibility/web-accessibility-techniques/developers-introduction-and-index/use-aria-appropriately/use-aria-to-announce-updates-and-messaging). Confidence: MEDIUM–HIGH (verified against MDN).
- Project context: `.planning/PROJECT.md` (DID v2). Confidence: HIGH (authoritative for scope/constraints).

---
*Feature research for: premium accessibility-first 3D marketing site (dual-mode toggle)*
*Researched: 2026-07-04*
</content>
</invoke>
