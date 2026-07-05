# Requirements: Diversity Includes Disability — Premium Website (v2)

**Defined:** 2026-07-04
**Core Value:** Every visitor gets a first-class experience — the premium 3D showcase never comes at the cost of accessibility, and the Accessible mode is a genuine peer, not a degraded fallback.

## v1 Requirements

### Foundation & Deploy

- [x] **FOUND-01**: Site builds as a fully static, prerendered bundle via `@sveltejs/adapter-static`
- [x] **FOUND-02**: Site deploys to GitHub Pages at the repo subpath with all assets (including `_app/`) loading correctly (`paths.base`, `.nojekyll`)
- [x] **FOUND-03**: Deep links and page refreshes resolve without a 404 (trailingSlash / fallback handled)
- [x] **FOUND-04**: `three` is pinned to an exact version compatible with the installed Threlte v8, enforced via the lockfile

### Mode System

- [x] **MODE-01**: A persistent header toggle switches the whole site between Premium (3D) and Accessible modes
- [x] **MODE-02**: The chosen mode persists across page loads and revisits via localStorage
- [x] **MODE-03**: Site defaults to Accessible mode when the OS signals `prefers-reduced-motion: reduce`, unless the user has an explicit stored choice
- [x] **MODE-04**: The resolved mode is applied before first paint — no flash of the wrong mode (no FOUC)
- [x] **MODE-05**: Toggling mode announces the change to screen readers (`aria-live`) and preserves keyboard focus and scroll position
- [x] **MODE-06**: The toggle is keyboard-operable with correct switch semantics (`aria-pressed`/role) and a visible focus state
- [x] **MODE-07**: If WebGL is unsupported or unavailable, the site loads in Accessible mode automatically

### Content

- [x] **CONT-01**: All site copy and data live in a single typed source consumed by both modes, making content parity structural
- [x] **CONT-02**: Both modes present identical information and CTAs — nothing is reachable in only one mode
- [x] **CONT-03**: Social-proof content uses only real, attributable material; unfilled slots are clearly marked "content pending" and never fabricated

### Sections & Pages

- [ ] **SECT-01**: Home page with hero, mission statement, services overview, and a primary CTA
- [ ] **SECT-02**: Services detail covering trainings & facilitation, disability consulting, modeling for representation, and speaking/panels
- [ ] **SECT-03**: About page presenting Eman Rimawi's bio
- [ ] **SECT-04**: Social-proof section featuring a real DID engagement (e.g. the Manhattan Borough President training) with a marked slot for future testimonials/logos/press
- [ ] **SECT-05**: Contact section with a prominent `mailto` "Let's Connect" CTA (emanrimawi@gmail.com) and social links (Facebook, X/Twitter, LinkedIn, Instagram)
- [ ] **SECT-06**: Accessibility statement page, linked from the primary navigation
- [ ] **SECT-07**: Layout is responsive from mobile to desktop in both modes

### Accessibility

- [ ] **A11Y-01**: Skip links (to main content and to navigation) are available to keyboard users
- [ ] **A11Y-02**: Semantic heading hierarchy (single `h1` per page, ordered `h2`/`h3`) throughout
- [ ] **A11Y-03**: All links use descriptive text (no "click here")
- [ ] **A11Y-04**: Navigation disclosure menus expose `aria-expanded` state and close on Escape/blur
- [ ] **A11Y-05**: All interactive elements are keyboard-operable with visible focus states
- [x] **A11Y-06**: Text and UI meet WCAG 2.2 AA contrast against the DID blue/orange palette
- [ ] **A11Y-07**: Content stays usable at 200% zoom / resized text without loss of function
- [ ] **A11Y-08**: Accessible mode contains zero WebGL and no non-essential motion

### Premium 3D

