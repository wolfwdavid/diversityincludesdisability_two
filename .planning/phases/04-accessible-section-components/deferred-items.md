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

## From 04-06 (a11y-responsive-verification) execution

- **Pre-existing SvelteKit scaffold E2E fails under the base-path preview.**
  - File: `src/routes/demo/playwright/page.svelte.e2e.ts`
  - Symptom: `test('has expected h1')` navigates to the base-less URL `/demo/playwright`;
    the preview is served under `BASE_PATH=/diversityincludesdisability_two`, so the real
    route is `/diversityincludesdisability_two/demo/playwright/` and the bare path yields no
    `<h1>` → `expect(locator('h1')).toBeVisible()` times out.
  - Why deferred: leftover `sv create` demo scaffold (the `demo/` route + its test),
    unrelated to this plan's changes (the four new `tests/*.e2e.ts` specs). Not caused by
    the current task (scope boundary).
  - Impact: the four plan-owned E2E specs are GREEN (19/19). Only the stray scaffold demo is
    red, so a bare `pnpm exec playwright test` reports 22 passed / 1 failed.
  - Suggested resolution: delete the `src/routes/demo/` scaffold route + its
    `page.svelte.e2e.ts`, or base-path-qualify its goto. Best as a `/gsd:quick` cleanup or
    folded into Phase 6 QA.
