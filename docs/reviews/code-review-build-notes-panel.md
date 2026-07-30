# Code Review — Toggleable Build Notes & About Panel

> Single source of truth for the code review of commit `1944e90`. Keep this document up to date with current status as findings are fixed or dismissed.

**Created:** 2026-07-17
**Last Updated:** 2026-07-17
**Status:** In Progress — review complete, remediation not started

---

## Overview

Review of commit `1944e90` ("Add toggleable inline build notes and About panel") at extra-high (`xhigh`) effort, tuned for recall: catch every real bug, err on the side of surfacing.

The commit adds a `ui` Redux slice with a localStorage-persisted `notesVisible` preference, a `PanelNote` component pinned under each dashboard panel, a `BuildNotes` body rendered in a new wide `SlideOver`, three new icons, and the supporting CSS.

**Scope resolution:** the working tree was clean and `origin/master` matched `HEAD`, so `git diff origin/master...HEAD` was empty. Per the fallback rule the review targets the most recent commit, `git diff HEAD~1`.

**Method:** 10 independent finder angles (5 correctness, 3 cleanup, 1 altitude, 1 conventions) run in sequence, then dedup, then a gap sweep. No verify pass — findings are reported without adversarial confirmation, so `verdict` is absent by design.

**Conventions angle returned nothing.** No `CLAUDE.md` exists at the repo root or under `client/`. The user-level `~/.claude/CLAUDE.md` governs `~/.claude/` only and explicitly states "This file does not impose a code style of its own," so it does not apply to this repo.

### Files reviewed

| File | Change |
|------|--------|
| `client/src/App.tsx` | +45 — Notes toggle, About button, `PanelNote` in list panel |
| `client/src/app/store.ts` | +12 — `ui` reducer, persistence subscription |
| `client/src/features/ui/uiSlice.ts` | new, 52 — slice, localStorage read/write |
| `client/src/features/ui/uiSlice.test.ts` | new, 26 — reducer tests |
| `client/src/components/BuildNotes.tsx` | new, 126 — About panel body |
| `client/src/components/PanelNote.tsx` | new, 20 — inline annotation |
| `client/src/components/SlideOver.tsx` | +10 — `wide` prop |
| `client/src/components/icons.tsx` | +23 — `InfoIcon`, `EyeIcon`, `EyeOffIcon` |
| `client/src/features/charts/BacklogChart.tsx` | +6 — `PanelNote` |
| `client/src/features/charts/StatusPipeline.tsx` | +6 — `PanelNote` |
| `client/src/features/stats/StatCards.tsx` | +47/-24 — `PanelNote`, section restructure |
| `client/src/index.css` | +112 — panel-note, build-notes, wide slide-over |

---

## Current Status

Findings ranked most-severe first. Correctness outranks cleanup, altitude, and hygiene.

| # | Finding | File:Line | Category | Status | Notes |
|---|---------|-----------|----------|--------|-------|
| 1 | Latency claim contradicts server on GET and DELETE | `client/src/components/BuildNotes.tsx:108` | correctness | TODO | Wrong in both directions; teaching artifact |
| 2 | `aria-pressed` contradicts the state-encoding `aria-label` | `client/src/App.tsx:61` | accessibility | TODO | Announces state backwards |
| 3 | Bad stored value becomes `false`, not the fallback | `client/src/features/ui/uiSlice.ts:12` | correctness | TODO | `fallback` param ignored for unrecognized values |
| 4 | Focus-trap effect re-runs when `onClose` identity changes | `client/src/components/SlideOver.tsx:60` | correctness | TODO | **Latent, not currently reproducible** — see note |
| 5 | `notesVisibilitySet` is dead, used only by its own test | `client/src/features/ui/uiSlice.ts:42` | simplification | TODO | Delete all three, or wire it up |
| 6 | `initialState` reads localStorage at module-import time | `client/src/features/ui/uiSlice.ts:32` | altitude | TODO | Forecloses `preloadedState`; causes #7 |
| 7 | Hand-rolled subscribe+diff vs listener middleware | `client/src/app/store.ts:16` | altitude | TODO | Won't survive a second preference |
| 8 | Persistence round-trip has zero coverage | `client/src/features/ui/uiSlice.test.ts:8` | test-coverage | TODO | Blocked on #6 (needs a hydration seam) |
| 9 | Mono code-chip recipe duplicated across four rules | `client/src/index.css:176` | reuse | TODO | Collapse to one `.code-chip` base |
| 10 | Comment says two topbar buttons; this diff added a third | `client/src/index.css:792` | comment-hygiene | TODO | Stale on arrival |

