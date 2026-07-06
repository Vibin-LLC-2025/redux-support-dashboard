import { describe, expect, it } from "vitest";
import reducer, {
  createTicket,
  deleteTicket,
  fetchTickets,
  selectAllTickets,
  selectTicketCount,
  updateTicket,
} from "./ticketsSlice";
import type { RootState } from "../../app/store";
import type { Ticket } from "../../types";

const ticket = (over: Partial<Ticket> = {}): Ticket => ({
  id: 1,
  subject: "Example",
  requester: "Sam",
  priority: "medium",
  status: "open",
  assignee: null,
  createdAt: "2026-07-06T12:00:00.000Z",
  updatedAt: "2026-07-06T12:00:00.000Z",
  ...over,
});

// selectAllTickets expects the full RootState; wrap a tickets sub-state in one.
const asRoot = (ticketsState: ReturnType<typeof reducer>) =>
  ({ tickets: ticketsState } as RootState);

describe("ticketsSlice", () => {
  it("starts idle with no tickets or error", () => {
    const state = reducer(undefined, { type: "@@INIT" });
    expect(state.status).toBe("idle");
    expect(state.error).toBeNull();
    expect(selectTicketCount(asRoot(state))).toBe(0);
  });

  it("marks loading on fetch pending", () => {
    const state = reducer(undefined, fetchTickets.pending("req-1", undefined));
    expect(state.status).toBe("loading");
  });

  it("stores all tickets on fetch fulfilled", () => {
    const payload = [ticket({ id: 1 }), ticket({ id: 2, subject: "Second" })];
    const state = reducer(undefined, fetchTickets.fulfilled(payload, "req-1", undefined));
    expect(state.status).toBe("succeeded");
    expect(selectTicketCount(asRoot(state))).toBe(2);
    expect(selectAllTickets(asRoot(state))[1].subject).toBe("Second");
  });

  it("captures the error message on fetch rejected", () => {
    const action = fetchTickets.rejected(new Error("network down"), "req-1", undefined);
    const state = reducer(undefined, action);
    expect(state.status).toBe("failed");
    expect(state.error).toBe("network down");
  });

  it("adds one ticket on create fulfilled", () => {
    const seeded = reducer(undefined, fetchTickets.fulfilled([ticket({ id: 1 })], "r", undefined));
    const created = ticket({ id: 2, subject: "Fresh" });
    const state = reducer(seeded, createTicket.fulfilled(created, "r", {
      subject: "Fresh",
      requester: "Sam",
      priority: "medium",
    }));
    expect(selectTicketCount(asRoot(state))).toBe(2);
  });

  it("upserts the changed ticket on update fulfilled", () => {
    const seeded = reducer(undefined, fetchTickets.fulfilled([ticket({ id: 1, status: "open" })], "r", undefined));
    const updated = ticket({ id: 1, status: "resolved" });
    const state = reducer(seeded, updateTicket.fulfilled(updated, "r", {
      id: 1,
      patch: { status: "resolved" },
    }));
    expect(selectAllTickets(asRoot(state))[0].status).toBe("resolved");
  });

  it("removes the ticket on delete fulfilled", () => {
    const seeded = reducer(
      undefined,
      fetchTickets.fulfilled([ticket({ id: 1 }), ticket({ id: 2 })], "r", undefined)
    );
    const state = reducer(seeded, deleteTicket.fulfilled(1, "r", 1));
    expect(selectTicketCount(asRoot(state))).toBe(1);
    expect(selectAllTickets(asRoot(state))[0].id).toBe(2);
  });
});
