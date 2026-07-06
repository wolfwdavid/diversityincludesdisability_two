---
phase: 06-verification-polish
plan: 05
type: execute
wave: 5
depends_on: ["06-04"]
files_modified:
  - .planning/phases/06-verification-polish/06-HUMAN-UAT.md (NEW)
autonomous: false
requirements: [QA-03]
must_haves:
  truths:
    - "A persistent, step-by-step NVDA checklist exists covering every page in BOTH modes (10 page-mode sections), the toggle announcement, skip links, and the nav disclosure (D-01..D-04)"
    - "The user completes a real NVDA walkthrough against the checklist and the results are recorded in the file — QA-03's human half"
    - "The checklist explicitly tests D-03's claim: in Premium mode NVDA never mentions the canvas and the reading order matches Accessible mode exactly"
  artifacts:
    - path: ".planning/phases/06-verification-polish/06-HUMAN-UAT.md"
      provides: "Guided NVDA walkthrough checklist + recorded results"
      contains: "NVDA"
      min_lines: 100
  key_links:
    - from: "06-HUMAN-UAT.md"
      to: "ModeToggle aria-live announcement"
      via: "human-ear verification of 'Premium mode enabled' / 'Accessible mode enabled' (D-04 human half)"
      pattern: "Premium mode enabled"
---

<objective>
Produce the guided NVDA walkthrough checklist (the human half of QA-03 per D-01) and pause for the user to execute it: every page x both modes with the identical checklist (D-03 full parity sweep), the toggle announcement heard with the human ear (D-04), NVDA-on-Windows as the v1 pass bar (D-02).

