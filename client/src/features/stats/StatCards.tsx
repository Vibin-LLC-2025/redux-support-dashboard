import { useAppSelector } from "../../app/hooks";
import { selectKpis } from "../../selectors";

interface CardDef {
  label: string;
  value: number;
  tone: "neutral" | "warn" | "danger" | "good";
}

export function StatCards() {
  const kpi = useAppSelector(selectKpis);

  const cards: CardDef[] = [
    { label: "Total tickets", value: kpi.total, tone: "neutral" },
    { label: "Open", value: kpi.open, tone: "warn" },
    { label: "Urgent active", value: kpi.urgentActive, tone: "danger" },
    { label: "Unassigned", value: kpi.unassigned, tone: "warn" },
    { label: "Resolved", value: kpi.resolved, tone: "good" },
  ];

  return (
    <section className="kpi-row" aria-label="Support metrics">
      {cards.map((c) => (
        <div key={c.label} className={`kpi-card kpi-${c.tone}`}>
          <span className="kpi-value">{c.value}</span>
          <span className="kpi-label">{c.label}</span>
        </div>
      ))}
    </section>
  );
}
