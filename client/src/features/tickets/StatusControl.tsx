import { useAppDispatch } from "../../app/hooks";
import { updateTicket } from "./ticketsSlice";
import { StatusGlyph } from "./indicators";
import type { Ticket, TicketStatus } from "../../types";

const STATUSES: TicketStatus[] = ["open", "pending", "resolved"];

// Native <select> styled as a status pill — keeps keyboard + screen-reader
// support for free while matching the design. The leading glyph reflects state.
export function StatusControl({ ticket }: { ticket: Ticket }) {
  const dispatch = useAppDispatch();

  return (
    <span className="status-pill">
      <StatusGlyph status={ticket.status} />
      <select
        className="status-select"
        data-s={ticket.status}
        value={ticket.status}
        onChange={(e) =>
          dispatch(
            updateTicket({
              id: ticket.id,
              patch: { status: e.target.value as TicketStatus },
            })
          )
        }
        aria-label={`Status for ${ticket.subject}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </span>
  );
}
