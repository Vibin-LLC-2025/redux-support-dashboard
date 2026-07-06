import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectStatusPipeline } from "../../selectors";
import { selectFilters, statusFilterChanged } from "../filters/filtersSlice";

// Status pipeline — one segmented bar showing the whole ticket set split by
// status (open/pending/resolved), 2px surface gaps between segments. A legend
// carries identity + counts; clicking a segment or legend row filters by status.
export function StatusPipeline() {
  const dispatch = useAppDispatch();
  const slices = useAppSelector(selectStatusPipeline);
  const { status: activeStatus } = useAppSelector(selectFilters);
  const total = slices.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <section className="chart-panel reveal" style={{ "--i": 7 } as React.CSSProperties} aria-label="Status pipeline">
      <header className="chart-head">
        <h2 className="chart-title">Status pipeline</h2>
        <p className="chart-sub">Share of all tickets by state</p>
      </header>

      <div className="pipeline-bar" role="group" aria-label="Ticket status distribution — select to filter">
        <span className="sr-only">{slices.map((s) => `${s.status}: ${s.count}`).join(", ")}</span>
        {slices
          .filter((s) => s.count > 0)
          .map((s) => {
            const pct = (s.count / total) * 100;
            return (
              <button
                key={s.status}
                className="pipeline-seg"
                data-s={s.status}
                style={{ width: `${pct}%` }}
                title={`${s.status}: ${s.count} (${Math.round(pct)}%)`}
                onClick={() => dispatch(statusFilterChanged(activeStatus === s.status ? "all" : s.status))}
                aria-pressed={activeStatus === s.status}
                aria-label={`${s.status}: ${s.count} tickets, ${Math.round(pct)} percent`}
              >
                {pct >= 12 ? s.count : ""}
              </button>
            );
          })}
      </div>

      <ul className="pipeline-legend">
        {slices.map((s) => (
          <li key={s.status}>
            <button
              className="legend-item"
              onClick={() => dispatch(statusFilterChanged(activeStatus === s.status ? "all" : s.status))}
              aria-pressed={activeStatus === s.status}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: "100%", textAlign: "left" }}
            >
              <span className="legend-swatch" data-s={s.status} />
              <span className="legend-label" style={{ textTransform: "capitalize" }}>{s.status}</span>
              <span className="legend-count">{s.count} · {Math.round((s.count / total) * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
