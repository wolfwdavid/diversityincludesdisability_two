# Deferred Items — Phase 01 foundation-tokens-live-deploy

Out-of-scope discoveries logged during execution. Do NOT fix inline; address in a future plan.

## From plan 01-01 (scaffold)

- **Scaffold example/demo routes cleanup.** The `sv` scaffold shipped `src/routes/demo/**`,
  `src/routes/demo/playwright/**`, `src/lib/vitest-examples/**`, and the default
  `src/routes/+page.svelte` ("Welcome to SvelteKit"). These prerender cleanly and do not
  block FOUND-01/02/03/04, but they are placeholder cruft. Remove or replace when the real
  home/content and test suite land (phases 2/4/6). Not fixed here to avoid scope creep.
