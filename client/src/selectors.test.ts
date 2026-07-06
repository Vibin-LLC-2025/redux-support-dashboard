import { describe, expect, it } from "vitest";
import ticketsReducer, { fetchTickets } from "./features/tickets/ticketsSlice";
import filtersReducer, {
  searchChanged,
  statusFilterChanged,
} from "./features/filters/filtersSlice";
import { selectKpis, selectVisibleTickets } from "./selectors";
import type { RootState } from "./app/store";
import type { Ticket } from "./types";

const fixture: Ticket[] = [
  { id: 1, subject: "Checkout fails", requester: "Dana", priority: "urgent", status: "open", assignee: null, createdAt: "2026-07-06T09:00:00.000Z", updatedAt: "2026-07-06T09:00:00.000Z" },
  { id: 2, subject: "Typo in tooltip", requester: "Grace", priority: "low", status: "open", assignee: "Alex", createdAt: "2026-07-06T08:00:00.000Z", updatedAt: "2026-07-06T08:00:00.000Z" },
  { id: 3, subject: "SSO redirect loop", requester: "Tomas", priority: "high", status: "pending", assignee: "Bri", createdAt: "2026-07-06T07:00:00.000Z", updatedAt: "2026-07-06T07:00:00.000Z" },
  { id: 4, subject: "Invoice currency", requester: "Lena", priority: "medium", status: "resolved", assignee: "Alex", createdAt: "2026-07-06T06:00:00.000Z", updatedAt: "2026-07-06T06:00:00.000Z" },
];

// Build a RootState with tickets loaded and given filter actions applied.
function makeState(filterActions: { type: string; payload?: unknown }[] = []): RootState {
  const tickets = ticketsReducer(undefined, fetchTickets.fulfilled(fixture, "r", undefined));
  let filters = filtersReducer(undefined, { type: "@@INIT" });
  for (const action of filterActions) filters = filtersReducer(filters, action as never);
  return { tickets, filters } as RootState;
}

describe("selectKpis", () => {
  it("derives the KPI counts from ticket state", () => {
    const kpi = selectKpis(makeState());
    expect(kpi).toEqual({
      total: 4,
      open: 2,
      pending: 1,
      resolved: 1,
      urgentActive: 1, // id 1: urgent and not resolved
      unassigned: 1, // id 1: no assignee and not resolved
    });
  });
});

describe("selectVisibleTickets", () => {
  it("sorts by priority descending by default", () => {
    const rows = selectVisibleTickets(makeState());
    expect(rows.map((t) => t.id)).toEqual([1, 3, 4, 2]); // urgent, high, medium, low
  });

  it("filters by status", () => {
    const rows = selectVisibleTickets(makeState([statusFilterChanged("open")]));
    expect(rows.map((t) => t.id).sort()).toEqual([1, 2]);
  });

  it("searches across subject, requester, and assignee", () => {
    const rows = selectVisibleTickets(makeState([searchChanged("bri")]));
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(3); // matches assignee "Bri"
  });

  it("returns nothing when filters exclude every ticket", () => {
    const rows = selectVisibleTickets(makeState([searchChanged("nonexistent-xyz")]));
    expect(rows).toHaveLength(0);
  });
});
