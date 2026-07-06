import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  fetchTickets,
  selectTicketsError,
  selectTicketsStatus,
} from "./features/tickets/ticketsSlice";
import { StatCards } from "./features/stats/StatCards";
import { TicketFilters } from "./features/tickets/TicketFilters";
import { TicketTable } from "./features/tickets/TicketTable";
import { NewTicketForm } from "./features/tickets/NewTicketForm";

export default function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectTicketsStatus);
  const error = useAppSelector(selectTicketsError);

  // Load tickets once on mount via the async thunk.
  useEffect(() => {
    if (status === "idle") dispatch(fetchTickets());
  }, [status, dispatch]);

  return (
    <div className="app">
      <header className="masthead">
        <h1>Support Desk</h1>
        <p>React + Redux Toolkit + Express — ticket operations dashboard</p>
      </header>

      <StatCards />

      <div className="layout">
        <main className="panel">
          <TicketFilters />
          {status === "loading" && <p className="status-note">Loading tickets…</p>}
          {status === "failed" && (
            <p className="status-note error" role="alert">
              {error} — is the API running on :4000?
            </p>
          )}
          {status === "succeeded" && <TicketTable />}
        </main>

        <aside className="sidebar">
          <NewTicketForm />
        </aside>
      </div>
    </div>
  );
}
