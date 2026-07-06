import { useAppDispatch, useAppSelector } from "../../app/hooks";
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

  return (
    <div className="filters">
      <input
        className="filters-search"
        type="search"
        placeholder="Search subject, requester, assignee…"
        value={filters.search}
        onChange={(e) => dispatch(searchChanged(e.target.value))}
        aria-label="Search tickets"
      />

      <label className="filters-field">
        Status
        <select
          value={filters.status}
          onChange={(e) =>
            dispatch(statusFilterChanged(e.target.value as StatusFilter))
          }
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </label>

      <label className="filters-field">
        Priority
        <select
          value={filters.priority}
          onChange={(e) =>
            dispatch(priorityFilterChanged(e.target.value as PriorityFilter))
          }
        >
          <option value="all">All</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>

      <button className="btn-ghost" onClick={() => dispatch(filtersCleared())}>
        Clear
      </button>
    </div>
  );
}
