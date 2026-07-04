# Deferred Items — Phase 01 foundation-tokens-live-deploy

Out-of-scope discoveries logged during execution. Do NOT fix inline; address in a future plan.

## From plan 01-01 (scaffold)

- **Scaffold example/demo routes cleanup.** The `sv` scaffold shipped `src/routes/demo/**`,
  `src/routes/demo/playwright/**`, `src/lib/vitest-examples/**`, and the default
  `src/routes/+page.svelte` ("Welcome to SvelteKit"). These prerender cleanly and do not
  block FOUND-01/02/03/04, but they are placeholder cruft. Remove or replace when the real
  home/content and test suite land (phases 2/4/6). Not fixed here to avoid scope creep.

## From plan 01-02 (tokens/contrast/premium-guard)

- **Repo-wide `prettier --check` debt (21 pre-existing files).** `pnpm lint` runs
  `prettier --check . && eslint .`. The `eslint .` half is GREEN (0 errors) including this
  plan's new `no-restricted-imports` premium guard. The `prettier --check` half fails on 21
  files that predate this plan and are unrelated to it: all 16 `.planning/**` GSD-generated
  docs, `CLAUDE.md`, `.prettierrc`, `.vscode/extensions.json`, plan-01's
  `scripts/check-three-pin.mjs`, and the scaffold's `src/lib/vitest-examples/Welcome.svelte.spec.ts`.
  None of plan 01-02's own files are in the list (all were `prettier --write` formatted).
  Per the executor scope-boundary rule these were NOT reformatted here (reformatting GSD
  planning docs + `CLAUDE.md` — which also carries an unrelated pending edit — is out of scope
  and risks churning generated artifacts). Recommended fix in a dedicated hygiene/lint plan:
  add `.planning/` and `.vscode/` to `.prettierignore` (planning artifacts should not be
  app-lint-gated), then `pnpm format` the genuine source/config files
  (`scripts/check-three-pin.mjs`, `vitest-examples`, `.prettierrc`, `CLAUDE.md`). This turns
  `pnpm lint` fully green without weakening any gate.