Purpose: automation (06-04) proves the accessible tree is identical across modes; only a human with a real screen reader can verify it SOUNDS right — reading order, announcement audibility, and that the WebGL canvas is truly silent.
Output: .planning/phases/06-verification-polish/06-HUMAN-UAT.md, filled in and signed off by the user.
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
@src/lib/components/ModeToggle.svelte
@src/routes/+layout.svelte
@tests/sr-parity.e2e.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write the 06-HUMAN-UAT.md NVDA walkthrough checklist</name>
  <files>.planning/phases/06-verification-polish/06-HUMAN-UAT.md</files>
  <read_first>
    - src/lib/components/ModeToggle.svelte (the switch's accessible name is 'Premium 3D mode', role=switch with aria-checked; announcements are exactly 'Premium mode enabled' / 'Accessible mode enabled' — the checklist must quote these literals so the user knows precisely what to listen for)
    - src/routes/+layout.svelte (landmark inventory the user will navigate with NVDA's D key: banner → navigation 'Primary' → main → contentinfo; skip links are the first Tab stops)
    - .planning/phases/06-verification-polish/06-CONTEXT.md decisions D-01..D-04 (the checklist's contract: every page x both modes, identical items, NVDA-only for v1, VoiceOver deferred)
  </read_first>
  <action>
    Create `.planning/phases/06-verification-polish/06-HUMAN-UAT.md` with this structure (frontmatter: `phase: 06-verification-polish`, `type: human-uat`, `status: pending`, `pass_bar: NVDA on Windows (D-02); VoiceOver deferred to future verification`):

    1. **Setup section** (exact commands, no guesswork):
       - NVDA: free download from nvaccess.org if not installed; start with Ctrl+Alt+N.
       - Kill any stale preview: `powershell -Command "Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"`
       - Serve the production build: `pnpm build` then `pnpm preview`, open `http://localhost:4173/diversityincludesdisability_two/` in Chrome or Edge.
       - NVDA key reference table: H = next heading, D = next landmark, K = next link, Tab = next focusable, Insert+Space = toggle focus/browse mode, Insert+T = read title, Insert+Down = say all.
       - How to force a mode: use the 'Premium 3D mode' switch in the header (Tab to it, press Space), or clear site data to get the default.

    2. **Global checks (once per mode)** — two subsections, `### Global — Accessible mode` and `### Global — Premium mode`, each with:
       - [ ] First Tab stop announces the skip link ("Skip to main content, link"); Enter moves NVDA's reading position INTO main content (not just scroll).
       - [ ] Second skip link ("Skip to navigation") works the same way.
       - [ ] Mode switch: Tab reaches it; NVDA announces "Premium 3D mode, switch" plus on/off state matching the current mode.
       - [ ] Pressing Space on the switch: NVDA speaks exactly "Premium mode enabled" or "Accessible mode enabled" (the aria-live region, D-04 human half) and focus STAYS on the switch.
       - [ ] Nav disclosure (narrow the browser window below ~768px so the menu button appears): Enter opens it and NVDA announces the expanded state; Escape closes it, announces collapsed, and focus returns to the button.
       - Premium-mode-only extra items:
         - [ ] NVDA NEVER announces a canvas, image, graphic, or "clickable" for the 3D backdrop — the WebGL layer is completely silent (D-03).
         - [ ] Insert+Down (say all) from the top of the page reads the same content, in the same order, as Accessible mode.

    3. **Per-page sections — 10 total** (Home, Services, About, Contact, Accessibility Statement — each once in Accessible mode and once in Premium mode; identical checklist per D-03). Each section header like `### Home — Accessible mode` with:
       - [ ] Page title announced on load (Insert+T) and it matches the page.
       - [ ] H key from the top: exactly ONE h1, then h2/h3 in a sensible outline order with no skipped levels.
       - [ ] D key cycles exactly these landmarks: banner, navigation "Primary", main, content info.
       - [ ] K key: every link name is descriptive on its own (no "click here"/bare URL readouts); "content pending" slots read as plain text, never as links.
       - [ ] No unlabeled buttons/controls encountered anywhere on the page.
       - Result line: `Result: [ ] PASS / [ ] FAIL — notes:`

    4. **Sign-off block**:
       - `Walkthrough completed by: ____  Date: ____  NVDA version: ____  Browser: ____`
       - `Overall: [ ] PASS — QA-03 human half verified / [ ] FAIL — issues listed above`
       - Note: VoiceOver (macOS/iOS) verification is explicitly deferred (D-02) — do not block on it.

    Keep every checklist item concrete enough that a non-SR-expert can execute it (name the NVDA key for each step). The file lives in .planning/ so it is prettier-ignored (06-01) and persists as the permanent QA-03 evidence record. Commit the file before the checkpoint.
  </action>
  <verify>
    <automated>bash -c 'test -f .planning/phases/06-verification-polish/06-HUMAN-UAT.md && [ "$(grep -c "^### " .planning/phases/06-verification-polish/06-HUMAN-UAT.md)" -ge 12 ] && grep -q "Premium mode enabled" .planning/phases/06-verification-polish/06-HUMAN-UAT.md && grep -q "NVDA" .planning/phases/06-verification-polish/06-HUMAN-UAT.md'</automated>
  </verify>
  <acceptance_criteria>
    - File exists at .planning/phases/06-verification-polish/06-HUMAN-UAT.md with >= 100 lines
    - `grep -c "^### "` >= 12 (2 global sections + 10 page-mode sections)
    - Contains the literal strings "Premium mode enabled", "Accessible mode enabled", "Premium 3D mode", "NVDA", and "pnpm preview"
    - Every one of the 5 pages appears twice in section headers (once "— Accessible mode", once "— Premium mode")
    - Frontmatter contains `status: pending`
  </acceptance_criteria>
  <done>A complete, self-serve NVDA walkthrough checklist exists and is committed — the user can execute QA-03's human half with zero additional instructions.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: NVDA walkthrough — every page, both modes (QA-03 human half)</name>
  <files>.planning/phases/06-verification-polish/06-HUMAN-UAT.md (filled in by the user during the walkthrough)</files>
  <action>PAUSE for human verification. Present the how-to-verify instructions below to the user, then wait. Claude's part is complete once Task 1's checklist is committed — the walkthrough itself is human-only (NVDA speech output cannot be automated). On resume: if approved, set the checklist frontmatter status to passed (if the user has not already) and record the outcome in the SUMMARY; if failures are reported, record each one verbatim for /gsd:plan-phase 6 --gaps.</action>
  <verify>Manual: 06-HUMAN-UAT.md sign-off block filled in with overall PASS, or failures enumerated per page + mode. No automated command exists for speech perception (see 06-VALIDATION.md Manual-Only Verifications).</verify>
  <what-built>
    The full automated QA lattice is green: strict-0 axe in both modes (12 scans), the network-level zero-WebGL gate, both-modes keyboard tests, cross-mode aria-snapshot parity (machine proof the canvas is silent), and the aria-live announcement assertion. What automation cannot do is LISTEN — this checkpoint is the one-time real screen-reader verification (D-01), with NVDA on Windows as the v1 pass bar (D-02).
  </what-built>
  <how-to-verify>
    1. Open `.planning/phases/06-verification-polish/06-HUMAN-UAT.md` and follow its Setup section (kill stale 4173, `pnpm build`, `pnpm preview`, open http://localhost:4173/diversityincludesdisability_two/ with NVDA running).
    2. Work through the 2 Global sections and all 10 page-mode sections, ticking each checkbox and filling each Result line as you go. The critical listening targets:
       - The toggle speaks exactly "Premium mode enabled" / "Accessible mode enabled" (D-04).
       - In Premium mode NVDA never mentions the canvas/graphic, and say-all reads identically to Accessible mode (D-03).
       - Skip links, heading order (single h1), the four landmarks, and the nav disclosure behave per the checklist on every page.
    3. Fill in the sign-off block (name, date, NVDA version, browser) and set the frontmatter `status:` to `passed` or `failed`.
  </how-to-verify>
  <resume-signal>Type "approved" if the sign-off is PASS, or describe every failed checklist item (page + mode + what NVDA said) so gap-closure plans can be created.</resume-signal>
  <done>06-HUMAN-UAT.md is fully filled in with an overall PASS (or failures are enumerated for gap closure) — QA-03 is verified end-to-end.</done>
</task>

</tasks>

<verification>
- 06-HUMAN-UAT.md exists, complete (12+ sections), committed
- Checkpoint resolved: user typed "approved" with the sign-off block filled, or failures enumerated
</verification>

<success_criteria>
QA-03 fully satisfied: the automated proxies (06-04) plus a completed human NVDA walkthrough of every page in both modes, with the recorded checklist persisting as evidence. Phase 6's third success criterion is TRUE.
</success_criteria>

<output>
After completion, create `.planning/phases/06-verification-polish/06-05-SUMMARY.md`
</output>