---

## Findings

### 1. Latency claim contradicts the server on both GET and DELETE

**File:** `client/src/components/BuildNotes.tsx:108`
**Category:** correctness

The About panel states latency is applied "on the mutating routes", but the server applies it to a non-mutating route and omits it from a mutating one.

**Failure scenario:** A reader opens "About this build" and reads that artificial latency is on the mutating routes. `server/server.js:51` applies `latency` to `GET /api/tickets` (not mutating), and `server/server.js:103` `DELETE /api/tickets/:id` has no `latency` middleware at all (mutating). So the claim is wrong in both directions: a reader who deletes a ticket expecting a visible loading state sees none, and one who reads the sentence concludes the initial list load is instant when it is the one route deliberately delayed 250ms. In a build whose stated purpose is teaching, a confidently-wrong architecture note is the primary defect class.

**The claim, `client/src/components/BuildNotes.tsx:107-108`:**

```
The server also runs request logging, express.json() body parsing, CORS, and
a small artificial latency on the mutating routes — enough delay to make the
loading states visible instead of theoretical.
```

**The server, `server/server.js`:**

```js
// Simulate real network latency so the loading states are exercised.
const latency = (req, _res, next) => setTimeout(next, 250);

app.get("/api/tickets", latency, (_req, res) => { ... });        // :51  NOT mutating, HAS latency
app.get("/api/tickets/:id", (req, res) => { ... });              // :56  no latency
app.post("/api/tickets", latency, (req, res) => { ... });        // :63  mutating, has latency  ✓
app.patch("/api/tickets/:id", latency, (req, res) => { ... });   // :83  mutating, has latency  ✓
app.delete("/api/tickets/:id", (req, res) => { ... });           // :103 MUTATING, NO latency
```

**Verified as accurate in the same sentence** (do not "fix" these): request logging exists at `server/server.js:11-14`, `express.json()` at `:8`, CORS at `:7`.

---

### 2. `aria-pressed` contradicts the state-encoding `aria-label`

**File:** `client/src/App.tsx:61`
**Category:** accessibility

The Notes toggle sets both `aria-pressed={notesVisible}` and an aria-label that encodes the action rather than a static name, so the announced name and state disagree.

**Failure scenario:** With notes visible, a screen reader announces "Hide inline build notes, toggle button, pressed". A pressed button named "Hide..." reads as "hiding is currently ON", i.e. notes are hidden — the exact opposite of the true state. The icon adds a third signal: `notesVisible ? <EyeIcon/> : <EyeOffIcon/>` encodes state, while the label encodes action, so the two contradict. With `aria-pressed` present, the accessible name must stay static (e.g. always "Inline build notes") and let the pressed state carry the toggle.

**Current, `client/src/App.tsx:56-65`:**

```tsx
<button
  className="btn btn-ghost"
  data-active={notesVisible}
  onClick={() => dispatch(notesToggled())}
  aria-pressed={notesVisible}
  aria-label={notesVisible ? "Hide inline build notes" : "Show inline build notes"}
>
  {notesVisible ? <EyeIcon /> : <EyeOffIcon />}
  <span className="btn-label">Notes</span>
</button>
```

