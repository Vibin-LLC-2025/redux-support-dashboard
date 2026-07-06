import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectVisibleTickets } from "../../selectors";
import { selectFilters, sortChanged } from "../filters/filtersSlice";
import type { SortField } from "../filters/filtersSlice";
import { PriorityTag } from "./indicators";
import { StatusControl } from "./StatusControl";
import { DeleteButton } from "./DeleteButton";
import { ageLabel, fullTimestamp } from "./age";

const COLUMNS: { field: SortField; label: string; cls: string }[] = [
  { field: "priority", label: "Priority", cls: "col-pri" },
  { field: "subject", label: "Subject", cls: "" },
  { field: "status", label: "Status", cls: "col-status" },
  { field: "createdAt", label: "Opened", cls: "col-when" },
];

export function TicketTable() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectVisibleTickets);
  const { sortField, sortDir } = useAppSelector(selectFilters);

  return (
    <table className="ticket-table">
      <caption className="sr-only">Support tickets, sortable by column</caption>
      <thead>
        <tr>
          {COLUMNS.map((col) => {
            const active = sortField === col.field;
            return (
              <th
                key={col.field}
                className={col.cls}
                aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <button className="th-sort" onClick={() => dispatch(sortChanged(col.field))}>
                  {col.label}
                  <span className="th-arrow" aria-hidden="true">{active ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
                </button>
              </th>
            );
          })}
          <th className="col-req">Requester</th>
          <th className="col-assn">Assignee</th>
          <th className="col-act"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t, i) => (
          <tr key={t.id} className="reveal-row" style={{ "--i": i } as React.CSSProperties}>
            <td className="col-pri"><PriorityTag priority={t.priority} /></td>
            <td className="cell-subject" title={t.subject}>{t.subject}</td>
            <td className="col-status"><StatusControl ticket={t} /></td>
            <td className="col-when cell-when">
              <span title={fullTimestamp(t.createdAt)}>{ageLabel(t.createdAt)}</span>
            </td>
            <td className="col-req cell-req">{t.requester}</td>
            <td className="col-assn cell-assn" data-unassigned={t.assignee === null}>
              {t.assignee ?? "Unassigned"}
            </td>
            <td className="col-act row-actions">
              <DeleteButton ticket={t} variant="icon" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
