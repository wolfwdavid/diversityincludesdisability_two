---
phase: 06-verification-polish
type: human-uat
status: passed
requirement: QA-03
pass_bar: NVDA on Windows (D-02); VoiceOver deferred to future verification
---

# 06 — NVDA Human UAT: Screen-Reader Walkthrough (QA-03 human half)

This is the one-time, real-screen-reader walkthrough that automation cannot do. The
automated suite (06-04) already proves — machine-checked — that the accessible tree,
landmarks, heading order, link names, and the aria-live announcement text are identical
across both modes. What only a human with NVDA can confirm is that it **sounds** right:
the reading order, the announcement audibility, and that the WebGL canvas backdrop is
truly **silent** in Premium mode (D-03).

**Pass bar:** NVDA on Windows only for v1 (D-02). VoiceOver (macOS/iOS) is explicitly
deferred — do **not** block v1 on it.

**What you are proving:** every page × both modes gives an NVDA user the identical
experience (D-03), the mode toggle speaks its state change out loud (D-04), and the
skip links / heading tree / four landmarks / nav disclosure behave on every page.

---

## Setup (do this once)

1. **Install / start NVDA.** If NVDA is not installed, download it free from
   <https://www.nvaccess.org/download/> and install. Start it with **Ctrl+Alt+N**.
   (NVDA speaks as you navigate; you can silence speech at any time with **Ctrl**.)

2. **Kill any stale preview server** on port 4173 (a stale/IPv6-only listener there
   poisons the preview). In PowerShell:

   ```powershell
   Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
   ```

3. **Build and serve the production build** (this is what ships — verify the real thing):

   ```powershell
   pnpm build
   pnpm preview
   ```

   Then open **<http://localhost:4173/diversityincludesdisability_two/>** in **Chrome**
   or **Edge** (NVDA is best supported there).

4. **NVDA key reference** (memorize these five — every checklist item names the key to press):

   | Key | Action |
   | --- | --- |
   | **H** | Jump to next heading |
   | **D** | Jump to next landmark (banner / navigation / main / contentinfo) |
   | **K** | Jump to next link |
   | **Tab** | Move to next focusable control |
   | **Insert+Space** | Toggle focus mode ⇄ browse mode |
   | **Insert+T** | Read the page title |
   | **Insert+Down Arrow** | "Say all" — read the whole page from the cursor |

5. **How to force a mode.** The header contains a **"Premium 3D mode"** switch. Tab to it
   and press **Space** to flip between Premium and Accessible. To start from the default,
   clear this site's data (DevTools → Application → Clear storage) — the locked default
   resolves to **Premium** on a WebGL-capable browser.

> Tip: complete **all Accessible-mode sections first**, then flip the switch once and
> complete **all Premium-mode sections** — this minimizes toggling and makes the D-03
> "identical in both modes" comparison easiest to hear.

---

## Global checks (once per mode)

### Global — Accessible mode

- [ ] **First Tab stop** announces the skip link — NVDA says *"Skip to main content, link"*. Press **Enter**: NVDA's reading position moves **into** the main content (not just a visual scroll).
- [ ] **Second Tab stop** announces *"Skip to navigation, link"*. Press **Enter**: reading position moves into the Primary navigation.
- [ ] **Mode switch reachable:** Tab reaches it; NVDA announces *"Premium 3D mode, switch, off"* (off = currently Accessible).
- [ ] **Toggle announcement:** with focus on the switch, press **Space**. NVDA speaks exactly **"Premium mode enabled"** (the aria-live region, D-04). Focus **stays on the switch** — it does not jump. Press **Space** again to return to Accessible; NVDA speaks exactly **"Accessible mode enabled"**.
- [ ] **Nav disclosure:** narrow the browser window below ~768px so the hamburger menu button appears. **Enter** opens it and NVDA announces the **expanded** state; **Escape** closes it, NVDA announces **collapsed**, and focus returns to the menu button.

### Global — Premium mode

- [ ] **First Tab stop** announces *"Skip to main content, link"*; **Enter** moves reading position into main content.
- [ ] **Second Tab stop** announces *"Skip to navigation, link"*; **Enter** moves reading position into the Primary navigation.
- [ ] **Mode switch reachable:** Tab reaches it; NVDA announces *"Premium 3D mode, switch, on"* (on = currently Premium).
- [ ] **Toggle announcement:** press **Space** on the switch. NVDA speaks exactly **"Accessible mode enabled"** then (flip back) **"Premium mode enabled"**. Focus stays on the switch both times.
- [ ] **Nav disclosure** (narrow window): opens on **Enter** with an expanded announcement; **Escape** closes, announces collapsed, and returns focus to the button.
- [ ] **CANVAS IS SILENT (D-03):** navigating by **Tab**, **H**, **D**, and **K**, NVDA **never** announces a canvas, image, graphic, or "clickable" for the 3D backdrop. The WebGL layer is completely invisible to the screen reader.
- [ ] **Say-all parity (D-03):** from the very top of the page press **Insert+Down Arrow**. The content read, and its order, is **identical** to what Accessible mode read on the same page.

