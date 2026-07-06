import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectVisibleTickets } from "../../selectors";
import { selectAllTickets } from "./ticketsSlice";
import {
  filtersCleared,
  priorityFilterChanged,
  searchChanged,
  selectFilters,
  statusFilterChanged,
} from "../filters/filtersSlice";
import type { PriorityFilter, StatusFilter } from "../filters/filtersSlice";

export function TicketFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const visible = useAppSelector(selectVisibleTickets).length;
  const total = useAppSelector(selectAllTickets).length;

  return (
    <div className="filters">
      <input
        className="filter-search"
        type="search"
        placeholder="Search subject, requester, assignee…"
        value={filters.search}
        onChange={(e) => dispatch(searchChanged(e.target.value))}
        aria-label="Search tickets"
      />

      <label className="filter-field">
        Status
        <select
          value={filters.status}
          onChange={(e) => dispatch(statusFilterChanged(e.target.value as StatusFilter))}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </label>

      <label className="filter-field">
        Priority
        <select
          value={filters.priority}
          onChange={(e) => dispatch(priorityFilterChanged(e.target.value as PriorityFilter))}
        >
          <option value="all">All</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>

      <button className="btn btn-ghost" onClick={() => dispatch(filtersCleared())}>
        Clear
      </button>

      <span className="filter-count" aria-live="polite">
        {visible} of {total} shown
      </span>
    </div>
  );
}
