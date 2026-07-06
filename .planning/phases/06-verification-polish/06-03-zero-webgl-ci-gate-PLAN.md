---
phase: 06-verification-polish
plan: 03
type: execute
wave: 3
depends_on: ["06-02"]
files_modified:
  - tests/premium.e2e.ts
  - tests/mode.e2e.ts
  - .github/workflows/deploy.yml
autonomous: true
requirements: [QA-02]
must_haves:
  truths:
    - "An automated Playwright test proves, at the NETWORK level, that Accessible mode across ALL 5 routes downloads zero JS containing WebGL runtime signatures (WebGLRenderer|@threlte|THREE.)"
    - "The same test proves the premium chunk arrives ONLY after the toggle flips (behavioral lazy proof — hashed names never asserted)"
    - "A blocking @ci E2E subset (zero-WebGL + 12 axe scans + toggle smoke) runs in deploy.yml BEFORE upload-pages-artifact, so a regression can never reach the live site (D-09)"
  artifacts:
    - path: "tests/premium.e2e.ts"
      provides: "QA-02 network-level zero-WebGL assertion over all 5 routes, @ci-tagged"
      contains: "WebGLRenderer|@threlte|THREE\\."
    - path: ".github/workflows/deploy.yml"
      provides: "Critical E2E gate step + Playwright browser cache, ordered before Pages upload"
      contains: "--grep \"@ci\""
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "tests tagged @ci"
      via: "pnpm exec playwright test --grep \"@ci\""
      pattern: "playwright test --grep"
    - from: "tests/premium.e2e.ts QA-02 test"
      to: "scripts/check-premium-budget.mjs"
      via: "identical SIG regex — the E2E network gate and the byte-level build gate assert the same signature set"
      pattern: "WebGLRenderer\\|@threlte\\|THREE"
---

<objective>
Land QA-02 as a literal, network-level Playwright gate — Accessible mode requests no three/WebGL chunk on any route — and wire the D-08 critical E2E subset (this test + the 12 axe scans + a toggle smoke) into deploy.yml as a blocking step before the Pages upload (D-09), with browser caching keeping added CI time ~3-5 min.

Purpose: QA-02 is the Core Value's zero-WebGL guarantee as a CI regression gate. The static budget script already proves it at the byte level per build; this adds the runtime network-level proof the requirement literally asks for, and makes both un-bypassable before deploy.
Output: extended tests/premium.e2e.ts, @ci-tagged toggle smoke in tests/mode.e2e.ts, deploy.yml gate chain: three-pin → contrast → build → premium-budget → E2E subset → upload.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-verification-polish/06-CONTEXT.md
@tests/premium.e2e.ts
@tests/mode.e2e.ts
@.github/workflows/deploy.yml
@scripts/check-premium-budget.mjs

