# Deferred / Out-of-Scope Items — Phase 04

## From 04-02 (home-page) execution

- `src/lib/components/sections/About.svelte` (owned by a parallel wave-2 plan, e.g. 04-04)
  reports 2 svelte-check type errors during 04-02 execution:
  - 14:7 comparison `'pending'` vs `'published'` has no overlap
  - 15:37 `Property 'statement' does not exist` on the pending mission slot
  These files (About/Contact/ServicesDetail) were created concurrently by other agents and
  are NOT in 04-02's scope. Not fixed here. The owning plan / final orchestrator hook
  validates them. 04-02's own files (Hero, Mission, ServicesOverview, +page.svelte)
  typecheck clean in isolation.