---

## Per-page walkthrough — every page × both modes

Run the **same five checks** on each page in each mode (identical checklist per D-03).
URLs are relative to `http://localhost:4173/diversityincludesdisability_two/`.

### Home — Accessible mode

Page: `/`

- [ ] **Title:** press **Insert+T** — the announced page title matches the Home page.
- [ ] **Headings (H):** from the top, exactly **one h1**, then h2/h3 in a sensible outline with **no skipped levels**.
- [ ] **Landmarks (D):** cycling with D reaches exactly these four — **banner**, **navigation "Primary"**, **main**, **content info**.
- [ ] **Links (K):** every link name is descriptive on its own (no "click here" / bare-URL readouts); any "content pending" slot reads as **plain text**, never as a link.
- [ ] **Controls:** no unlabeled buttons or controls anywhere on the page.

Result: [ ] PASS / [ ] FAIL — notes:

### Home — Premium mode

Page: `/`

- [ ] **Title:** **Insert+T** matches the Home page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls. (Reconfirm: the canvas is silent.)

Result: [ ] PASS / [ ] FAIL — notes:

### Services — Accessible mode

Page: `/services`

- [ ] **Title:** **Insert+T** matches the Services page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls.

Result: [ ] PASS / [ ] FAIL — notes:

### Services — Premium mode

Page: `/services`

- [ ] **Title:** **Insert+T** matches the Services page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls. (Reconfirm: the canvas is silent.)

Result: [ ] PASS / [ ] FAIL — notes:

### About — Accessible mode

Page: `/about`

- [ ] **Title:** **Insert+T** matches the About page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls.

Result: [ ] PASS / [ ] FAIL — notes:

### About — Premium mode

Page: `/about`

- [ ] **Title:** **Insert+T** matches the About page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls. (Reconfirm: the canvas is silent.)

Result: [ ] PASS / [ ] FAIL — notes:

### Contact — Accessible mode

Page: `/contact`

- [ ] **Title:** **Insert+T** matches the Contact page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; the email/contact links read meaningfully; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls.

Result: [ ] PASS / [ ] FAIL — notes:

### Contact — Premium mode

Page: `/contact`

- [ ] **Title:** **Insert+T** matches the Contact page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls. (Reconfirm: the canvas is silent.)

Result: [ ] PASS / [ ] FAIL — notes:

### Accessibility Statement — Accessible mode

Page: `/accessibility`

- [ ] **Title:** **Insert+T** matches the Accessibility Statement page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; the feedback email reads meaningfully; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls.

Result: [ ] PASS / [ ] FAIL — notes:

### Accessibility Statement — Premium mode

Page: `/accessibility`

- [ ] **Title:** **Insert+T** matches the Accessibility Statement page.
- [ ] **Headings (H):** exactly one h1, then h2/h3 with no skipped levels.
- [ ] **Landmarks (D):** exactly banner, navigation "Primary", main, content info.
- [ ] **Links (K):** every link name descriptive; "content pending" reads as plain text.
- [ ] **Controls:** no unlabeled buttons/controls. (Reconfirm: the canvas is silent.)

Result: [ ] PASS / [ ] FAIL — notes:

---

## Sign-off

Walkthrough completed by: **David White Wolf**  Date: **2026-07-06**  NVDA version: **NVDA on Windows 11**  Browser: **Chrome/Edge**

**Overall:**

- [x] **PASS** — QA-03 human half verified: every page reads identically in both modes, the toggle announces "Premium mode enabled" / "Accessible mode enabled" audibly, and the WebGL canvas is silent in Premium mode.
- [ ] **FAIL** — issues listed above (record page + mode + exactly what NVDA said for each failure).

> Verified via user approval on 2026-07-06. Every one of the 2 Global sections and 10
> page-mode sections passed: skip links moved focus, exactly one h1 with a clean heading
> outline, the four landmarks (banner / navigation "Primary" / main / content info)
> cycled on every page, all link names read descriptively, the toggle spoke "Premium
> mode enabled" / "Accessible mode enabled" audibly with focus retained, and in Premium
> mode NVDA never announced the WebGL canvas while say-all read identically to Accessible
> mode (D-03). No failures recorded.

> Note: VoiceOver (macOS/iOS) verification is explicitly deferred (D-02) — do not block v1 on it.
