import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectBacklogByPriority } from "../../selectors";
import { priorityFilterChanged, selectFilters } from "../filters/filtersSlice";
import { PriorityGlyphInline } from "./chartGlyph";

// Backlog by priority — horizontal bars. Bars follow the validated priority
// ladder colors; length encodes active-ticket count. Each bar is a filter
// toggle for its priority. Counts sit beside the bars in muted ink (text never
// wears the data color).
export function BacklogChart() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectBacklogByPriority);
  const { priority: activePriority } = useAppSelector(selectFilters);
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <section className="chart-panel reveal" style={{ "--i": 6 } as React.CSSProperties} aria-label="Backlog by priority">
      <header className="chart-head">
        <h2 className="chart-title">Backlog by priority</h2>
        <p className="chart-sub">Active tickets (not yet resolved) · click to filter</p>
      </header>

      <div className="backlog">
        {rows.map((r) => {
          const active = activePriority === r.priority;
          return (
            <button
              key={r.priority}
              className="backlog-row"
              data-active={active}
              onClick={() => dispatch(priorityFilterChanged(active ? "all" : r.priority))}
              aria-pressed={active}
              aria-label={`${r.priority}: ${r.count} active ${r.count === 1 ? "ticket" : "tickets"}${active ? " (filtering)" : ""}`}
            >
              <span className="backlog-label">
                <PriorityGlyphInline priority={r.priority} />
                {r.priority}
              </span>
              <span className="backlog-track">
                <span
                  className="backlog-bar"
                  data-p={r.priority}
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </span>
              <span className="backlog-count">{r.count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
