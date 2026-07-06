import { useAppSelector } from "../../app/hooks";
import { selectKpis } from "../../selectors";

type Tone = "neutral" | "accent" | "warn" | "danger" | "good";

interface CardDef {
  label: string;
  value: number;
  tone: Tone;
  context: string;
  meter?: number; // 0..1 share, renders the instrumented baseline bar
}

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

export function StatCards() {
  const kpi = useAppSelector(selectKpis);
  const { total, open, pending, resolved, urgentActive, unassigned } = kpi;

  const cards: CardDef[] = [
    { label: "Total", value: total, tone: "neutral", context: "all tickets" },
    { label: "Open", value: open, tone: "accent", context: `${pct(open, total)}% of total`, meter: total ? open / total : 0 },
    { label: "Pending", value: pending, tone: pending / (total || 1) > 0.3 ? "warn" : "neutral", context: "awaiting reply" },
    { label: "Resolved", value: resolved, tone: "good", context: `${pct(resolved, total)}% closed`, meter: total ? resolved / total : 0 },
    { label: "Urgent active", value: urgentActive, tone: urgentActive > 0 ? "danger" : "good", context: urgentActive > 0 ? "needs triage" : "all clear" },
    { label: "Unassigned", value: unassigned, tone: unassigned > 0 ? "warn" : "good", context: unassigned > 0 ? "no owner yet" : "all owned" },
  ];

  return (
    <section className="kpi-row" aria-label="Support metrics">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="kpi-tile reveal"
          data-tone={c.tone}
          style={{ "--i": i } as React.CSSProperties}
        >
          <div className="kpi-head">
            <span className="kpi-dot" />
            <span className="kpi-label">{c.label}</span>
          </div>
          <span className="kpi-value">{c.value}</span>
          <span className="kpi-context">{c.context}</span>
          {c.meter !== undefined && (
            <div className="kpi-meter" aria-hidden="true">
              <div className="kpi-meter-fill" style={{ width: `${Math.round(c.meter * 100)}%` }} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
