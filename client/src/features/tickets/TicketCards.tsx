import { useAppSelector } from "../../app/hooks";
import { selectVisibleTickets } from "../../selectors";
import { PriorityTag } from "./indicators";
import { StatusControl } from "./StatusControl";
import { DeleteButton } from "./DeleteButton";
import { ageLabel, fullTimestamp } from "./age";

// Mobile layout: each ticket becomes a self-contained card with thumb-sized
// controls — replaces the cramped table below 640px.
export function TicketCards() {
  const rows = useAppSelector(selectVisibleTickets);

  return (
    <ul className="ticket-cards">
      {rows.map((t, i) => (
        <li key={t.id} className="ticket-card reveal-row" style={{ "--i": i } as React.CSSProperties}>
          <div className="tc-head">
            <PriorityTag priority={t.priority} />
            <span className="tc-when" title={fullTimestamp(t.createdAt)}>{ageLabel(t.createdAt)} ago</span>
          </div>
          <div className="tc-subject">{t.subject}</div>
          <div className="tc-meta">
            <span>{t.requester}</span>
            <span aria-hidden="true">·</span>
            {t.assignee ? <span><b>{t.assignee}</b></span> : <span className="unassigned">Unassigned</span>}
          </div>
          <div className="tc-foot">
            <StatusControl ticket={t} />
            <DeleteButton ticket={t} variant="text" />
          </div>
        </li>
      ))}
    </ul>
  );
}