<interfaces>
From scripts/check-premium-budget.mjs — the minification-surviving signature set (reuse EXACTLY; a naive three|webgl grep false-positives on the accessibility statement's own prose — Phase-4 decision):
```javascript
const SIG = /WebGLRenderer|@threlte|THREE\./;
```

From tests/premium.e2e.ts — constants and conventions to reuse:
```typescript
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const HOME = BASE + '/';
// seeding: page.addInitScript(() => { try { localStorage.setItem('did2:mode', 'accessible'); } catch {} });
// toggle:  page.getByRole('switch').dispatchEvent('click');
// settle:  expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });
```
Phase-5 decision (05-05): hashed chunk names are brittle — NEVER assert a chunk filename; assert behaviorally (new .js request appears on toggle) + by response-body signature.

From .github/workflows/deploy.yml — the exact current build-job step chain the new steps slot into:
```yaml
      - run: pnpm install --frozen-lockfile
      - name: Verify three pin
      - name: Contrast gate (A11Y-06)
      - name: Build            # env BASE_PATH: '/${{ github.event.repository.name }}'
      - name: Premium chunk budget + zero-WebGL gate (PREM-03, D-07)
      - uses: actions/upload-pages-artifact@v5
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: QA-02 network-level zero-WebGL test (all 5 routes) + tag the toggle smoke @ci</name>
  <files>tests/premium.e2e.ts, tests/mode.e2e.ts</files>
  <read_first>
    - tests/premium.e2e.ts (existing 6 tests — test 1 already covers home-route lazy loading; the new test EXTENDS to all routes + signature bodies; do not delete or retitle the existing 6)
    - tests/mode.e2e.ts (the persistence test to tag @ci as the D-08 "mode-toggle smoke")
    - scripts/check-premium-budget.mjs line 22 (`const SIG = /WebGLRenderer|@threlte|THREE\./;` — copy this regex verbatim into the new test with a comment naming the script as the source)
  </read_first>
  <action>
    A) Append ONE new test to tests/premium.e2e.ts (after the existing 6, reusing BASE/HOME and a ROUTES const `['/', '/services/', '/about/', '/contact/', '/accessibility/']`):

    ```typescript
    test('accessible mode requests zero WebGL bytes across every route; premium chunk arrives only on toggle (QA-02) @ci', async ({
    	page
    }) => {
    	// Mirror of scripts/check-premium-budget.mjs SIG — the byte-level build gate and this
    	// network-level runtime gate must assert the SAME minification-surviving signature set.
    	const SIG = /WebGLRenderer|@threlte|THREE\./;

    	const jsBodies: Promise<{ url: string; body: string }>[] = [];
    	page.on('response', (r) => {
    		if (new URL(r.url()).pathname.endsWith('.js')) {
    			jsBodies.push(
    				r
    					.text()
    					.then((body) => ({ url: r.url(), body }))
    					.catch(() => ({ url: r.url(), body: '' }))
    			);
    		}
    	});

    	await page.addInitScript(() => {
    		try {
    			localStorage.setItem('did2:mode', 'accessible');
    		} catch {
    			/* ignore sandboxed storage */
    		}
    	});

    	// Full-page load of EVERY route in accessible mode — the complete accessible network surface.
    	for (const route of ROUTES) {
    		await page.goto(BASE + route);
    		await page.waitForLoadState('networkidle');
    		expect(await page.locator('canvas').count()).toBe(0);
    	}

    	const accessibleJs = await Promise.all(jsBodies);
    	const leaks = accessibleJs.filter((r) => SIG.test(r.body));
    	expect(leaks.map((l) => l.url)).toEqual([]); // QA-02: no three/WebGL chunk, network level

    	// Behavioral lazy proof (hashed names are brittle — 05-05 decision): toggling premium
    	// must fetch at least one .js URL the accessible surface never requested.
    	const seen = new Set(accessibleJs.map((r) => r.url));
    	await page.getByRole('switch').dispatchEvent('click');
    	await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });
    	const afterToggle = await Promise.all(jsBodies);
    	const fresh = afterToggle.filter((r) => !seen.has(r.url));
    	expect(fresh.length).toBeGreaterThan(0);
    	// ...and the premium payload really is the WebGL graph:
    	expect(fresh.some((r) => SIG.test(r.body))).toBe(true);
    });
    ```

    B) In tests/mode.e2e.ts, retitle the first test to append the tag — exact new title:
    `'persistence: the chosen mode survives a full page reload (MODE-01/02) @ci'`
    No other change to that file (it is prettier-formatted as of 06-01).

    C) Run the two touched suites locally (kill stale 4173 first — KNOWN TRAP):
    `powershell -Command "Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"` then
    `pnpm exec playwright test tests/premium.e2e.ts tests/mode.e2e.ts` → expect 10 passed (7 premium + 3 mode).
  </action>
  <verify>
    <automated>pnpm lint && pnpm exec playwright test tests/premium.e2e.ts tests/mode.e2e.ts</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm exec playwright test tests/premium.e2e.ts tests/mode.e2e.ts` output contains "10 passed", zero failed
    - `grep -c "WebGLRenderer|@threlte|THREE" tests/premium.e2e.ts` >= 1 (SIG mirrored)
    - `grep -c "@ci" tests/premium.e2e.ts` == 1 and `grep -c "@ci" tests/mode.e2e.ts` == 1
    - `pnpm exec playwright test --grep "@ci" --list` lists exactly 14 tests (12 axe from 06-02 + 1 QA-02 + 1 mode smoke)
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>QA-02 exists as a green, @ci-tagged, network-level test covering all 5 routes, aligned with the budget script's signature set; the D-08 subset is fully tagged (14 tests).</done>
</task>

