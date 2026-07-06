// Shape-matched loading skeletons — mirror the real KPI tiles, chart panels, and
// table rows so the layout doesn't shift when data arrives.
export function DashboardSkeleton() {
  return (
    <>
      <section className="kpi-row" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="kpi-tile" data-tone="neutral">
            <div className="skel skel-line" style={{ width: "52%" }} />
            <div className="skel" style={{ width: "44%", height: 26, marginTop: "auto" }} />
            <div className="skel skel-line" style={{ width: "70%", height: 9 }} />
          </div>
        ))}
      </section>

      <section className="charts-row" aria-hidden="true">
        {[0, 1].map((p) => (
          <div key={p} className="chart-panel">
            <div className="skel skel-line" style={{ width: "40%", height: 14, marginBottom: 8 }} />
            <div className="skel skel-line" style={{ width: "60%", height: 9, marginBottom: 20 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skel" style={{ height: 16, width: `${90 - i * 16}%` }} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="list-panel" aria-hidden="true">
        <div className="skel skel-line" style={{ width: 260, height: 34, marginBottom: 14 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skel-row">
            <div className="skel" style={{ width: 90, height: 14 }} />
            <div className="skel" style={{ flex: 1, height: 12 }} />
            <div className="skel" style={{ width: 118, height: 26, borderRadius: 999 }} />
            <div className="skel" style={{ width: 40, height: 12 }} />
          </div>
        ))}
      </div>
    </>
  );
}

export function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="list-panel">
      <div className="state-panel state-error" role="alert">
        <p className="state-title">Couldn't load tickets</p>
        <p className="state-sub">
          The API on <span className="mono">:4000</span> didn't respond.
        </p>
        {message && <p className="mono">{message}</p>}
        <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}
