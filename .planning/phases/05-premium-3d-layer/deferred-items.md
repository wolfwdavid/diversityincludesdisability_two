# Phase 5 — Deferred Items

Out-of-scope discoveries logged during execution. Do not fix inline; schedule via `/gsd:quick` or a later plan.

## 1. Repo-wide prettier drift (`pnpm lint` fails at HEAD, pre-existing)

- **Found during:** 05-01 Task 2 verification (`pnpm lint`)
- **What:** `prettier --check .` fails on **78 files**, almost all untouched by 05-01: every `.planning/**` markdown/json doc, `CLAUDE.md`, `.prettierrc` itself, `src/app.html`, `src/lib/components/ModeToggle.svelte`, several `.spec.ts` files, `tests/mode.e2e.ts`, etc. Reproduces on a clean checkout of HEAD (`6af919c`) before any 05-01 edits.
- **Likely cause:** toolchain drift on a later `pnpm install` (prettier@3.9.4 / prettier-plugin-svelte@4.1.1 formatting changes, e.g. multi-attribute element wrapping in `.svelte`) plus GSD-written `.planning` docs that were never prettier-formatted. `.prettierignore` does not exclude `.planning/`.
- **05-01 status:** all four files this plan touched (`colors.ts`, `pairs.ts`, `tokens.css`, `app.css`) are prettier-clean and eslint-clean; the plan introduced zero new lint failures.
- **05-02 status:** confirmed independently — all 8 files 05-02 touched (`eslint.config.js` + the 7 `src/lib/premium/state/` modules/specs) pass `prettier --check` and `eslint`; `pnpm exec eslint .` exits 0 repo-wide. The drift is prettier-only and pre-existing.
- **Suggested fix:** single `/gsd:quick` pass — add `.planning/` to `.prettierignore` (planning docs are not shipped code), then `pnpm format` the remaining source files in one mechanical commit while no parallel executors are active. Re-baseline `pnpm lint` as a standing gate afterward.