- [ ] **PREM-01**: Premium mode renders an interactive WebGL hero scene (Threlte/Three.js)
- [ ] **PREM-02**: Premium mode presents 3D-enhanced content across the main sections via a single shared Canvas
- [ ] **PREM-03**: All Three.js/Threlte code is dynamically imported behind the Premium branch so the Accessible bundle ships zero WebGL bytes
- [ ] **PREM-04**: 3D assets are lazy-loaded and the render loop pauses when the tab is hidden or mode is Accessible
- [ ] **PREM-05**: WebGL resources are disposed on unmount to prevent memory leaks / context loss across repeated toggles
- [ ] **PREM-06**: Premium mode reduces/limits motion when `prefers-reduced-motion` is set, even if Premium was chosen manually

### Quality & Verification

- [ ] **QA-01**: Automated accessibility checks (axe) pass with no serious/critical violations in both modes
- [ ] **QA-02**: An automated test asserts Accessible mode loads no `three`/WebGL chunk
- [ ] **QA-03**: A keyboard-only and screen-reader walkthrough of every page passes in both modes

## v2 Requirements

Deferred to a future release.

### Social Proof

- **SOCL-01**: Real testimonials and client logos, once Eman supplies attributable material
- **SOCL-02**: Speaking/press engagement list

### Engagement

- **ENGA-01**: Scheduler integration (Calendly-style booking link)
- **ENGA-02**: Giving / donation link (blocked on 501(c)(3) resolution — no "tax-deductible" wording until then)

### Content

- **BLOG-01**: Blog / news feed
- **SEO-01**: Legacy Wix URL redirects for SEO continuity

## Out of Scope

Explicitly excluded from this project.

| Feature | Reason |
|---------|--------|
| Authentication / member login | Marketing site — the Wix "Log In" serves no purpose here |
| CMS / dynamic backend | Static content in-repo; no server |
| In-site payments / donation checkout | No backend; org is 501(c)(3) pending |
| Contact-form backend | Static hosting has no server; `mailto` covers v1 |
| Two separately-deployed sites | One codebase + toggle guarantees content parity |
| "WebGL accessible mode" | Accessible mode must be a true zero-WebGL peer |
| Credentials / EINs / personal address | SECURITY — never enters this repo |
| Grant tracker | Lives separately in `Websites/Rimawi/` |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| A11Y-06 | Phase 1 | Complete |
| CONT-01 | Phase 2 | Complete |
| CONT-02 | Phase 2 | Complete |
| CONT-03 | Phase 2 | Complete |
| MODE-01 | Phase 3 | Complete |
| MODE-02 | Phase 3 | Complete |
| MODE-03 | Phase 3 | Complete |
| MODE-04 | Phase 3 | Complete |
| MODE-05 | Phase 3 | Complete |
| MODE-06 | Phase 3 | Complete |
| MODE-07 | Phase 3 | Complete |
| SECT-01 | Phase 4 | Pending |
| SECT-02 | Phase 4 | Pending |
| SECT-03 | Phase 4 | Pending |
| SECT-04 | Phase 4 | Pending |
| SECT-05 | Phase 4 | Pending |
| SECT-06 | Phase 4 | Pending |
| SECT-07 | Phase 4 | Pending |
| A11Y-01 | Phase 4 | Pending |
| A11Y-02 | Phase 4 | Pending |
| A11Y-03 | Phase 4 | Pending |
| A11Y-04 | Phase 4 | Pending |
| A11Y-05 | Phase 4 | Pending |
| A11Y-07 | Phase 4 | Pending |
| A11Y-08 | Phase 4 | Pending |
| PREM-01 | Phase 5 | Pending |
| PREM-02 | Phase 5 | Pending |
| PREM-03 | Phase 5 | Pending |
| PREM-04 | Phase 5 | Pending |
| PREM-05 | Phase 5 | Pending |
| PREM-06 | Phase 5 | Pending |
| QA-01 | Phase 6 | Pending |
| QA-02 | Phase 6 | Pending |
| QA-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-07-04*
*Last updated: 2026-07-04 after roadmap creation (traceability populated)*
