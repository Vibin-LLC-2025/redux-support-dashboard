import { createSelector } from "@reduxjs/toolkit";
import type { Ticket, TicketPriority, TicketStatus } from "./types";
import { selectAllTickets } from "./features/tickets/ticketsSlice";
import { selectFilters } from "./features/filters/filtersSlice";

const PRIORITY_RANK: Record<TicketPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const PRIORITY_ORDER: TicketPriority[] = ["urgent", "high", "medium", "low"];
const STATUS_ORDER: TicketStatus[] = ["open", "pending", "resolved"];

export interface PriorityBacklog {
  priority: TicketPriority;
  count: number;
}
export interface StatusSlice {
  status: TicketStatus;
  count: number;
}

// Backlog = active (not-yet-resolved) tickets bucketed by priority, urgent→low.
// Memoized: recomputes only when the ticket set changes.
export const selectBacklogByPriority = createSelector(
  [selectAllTickets],
  (tickets): PriorityBacklog[] =>
    PRIORITY_ORDER.map((priority) => ({
      priority,
      count: tickets.filter(
        (t) => t.priority === priority && t.status !== "resolved"
      ).length,
    }))
);

// Status pipeline = every ticket bucketed by status, for the segmented bar.
export const selectStatusPipeline = createSelector(
  [selectAllTickets],
  (tickets): StatusSlice[] =>
    STATUS_ORDER.map((status) => ({
      status,
      count: tickets.filter((t) => t.status === status).length,
    }))
);

// KPI cards derive entirely from raw ticket state — recomputed only when the
// ticket list actually changes, thanks to createSelector memoization.
export const selectKpis = createSelector([selectAllTickets], (tickets) => {
  const open = tickets.filter((t) => t.status === "open").length;
  const pending = tickets.filter((t) => t.status === "pending").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;
  const urgentActive = tickets.filter(
    (t) => t.priority === "urgent" && t.status !== "resolved"
  ).length;
  const unassigned = tickets.filter(
    (t) => t.assignee === null && t.status !== "resolved"
  ).length;

  return { total: tickets.length, open, pending, resolved, urgentActive, unassigned };
});

// The table's rows: apply search + status + priority filters, then sort.
export const selectVisibleTickets = createSelector(
  [selectAllTickets, selectFilters],
  (tickets, filters) => {
    const term = filters.search.trim().toLowerCase();

    const filtered = tickets.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.priority !== "all" && t.priority !== filters.priority) return false;
      if (
        term &&
        !t.subject.toLowerCase().includes(term) &&
        !t.requester.toLowerCase().includes(term) &&
        !(t.assignee?.toLowerCase().includes(term) ?? false)
      ) {
        return false;
      }
      return true;
    });

    const dir = filters.sortDir === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      const cmp = compare(a, b, filters.sortField);
      // Stable tiebreak by id so equal rows never jitter between renders.
      return cmp !== 0 ? cmp * dir : a.id - b.id;
    });

    return sorted;
  }
);

function compare(a: Ticket, b: Ticket, field: string): number {
  switch (field) {
    case "priority":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case "createdAt":
      return a.createdAt.localeCompare(b.createdAt);
    case "status":
      return a.status.localeCompare(b.status);
    case "subject":
      return a.subject.localeCompare(b.subject);
    default:
      return 0;
  }
}
