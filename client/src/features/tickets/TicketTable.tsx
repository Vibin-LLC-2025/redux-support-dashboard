import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectVisibleTickets } from "../../selectors";
import { selectFilters, sortChanged } from "../filters/filtersSlice";
import type { SortField } from "../filters/filtersSlice";
import { deleteTicket, updateTicket } from "./ticketsSlice";
import type { TicketStatus } from "../../types";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "subject", label: "Subject" },
  { field: "priority", label: "Priority" },
  { field: "status", label: "Status" },
  { field: "createdAt", label: "Opened" },
];

const STATUSES: TicketStatus[] = ["open", "pending", "resolved"];

function ageLabel(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function TicketTable() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectVisibleTickets);
  const { sortField, sortDir } = useAppSelector(selectFilters);

  return (
    <table className="ticket-table">
      <caption className="sr-only">Support tickets</caption>
      <thead>
        <tr>
          {COLUMNS.map((col) => {
            const active = sortField === col.field;
            return (
              <th
                key={col.field}
                aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <button className="th-sort" onClick={() => dispatch(sortChanged(col.field))}>
                  {col.label}
                  <span className="th-arrow">{active ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
                </button>
              </th>
            );
          })}
          <th>Assignee</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={6} className="empty">
              No tickets match the current filters.
            </td>
          </tr>
        )}
        {rows.map((t) => (
          <tr key={t.id}>
            <td className="cell-subject">
              <span className="subject">{t.subject}</span>
              <span className="requester">{t.requester}</span>
            </td>
            <td>
              <span className={`badge prio-${t.priority}`}>{t.priority}</span>
            </td>
            <td>
              <select
                className={`status-select status-${t.status}`}
                value={t.status}
                onChange={(e) =>
                  dispatch(
                    updateTicket({
                      id: t.id,
                      patch: { status: e.target.value as TicketStatus },
                    })
                  )
                }
                aria-label={`Status for ${t.subject}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
            <td className="cell-age">{ageLabel(t.createdAt)}</td>
            <td className="cell-assignee">{t.assignee ?? "—"}</td>
            <td>
              <button
                className="btn-ghost btn-danger"
                onClick={() => dispatch(deleteTicket(t.id))}
                aria-label={`Delete ${t.subject}`}
              >
                ✕
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
