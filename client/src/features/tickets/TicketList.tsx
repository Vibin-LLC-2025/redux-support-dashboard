import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectVisibleTickets } from "../../selectors";
import { selectAllTickets } from "./ticketsSlice";
import { filtersCleared, selectFilters } from "../filters/filtersSlice";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { InboxIcon } from "../../components/icons";
import { TicketTable } from "./TicketTable";
import { TicketCards } from "./TicketCards";

export function TicketList() {
  const dispatch = useAppDispatch();
  const visible = useAppSelector(selectVisibleTickets);
  const all = useAppSelector(selectAllTickets);
  const filters = useAppSelector(selectFilters);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const filtersActive =
    filters.search.trim() !== "" || filters.status !== "all" || filters.priority !== "all";

  if (visible.length === 0) {
    return (
      <div className="state-panel" role="status">
        <InboxIcon />
        {all.length === 0 ? (
          <>
            <p className="state-title">Queue is clear</p>
            <p className="state-sub">No tickets in the system. New tickets will appear here.</p>
          </>
        ) : (
          <>
            <p className="state-title">No tickets match these filters</p>
            <p className="state-sub">Try broadening your search or clearing the active filters.</p>
            {filtersActive && (
              <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => dispatch(filtersCleared())}>
                Clear filters
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return isMobile ? <TicketCards /> : <TicketTable />;
}