The three signals must agree. `aria-pressed` and the eye icon both encode **state**; the label must therefore also be static, not an **action**.

---

### 3. Bad stored value becomes `false`, not the fallback

**File:** `client/src/features/ui/uiSlice.ts:12`
**Category:** correctness

`readStoredPreference` accepts a `fallback` parameter but only honors it when the key is absent; any unrecognized stored string resolves to `false`.

**Failure scenario:** `return raw === null || raw === undefined ? fallback : raw === "true"` means a stored value of `"1"`, `"yes"`, or a JSON-quoted `"\"true\""` (from a future serialization change, a legacy key, or manual edit) yields `false` — silently flipping the documented "on by default" behavior with no way for the user to know why. The fallback should apply to any value that is not recognizably `"true"` or `"false"`, not just to a missing key.

**Current, `client/src/features/ui/uiSlice.ts:9-16`:**

```ts
function readStoredPreference(fallback: boolean): boolean {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw === null || raw === undefined ? fallback : raw === "true";
  } catch {
    return fallback;
  }
}
```

Note the `try`/`catch` around property access is correct and should stay — Safari private mode throws a `SecurityError` on `localStorage` access itself, not just on the method call.

---

### 4. Focus-trap effect re-runs when `onClose` identity changes

**File:** `client/src/components/SlideOver.tsx:60`
**Category:** correctness
**Reproducible today: NO — latent.**

The focus-trap effect depends on `[onClose]`, but every call site passes a fresh inline arrow, so any re-render of App tears down and rebuilds the trap.

**Failure scenario:** Both call sites pass `onClose={() => setShowNew(false)}` / `() => setShowAbout(false)`, which are new function identities on every App render. Any App re-render while a panel is open runs the cleanup (`prevFocus?.focus()`, clearing `document.body.style.overflow`) and re-runs setup, yanking focus back to the first input or the close button and losing the user's place. Today this is latent rather than live — App only subscribes to `status`, `error`, and `notesVisible`, and `createTicket.fulfilled` does not touch `status` — but this diff adds the `notesVisible` subscription, and the fragility fires the moment App gains any subscription that changes while a panel is open. Wrapping `onClose` in `useCallback` at the call sites, or splitting the Escape handler out of the focus-restore effect, removes the coupling.

**Why it cannot fire today** (traced, do not treat as a live bug):

- `App` subscribes only to `selectTicketsStatus`, `selectTicketsError`, `selectNotesVisible`.
- `client/src/features/tickets/ticketsSlice.ts` mutates `state.status` only in the `fetchTickets.pending` / `.fulfilled` / `.rejected` cases. `createTicket.fulfilled`, `updateTicket.fulfilled`, and `deleteTicket.fulfilled` do **not** touch `status`, so submitting the New-ticket form does not re-render `App`.
- The Notes toggle would re-render `App`, but while a panel is open the scrim blocks pointer events and the focus trap prevents tabbing to it.

Included because this commit adds the `notesVisible` subscription and moves the component closer to the failure, not because a reproduction exists.

---

### 5. `notesVisibilitySet` is dead, used only by its own test

**File:** `client/src/features/ui/uiSlice.ts:42`
**Category:** simplification

`notesVisibilitySet` has a reducer case, an export, and a test, but nothing in the application dispatches it.

**Failure scenario:** Grepping `notesVisibilitySet` across the repo returns only `uiSlice.ts` (definition + export) and `uiSlice.test.ts`. The only real toggle path is `notesToggled` from `client/src/App.tsx:59`. The cost: a reducer case, a public action-creator export, and a test that together imply an API surface the app does not use, and the test's passing gives false confidence that a used code path is covered. Delete all three, or wire the setter to something real.

**Evidence:**

