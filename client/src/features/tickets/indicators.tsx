import type { TicketPriority, TicketStatus } from "../../types";

// Priority and status are encoded by SHAPE + LABEL, never color alone — the
// glyph ladder (filled triangle → diamond → dot → ring) still reads as severity
// in grayscale, satisfying WCAG 1.4.1 (use of color).

function PriorityGlyph({ priority, size = 14 }: { priority: TicketPriority; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 14 14", "aria-hidden": true as const };
  switch (priority) {
    case "urgent":
      return <svg {...p}><path d="M7 1.4 12.7 12 1.3 12Z" fill="currentColor" /></svg>;
    case "high":
      return <svg {...p}><path d="M7 1.3 12.7 7 7 12.7 1.3 7Z" fill="currentColor" /></svg>;
    case "medium":
      return <svg {...p}><circle cx="7" cy="7" r="4.8" fill="currentColor" /></svg>;
    case "low":
      return <svg {...p}><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
  }
}

export function PriorityTag({ priority }: { priority: TicketPriority }) {
  return (
    <span className="pri">
      <span className="pri-glyph" data-p={priority}>
        <PriorityGlyph priority={priority} />
      </span>
      <span className="pri-label">{priority}</span>
    </span>
  );
}

// Leading glyph for the status pill: ring (open) → half (pending) → check (resolved).
export function StatusGlyph({ status, size = 13 }: { status: TicketStatus; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 14 14", "aria-hidden": true as const };
  return (
    <span className="status-glyph" data-s={status} style={{ display: "inline-flex" }}>
      {status === "open" && (
        <svg {...p}><circle cx="7" cy="7" r="4.4" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      )}
      {status === "pending" && (
        <svg {...p}>
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 2.4A4.6 4.6 0 0 1 7 11.6Z" fill="currentColor" />
        </svg>
      )}
      {status === "resolved" && (
        <svg {...p}>
          <circle cx="7" cy="7" r="6" fill="currentColor" />
          <path d="M4.2 7.2 6.1 9.1 9.9 4.9" fill="none" stroke="#05201a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
