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
      <code className="bn-api">{api}</code>
      <span className="bn-text">{children}</span>
    </li>
  );
}

function Route({ verb, path, children }: { verb: string; path: string; children: React.ReactNode }) {
  return (
    <li className="bn-item">
      <code className="bn-route" data-verb={verb.toLowerCase()}>
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
          In development Vite proxies <code className="bn-inline">/api</code> to port 4000, so
          the app and the API share an origin and there are no CORS surprises in the browser.
        </p>
      </section>

      <section className="bn-section">
        <h3 className="bn-h">Redux Toolkit</h3>
        <ul className="bn-list">
          <Note api="configureStore">
            One store, two feature slices — <code className="bn-inline">tickets</code> holds the
            server data, <code className="bn-inline">filters</code> holds what you have typed and
            clicked. Store shape is inferred into <code className="bn-inline">RootState</code>,
            so the types can never drift from the reducers.
          </Note>
          <Note api="createEntityAdapter">
            Tickets are stored normalized, as a lookup table of{" "}
            <code className="bn-inline">{"{ ids, entities }"}</code> rather than a plain array.
            Updating one ticket touches one key instead of rebuilding the list, and the adapter
            supplies the <code className="bn-inline">addOne</code> /{" "}
            <code className="bn-inline">upsertOne</code> /{" "}
            <code className="bn-inline">removeOne</code> helpers that do it.
          </Note>
          <Note api="createAsyncThunk">
            One thunk per server call. Loading dispatches three actions —{" "}
            <code className="bn-inline">pending</code>,{" "}
            <code className="bn-inline">fulfilled</code>,{" "}
            <code className="bn-inline">rejected</code> — which is what drives the skeleton, the
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
            Validates the body and returns <code className="bn-inline">201</code> with the created
            ticket, or <code className="bn-inline">400</code> with the field errors.
          </Route>
          <Route verb="PATCH" path="/api/tickets/:id">
            Partial update — this is what the inline status dropdown calls.
          </Route>
          <Route verb="DELETE" path="/api/tickets/:id">
            Removes a ticket, or <code className="bn-inline">404</code> if it is already gone.
          </Route>
        </ul>
        <p className="bn-body">
          The server also runs request logging, <code className="bn-inline">express.json()</code>{" "}
          body parsing, CORS, and a small artificial latency on the mutating routes — enough delay
          to make the loading states visible instead of theoretical.
        </p>
      </section>

      <section className="bn-section">
        <h3 className="bn-h">One round trip</h3>
        <p className="bn-body">
          Change a ticket's status in the table and the whole loop runs: the control dispatches{" "}
          <code className="bn-inline">updateTicket</code>, the thunk{" "}
          <code className="bn-inline">PATCH</code>es the server, the fulfilled response is folded
          back through <code className="bn-inline">upsertOne</code>, and every memoized selector
          downstream recomputes. The KPI tiles, both charts, and the row all move together,
          because they are four views of the same single number.
        </p>
      </section>
    </div>
  );
}