```
./client/src/features/ui/uiSlice.test.ts:2   import reducer, { notesToggled, notesVisibilitySet } from "./uiSlice";
./client/src/features/ui/uiSlice.test.ts:19  it("notesVisibilitySet assigns explicitly, without toggling", ...
./client/src/features/ui/uiSlice.test.ts:20  const state = reducer(initial(), notesVisibilitySet(false));
./client/src/features/ui/uiSlice.test.ts:24  expect(reducer(state, notesVisibilitySet(false)).notesVisible).toBe(false);
./client/src/features/ui/uiSlice.ts:42       notesVisibilitySet(state, action: PayloadAction<boolean>) {
./client/src/features/ui/uiSlice.ts:48       export const { notesToggled, notesVisibilitySet } = uiSlice.actions;
```

No production call site.

---

### 6. `initialState` reads localStorage at module-import time

**File:** `client/src/features/ui/uiSlice.ts:32`
**Category:** altitude

`initialState` calls `readStoredPreference` at module evaluation, making the slice impure at construction rather than hydrating through the store's intended seam.

**Failure scenario:** The localStorage read happens once when the module is first imported and is then frozen for the process lifetime. The state cannot be reset between tests, the read cannot be stubbed without module-registry tricks, and `reducer(undefined, ...)` returns a snapshot of whatever the environment held at import. `configureStore` already provides `preloadedState` for exactly this hydration, which would keep the reducer pure and make the stored value an explicit, injectable input. The current shape is why the test at `client/src/features/ui/uiSlice.test.ts:8` can only assert the fallback.

**Current, `client/src/features/ui/uiSlice.ts:31-33`:**

```ts
const initialState: UiState = {
  notesVisible: readStoredPreference(true),   // evaluated once, at import
};
```

This finding is upstream of #8 — fixing the coverage gap requires this seam.

---

### 7. Hand-rolled subscribe+diff vs listener middleware

**File:** `client/src/app/store.ts:16`
**Category:** altitude

Persistence is implemented as a manual `store.subscribe` with a module-level `lastNotesVisible` diff variable, re-implementing what Redux Toolkit's listener middleware provides.

**Failure scenario:** The callback runs on every dispatched action for the whole app — every fetch, filter change, and ticket update — calling `getState()` and diffing one boolean, and the previous-value tracking lives in mutable module state that a re-import in tests would leave stale. It also does not generalize: a second persisted preference means a second `lastX` variable and a second `if` inside shared store setup. RTK's `createListenerMiddleware` with an `actionCreator: notesToggled` predicate expresses the same intent, scoped to the one action, with no module-level mutable state and a clean path to a second preference.

**Current, `client/src/app/store.ts:14-22`:**

```ts
// Mirror the one persisted preference back to localStorage on change.
let lastNotesVisible = store.getState().ui.notesVisible;
store.subscribe(() => {
  const { notesVisible } = store.getState().ui;
  if (notesVisible !== lastNotesVisible) {
    lastNotesVisible = notesVisible;
    persistNotesVisible(notesVisible);
  }
});
```

Special-casing one field inside shared store infrastructure is the altitude smell: the mechanism should generalize instead.

---

### 8. Persistence round-trip has zero coverage

**File:** `client/src/features/ui/uiSlice.test.ts:8`
**Category:** test-coverage
**Blocked on:** #6

The new tests cover only the two pure reducer cases; neither `readStoredPreference` nor `persistNotesVisible` — the parts that can actually break — is exercised.

