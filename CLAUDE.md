# CLAUDE.md

Guidance for Claude Code working in `C:\dev\redux-support-dashboard`.

## What this is

A portfolio / teaching artifact, not a product. A full-stack support-ticket dashboard whose
purpose is to *demonstrate* production patterns: Redux Toolkit on the client (entity adapter,
async thunks, memoized selectors) and a plain Express REST API on the server. The UI is an
"operations console" with KPI cards, two charts, and a filterable + sortable ticket table.

Because it is a teaching artifact, **the explanatory copy is part of the deliverable**. The
`About this build` panel (`client/src/components/BuildNotes.tsx`) and the inline `PanelNote`
annotations describe how the code works. If you change behavior, check whether that prose is
still true. A confidently-wrong architecture note is the worst defect class here.

Remote: `https://github.com/Vibin-LLC-2025/redux-support-dashboard.git` · branch `master`.

## Shape

Two independent packages plus a thin root. **Not** an npm workspace: each package has its own
`package.json` and `node_modules`, and the root exists only to run both at once via
`concurrently`.

```
package.json          root: `dev` (both) and `install:all` only
server/
  server.js           the ENTIRE API: routes, validation, in-memory store (Express 4, ESM)
client/
  vite.config.ts      port 5173, proxies /api to http://localhost:4000
  src/
    app/store.ts      configureStore + inferred RootState/AppDispatch + persistence subscription
    app/hooks.ts      typed useAppDispatch / useAppSelector
    api/client.ts     the ONLY fetch call site; throws on non-2xx
    types.ts          Ticket, TicketStatus, TicketPriority, NewTicketInput, TicketPatch
    selectors.ts      cross-slice memoized derivations (KPIs, backlog, pipeline, visible rows)
    index.css         the whole design system, ~764 lines, CSS custom properties
    features/tickets  entity adapter + 4 thunks, table/cards, filters bar, forms, status control
    features/filters  search / status / priority / sort state
    features/ui       one persisted preference (notesVisible)
    features/charts   BacklogChart, StatusPipeline (hand-rolled SVG, no chart library)
    components/       SlideOver, Skeletons, PanelNote, BuildNotes, icons
docs/reviews/         code-review documents (see Open work)
```

Stack: React 19, Redux Toolkit 2.5, TypeScript 5.6, Vite 6, Vitest 3, Express 4, `cors`.
No router, no CSS framework, no chart library, no state library beyond RTK.

## Commands

All verified passing on 2026-07-30. Run from the repo root; the `--prefix` form is what the root
`dev` script uses.

| Command | What it does |
|---|---|
| `npm run dev` | Both processes together (server blue, client green) |
| `npm run install:all` | Install `server/` then `client/` |
| `npm --prefix server start` | API on `http://localhost:4000` (`PORT` env overrides) |
| `npm --prefix client run dev` | Vite on `http://localhost:5173` |
| `npm --prefix client test` | `vitest run` (currently 21 tests across 4 files) |
| `npm --prefix client run typecheck` | `tsc -b --noEmit` |
| `npm --prefix client run build` | `tsc -b && vite build` |

**Gate before committing client changes:** `npm --prefix client run typecheck` and
`npm --prefix client test`. There is no CI, no linter, and no formatter, so that pair is the
entire safety net.

## Architecture rules

These are the patterns the project exists to show. Breaking one defeats the point of the repo.

1. **Derived state lives in selectors, never in the store and never in component state.** KPI
   numbers, the backlog buckets, the status pipeline, and the filtered + sorted row list are all
   `createSelector` derivations in `selectors.ts`. Need a new computed view? Add a memoized
   selector. Do not add a field to a slice for it.
2. **Tickets are normalized.** `createEntityAdapter` owns `{ ids, entities }`. Mutate only through
   adapter helpers (`setAll` / `addOne` / `upsertOne` / `removeOne`), and read through the
   generated selectors exported from `ticketsSlice.ts`.
3. **One `createAsyncThunk` per server call**, all four in `ticketsSlice.ts`, all going through
   `ticketsApi` in `api/client.ts`. Components never call `fetch`. Every thunk handles
   `pending` / `fulfilled` / `rejected` in `extraReducers`.
