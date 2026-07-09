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
import { BuildNotes } from "./components/BuildNotes";
import { PanelNote } from "./components/PanelNote";
import { notesToggled, selectNotesVisible } from "./features/ui/uiSlice";
import { EyeIcon, EyeOffIcon, InfoIcon, PlusIcon } from "./components/icons";

export default function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectTicketsStatus);
  const error = useAppSelector(selectTicketsError);
  const [showNew, setShowNew] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const notesVisible = useAppSelector(selectNotesVisible);

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
          <button
            className="btn btn-ghost"
            onClick={() => setShowAbout(true)}
            aria-label="About this build"
          >
            <InfoIcon size={15} />
            <span className="btn-label">About</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowNew(true)}
            aria-label="New ticket"
          >
            <PlusIcon />
            <span className="btn-label">New ticket</span>
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
              <PanelNote api="createEntityAdapter + filters slice">
                Rows come from the normalized ticket store; the search box, both dropdowns, and
                the sortable headers only write to the filters slice. The list you see is derived
                from the two together, never stored.
              </PanelNote>
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

      {showAbout && (
        <SlideOver title="About this build" onClose={() => setShowAbout(false)} wide>
          <BuildNotes />
        </SlideOver>
      )}
    </div>
  );
}
