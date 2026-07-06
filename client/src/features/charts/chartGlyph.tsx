import type { TicketPriority } from "../../types";

// Compact priority glyph for chart labels, colored to match its bar via the
// shared .pri-glyph[data-p] color tokens.
export function PriorityGlyphInline({ priority }: { priority: TicketPriority }) {
  const p = { width: 11, height: 11, viewBox: "0 0 14 14", "aria-hidden": true as const };
  return (
    <span className="pri-glyph" data-p={priority} style={{ display: "inline-flex" }}>
      {priority === "urgent" && <svg {...p}><path d="M7 1.4 12.7 12 1.3 12Z" fill="currentColor" /></svg>}
      {priority === "high" && <svg {...p}><path d="M7 1.3 12.7 7 7 12.7 1.3 7Z" fill="currentColor" /></svg>}
      {priority === "medium" && <svg {...p}><circle cx="7" cy="7" r="4.8" fill="currentColor" /></svg>}
      {priority === "low" && <svg {...p}><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>}
    </span>
  );
}