**Failure scenario:** Vitest has no `environment` set in `client/vite.config.ts`, so it defaults to `node`, where `globalThis.localStorage` is undefined and `readStoredPreference` always short-circuits to the `fallback`. `expect(initial()).toEqual({ notesVisible: true })` therefore passes by hitting the no-storage path and never touches the parsing logic. The `raw === "true"` bug above (#3), a wrong `STORAGE_KEY`, or a broken `persistNotesVisible` would all ship green. Covering the round-trip needs a stubbed `globalThis.localStorage` and a hydration seam the module-load read currently prevents.

**Evidence** — `client/vite.config.ts` has no `test` block at all:

```ts
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:4000" } },
});
```

No `environment: "jsdom"`, so Vitest's `node` default applies and `globalThis.localStorage` is `undefined`.

---

### 9. Mono code-chip recipe duplicated across four rules

**File:** `client/src/index.css:176`
**Category:** reuse

The same inline-code chip styling is written out four times with small variations instead of one shared class.

**Failure scenario:** `.panel-note-api, .panel-note-inline` (176), `.bn-api` (~665), `.bn-route` (~676), and `.bn-inline` (~695) each independently repeat `font-family: var(--font-mono)` plus a font-size, color, background, border-radius, and padding that differ only in accent-vs-neutral ink and 10.5px-vs-11.5px. Changing the chip's radius, padding, or mono stack means finding and editing four blocks, and the 10.5/11.5px split between `.panel-note-api` and `.bn-inline` already looks like drift rather than intent. A single `.code-chip` base with `--accent` and size modifiers collapses all four.

---

### 10. Comment says two topbar buttons; this diff added a third

**File:** `client/src/index.css:792`
**Category:** comment-hygiene

The mobile `.btn-label` rule's comment says "both topbar buttons collapse to icons", but this same commit made it three buttons.

**Failure scenario:** The comment and the third button (Notes, `client/src/App.tsx:56`) landed in the same commit, so the comment was stale on arrival. A reader on the next mobile change trusts "both", checks two buttons, and misses that About and Notes also collapse — each relying on its own aria-label for its accessible name once the text is hidden. "topbar buttons collapse to icons" carries the same information without the count that will keep going stale.

**Current, `client/src/index.css:792`:**

```css
.btn-label { display: none; }          /* both topbar buttons collapse to icons */
```

---

## Verified and cleared

Checked during the review and found correct. Recorded so they are not re-litigated on the next pass.

| Hypothesis | Verdict |
|-----------|---------|
| `StatCards` wrapping `.kpi-row` in a new `<section>` breaks the grid or spacing | **Cleared.** `.content` is a plain block (`max-width` + `margin: 0 auto`), not a grid, so `.kpi-row` is unaffected by the extra wrapper. Its `margin-bottom: 22px` collapses through the class-less `<section>` identically. |
| `.slideover-wide` beats the mobile bottom-sheet rule | **Cleared.** `.slideover` (`index.css:619`), `.slideover-wide` (`:638`), and the `@media (max-width: 640px)` `.slideover` override (`:803`) all have specificity (0,1,0). Source order gives `.slideover-wide` the desktop width and the media-query rule the mobile `width: 100%`. Correct in both directions. |
| `uiSlice` ↔ `store` is a runtime circular import | **Cleared.** `uiSlice.ts:3` uses `import type { RootState }`, which is erased at compile time. Only `store.ts → uiSlice.ts` exists at runtime. |
| `InfoIcon`'s 0-length dot (`x1="12" y1="8" x2="12.01" y2="8"`) will not render | **Cleared.** `base()` in `icons.tsx:15` sets `strokeLinecap: "round"`, so the degenerate segment renders as a dot. |
| `data-active={notesVisible}` will not emit an attribute when `false` | **Cleared.** React serializes `data-*` attributes for `false` as `data-active="false"` (unlike regular boolean DOM props), so `.btn-ghost[data-active="true"]` matches exactly when intended. |
| Notes/About buttons fail WCAG 2.5.3 "Label in Name" | **Cleared.** Matching is case-insensitive substring: "Notes" ⊂ "Hide inline build notes", "About" ⊂ "About this build". The real defect is #2 (state vs. action), not 2.5.3. |
| The `GET /api/tickets/:id` route (`server.js:56`) is missing from the About route list | **Noted, not filed.** Genuine omission, but the route appears unused by the client and predates this diff. |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-07-17 | Initial document created — `xhigh` code review of `1944e90`, 10 findings, all TODO | Claude |