<task type="auto">
  <name>Task 2: Wire the blocking @ci E2E subset into deploy.yml before the Pages upload (D-08/D-09)</name>
  <files>.github/workflows/deploy.yml</files>
  <read_first>
    - .github/workflows/deploy.yml (the exact step chain; new steps go between "Premium chunk budget + zero-WebGL gate" and "actions/upload-pages-artifact@v5")
    - playwright.config.ts (webServer: `pnpm run build && pnpm run preview`, port 4173, env BASE_PATH '/diversityincludesdisability_two', reuseExistingServer — in CI no server exists so Playwright builds+previews itself; the rebuild uses the SAME BASE_PATH as the Build step, so build/ content uploaded afterwards is unchanged)
  </read_first>
  <action>
    Insert exactly these three steps into the `build` job of .github/workflows/deploy.yml, AFTER the "Premium chunk budget + zero-WebGL gate (PREM-03, D-07)" step and BEFORE the `actions/upload-pages-artifact@v5` step (same blocking-gate-before-upload pattern as contrast and premium-budget — D-09):

    ```yaml
          - name: Cache Playwright browsers
            uses: actions/cache@v4
            with:
              path: ~/.cache/ms-playwright
              key: playwright-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}
          - name: Install Playwright browser (chromium)
            run: pnpm exec playwright install --with-deps chromium
          - name: Critical E2E gate (QA-01 axe both modes, QA-02 zero-WebGL, toggle smoke — D-08/D-09)
            run: pnpm exec playwright test --grep "@ci"
    ```

    Notes baked into the design (do not "optimize" them away):
    - chromium only: playwright.config.ts defines no `projects`, so the default single-project run is chromium — installing only chromium keeps the cold cache small.
    - The subset re-runs `pnpm build` inside Playwright's webServer with BASE_PATH pinned by config to '/diversityincludesdisability_two' (== the repo name the Build step used), so the build/ directory the upload step packages is byte-identical. Do NOT reorder the E2E gate before the budget gate — budget must gate the same build the run started from.
    - No full-suite run in CI: `--grep "@ci"` selects exactly the 14 tagged tests (~3-5 min with warm browser cache, per D-08). The full ~30-min suite stays local.

    Verification (local, since Actions can't run here):
    1. Step-order assertion:
       `awk '/Premium chunk budget/{b=NR} /Critical E2E gate/{e=NR} /upload-pages-artifact/{u=NR} END{exit !(b && e && u && b<e && e<u)}' .github/workflows/deploy.yml`
    2. Subset selection sanity: `pnpm exec playwright test --grep "@ci" --list` → exactly 14 tests.
    3. Full local subset run green: kill stale 4173, then `pnpm exec playwright test --grep "@ci"` → 14 passed.
    4. `pnpm lint` (deploy.yml is prettier-checked).
  </action>
  <verify>
    <automated>awk '/Premium chunk budget/{b=NR} /Critical E2E gate/{e=NR} /upload-pages-artifact/{u=NR} END{exit !(b && e && u && b<e && e<u)}' .github/workflows/deploy.yml && pnpm lint && pnpm exec playwright test --grep "@ci"</automated>
  </verify>
  <acceptance_criteria>
    - The awk step-order assertion exits 0 (budget < E2E gate < upload)
    - `grep -n 'playwright test --grep "@ci"' .github/workflows/deploy.yml` matches exactly one line
    - `grep -n "ms-playwright" .github/workflows/deploy.yml` matches (browser cache present)
    - `pnpm exec playwright test --grep "@ci"` locally reports "14 passed", zero failed
  </acceptance_criteria>
  <done>deploy.yml's gate chain is three-pin → contrast → build → premium-budget → blocking @ci E2E subset → upload: a QA-01/QA-02 regression can never reach the live site.</done>
</task>

</tasks>

<verification>
- `pnpm exec playwright test --grep "@ci"` → 14/14 green locally
- deploy.yml step order machine-asserted (budget → E2E → upload)
- QA-02 network assertion uses the budget script's exact SIG regex
</verification>

<success_criteria>
QA-02 satisfied: an automated Playwright test asserts Accessible mode loads no three/WebGL chunk at the network level across every route, and that test (plus the QA-01 matrix and toggle smoke) blocks the GitHub Pages deploy in CI.
</success_criteria>

<output>
After completion, create `.planning/phases/06-verification-polish/06-03-SUMMARY.md`
</output>
