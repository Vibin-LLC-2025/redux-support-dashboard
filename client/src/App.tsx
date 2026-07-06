import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  fetchTickets,
  selectTicketsError,
  selectTicketsStatus,
} from "./features/tickets/ticketsSlice";
import { StatCards } from "./features/stats/StatCards";
import { BacklogChart } from "./features/charts/BacklogChart";
import { StatusPipeline } from "./features/charts/StatusPipeline";
import { TicketFilters } from "./features/tickets/TicketFilters";
import { TicketList } from "./features/tickets/TicketList";
import { NewTicketForm } from "./features/tickets/NewTicketForm";
import { SlideOver } from "./components/SlideOver";
import { DashboardSkeleton, ErrorState } from "./components/Skeletons";
import { PlusIcon } from "./components/icons";

export default function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectTicketsStatus);
  const error = useAppSelector(selectTicketsError);
  const [showNew, setShowNew] = useState(false);

  // Load tickets once on mount via the async thunk.
  useEffect(() => {
    if (status === "idle") dispatch(fetchTickets());
  }, [status, dispatch]);

  const down = status === "failed";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12h3.4l2.2-5.6 3.6 11 2.3-6.4H21" />
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-title">Support Desk</span>
            <span className="brand-sub">Operations console · React + Redux Toolkit + Express</span>
          </span>
        </div>

        <div className="topbar-right">
          <span className="live-pill">
            <span className="live-dot" data-down={down} />
            <span className="live-text">{down ? "API offline" : "API live · :4000"}</span>
          </span>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <PlusIcon /> New ticket
          </button>
        </div>
      </header>

      <main className="content">
        {status === "failed" ? (
          <ErrorState message={error} onRetry={() => dispatch(fetchTickets())} />
        ) : status === "succeeded" ? (
          <>
            <StatCards />
            <div className="charts-row">
              <BacklogChart />
              <StatusPipeline />
            </div>
            <div className="list-panel reveal" style={{ "--i": 8 } as React.CSSProperties}>
              <TicketFilters />
              <TicketList />
            </div>
          </>
        ) : (
          <DashboardSkeleton />
        )}
      </main>

      {showNew && (
        <SlideOver title="New ticket" onClose={() => setShowNew(false)}>
          <NewTicketForm onCreated={() => setShowNew(false)} />
        </SlideOver>
      )}
    </div>
  );
}