4. **Types are inferred from the store**, not hand-declared. `RootState` and `AppDispatch` come
   from `typeof store`. Always use `useAppSelector` / `useAppDispatch` from `app/hooks.ts`, never
   the raw react-redux hooks.
5. **State placement:** ticket data goes to `ticketsSlice`, view controls (search, status,
   priority, sort field/dir) to `filtersSlice`, UI preferences to `uiSlice`. Local `useState` is
   reserved for the two slide-over open flags in `App.tsx`. Nothing else.
6. **Server responses drive the store.** Thunks store what the API returned rather than a locally
   constructed object, so the client can never drift from the server's shape.

## Server rules

- `server/server.js` is intentionally one file. Route handlers, validation, and the seed data all
  live there. The in-memory array resets on every restart; there is no database and adding one is
  out of scope unless asked.
- The status codes are part of the demonstration: `201` on create, `400` with an `errors` array on
  validation failure, `404` on a missing id, `204` on delete. `api/client.ts` reads `body.error` and
  `body.errors` and special-cases `204`, so changing a shape here breaks the client's error text.
- The `latency` middleware (250 ms) exists so loading states are visible rather than theoretical.
  It is currently applied to `GET /api/tickets`, `POST`, and `PATCH`, and is **not** applied to
  `DELETE /api/tickets/:id` or `GET /api/tickets/:id`. The About panel copy currently describes
  this incorrectly (finding #1, below).
- Seed `createdAt` values are derived from a hardcoded base timestamp so relative ages in the UI
  stay stable across runs. Do not swap it for `Date.now()`.

## Conventions and gotchas

- **CSS is token-driven.** `index.css` declares the whole system under `:root` (surfaces, ink,
  accent, priority and status hues, semantic tones). Use the custom properties; do not introduce
  raw hex in components or new rules. The priority and status hues are documented as a
  colorblind-safe *set*, and meaning is carried by marks (glyphs, bars, dots), never by text color
  alone. Preserve that when adding any encoding.
- **Vitest runs in the `node` environment.** `vite.config.ts` has no `test` block, so there is no
  DOM and `globalThis.localStorage` is `undefined`. Any test touching storage silently takes the
  fallback path and passes for the wrong reason. Add `test: { environment: "jsdom" }` before
  writing DOM or storage tests. This also means there are currently **no component render tests**,
  only reducer and selector tests.
- **`uiSlice` reads `localStorage` at module-import time**, so its initial state is frozen for the
  process and cannot be reset between tests. See finding #6 before building on it.
- `client/dist/` and `*.tsbuildinfo` are gitignored build output. Never edit them by hand.
- `docs/` went untracked from its creation until 2026-07-30, when it was committed alongside this
  file. Review documents belong in `docs/reviews/`. Nothing under `docs/` is gitignored, so a new
  doc there is tracked by default.
- Icons are hand-written SVG in `components/icons.tsx` with a shared `base()` that sets
  `strokeLinecap: "round"`. There is no icon package.

## Open work

`docs/reviews/code-review-build-notes-panel.md` is an `xhigh`-effort review of commit `1944e90`
with **10 findings, all still TODO** as of 2026-07-30. Read it before touching any of:

- `features/ui/uiSlice.ts` (findings 3, 5, 6, 8)
- `app/store.ts` persistence subscription (finding 7)
- `components/SlideOver.tsx` focus trap (finding 4, latent, not currently reproducible)
- `components/BuildNotes.tsx` copy (finding 1, the latency claim)
- `App.tsx` Notes toggle ARIA (finding 2)
- the mono code-chip CSS rules (finding 9) and the stale topbar comment (finding 10)

That document is the single source of truth for its own review. When a finding is fixed or
dismissed, update its row in the Current Status table and add a Change Log entry rather than
leaving the doc stale. Its "Verified and cleared" table records hypotheses already checked and
found correct, so do not re-litigate those.

## Scope discipline

This repo is a demonstration of specific patterns at a specific size. Before adding a router, a
component library, a database, a state library, or a build step, say why the pattern being
demonstrated requires it. Growth that obscures the patterns is a regression here even when it
would be an improvement in a product repo.
