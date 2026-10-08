// Body of the "About this build" slide-over. Explains the architecture to a
// reader who may or may not know React: every point leads with what it does in
// plain words, then names the exact API so an engineer can go find it.

interface NoteProps {
  api: string;
  children: React.ReactNode;
}

function Note({ api, children }: NoteProps) {
  return (
    <li className="bn-item">
      <code className="bn-api code-chip code-chip--lg">{api}</code>
      <span className="bn-text">{children}</span>
    </li>
  );
}

function Route({ verb, path, children }: { verb: string; path: string; children: React.ReactNode }) {
  return (
    <li className="bn-item">
      <code className="bn-route code-chip code-chip--lg" data-verb={verb.toLowerCase()}>
        <b>{verb}</b> {path}
      </code>
      <span className="bn-text">{children}</span>
    </li>
  );
}

export function BuildNotes() {
  return (
    <div className="build-notes">
      <p className="bn-lede">
        A support-ticket console built to show how a real Redux Toolkit front end talks to a
        real Express API. Every number on this dashboard is computed from one list of tickets
        held in a single store — nothing on screen keeps a copy of its own.
      </p>

      <p className="bn-body">
        The <b className="bn-strong">Notes</b> button in the header shows or hides the short
        annotations pinned under each panel. Your choice is remembered between visits.
      </p>

      <section className="bn-section">
        <h3 className="bn-h">Stack</h3>
        <p className="bn-body">
          React 19 and TypeScript, bundled by Vite. State lives in Redux Toolkit. The API is
          Node.js and Express over an in-memory ticket store, so a restart resets the data.
          In development Vite proxies <code className="bn-inline code-chip">/api</code> to port 4000, so
          the app and the API share an origin and there are no CORS surprises in the browser.
        </p>
      </section>

      <section className="bn-section">
        <h3 className="bn-h">Redux Toolkit</h3>
        <ul className="bn-list">
          <Note api="configureStore">
            One store, two feature slices — <code className="bn-inline code-chip">tickets</code> holds the
            server data, <code className="bn-inline code-chip">filters</code> holds what you have typed and
            clicked. Store shape is inferred into <code className="bn-inline code-chip">RootState</code>,
            so the types can never drift from the reducers.
          </Note>
          <Note api="createEntityAdapter">
            Tickets are stored normalized, as a lookup table of{" "}
            <code className="bn-inline code-chip">{"{ ids, entities }"}</code> rather than a plain array.
            Updating one ticket touches one key instead of rebuilding the list, and the adapter
            supplies the <code className="bn-inline code-chip">addOne</code> /{" "}
            <code className="bn-inline code-chip">upsertOne</code> /{" "}
            <code className="bn-inline code-chip">removeOne</code> helpers that do it.
          </Note>
          <Note api="createAsyncThunk">
            One thunk per server call. Loading dispatches three actions —{" "}
            <code className="bn-inline code-chip">pending</code>,{" "}
            <code className="bn-inline code-chip">fulfilled</code>,{" "}
            <code className="bn-inline code-chip">rejected</code> — which is what drives the skeleton, the
            table, and the error panel you would see if the API went down. The writes fold their
            server response straight back into the adapter, so the client never guesses what the
            server saved.
          </Note>
          <Note api="createSelector">
            The KPI tiles, both charts, and the filtered table are all derived from raw ticket
            state at read time. They are memoized, so they only recompute when the tickets
            actually change — not on every render. This is why no component owns a running
            count of anything.
          </Note>
        </ul>
      </section>

      <section className="bn-section">
        <h3 className="bn-h">Express API</h3>
        <ul className="bn-list">
          <Route verb="GET" path="/api/tickets">
            The full list, loaded once on mount.
          </Route>
          <Route verb="POST" path="/api/tickets">
            Validates the body and returns <code className="bn-inline code-chip">201</code> with the created
            ticket, or <code className="bn-inline code-chip">400</code> with the field errors.
          </Route>
          <Route verb="PATCH" path="/api/tickets/:id">
            Partial update — this is what the inline status dropdown calls.
          </Route>
          <Route verb="DELETE" path="/api/tickets/:id">
            Removes a ticket, or <code className="bn-inline code-chip">404</code> if it is already gone.
          </Route>
        </ul>
        <p className="bn-body">
          The server also runs request logging, <code className="bn-inline">express.json()</code>{" "}
          body parsing, CORS, and a small artificial latency on select routes — applied to{" "}
          <code className="bn-inline code-chip">GET /api/tickets</code>,{" "}
          <code className="bn-inline code-chip">POST /api/tickets</code>, and{" "}
          <code className="bn-inline code-chip">PATCH /api/tickets/:id</code>.{" "}
          <code className="bn-inline code-chip">DELETE /api/tickets/:id</code> and{" "}
          <code className="bn-inline code-chip">GET /api/tickets/:id</code> are immediate. The delay
          is just enough to make loading states visible rather than theoretical.
        </p>
      </section>

      <section className="bn-section">
        <h3 className="bn-h">One round trip</h3>
        <p className="bn-body">
          Change a ticket's status in the table and the whole loop runs: the control dispatches{" "}
          <code className="bn-inline code-chip">updateTicket</code>, the thunk{" "}
          <code className="bn-inline code-chip">PATCH</code>es the server, the fulfilled response is folded
          back through <code className="bn-inline code-chip">upsertOne</code>, and every memoized selector
          downstream recomputes. The KPI tiles, both charts, and the row all move together,
          because they are four views of the same single number.
        </p>
      </section>
    </div>
  );
}
