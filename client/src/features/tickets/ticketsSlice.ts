import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { NewTicketInput, Ticket, TicketPatch } from "../../types";
import { ticketsApi } from "../../api/client";

// Normalized storage: tickets kept in { ids, entities } with adapter helpers.
const ticketsAdapter = createEntityAdapter<Ticket>();

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface TicketsExtraState {
  status: LoadStatus;
  error: string | null;
}

const initialState = ticketsAdapter.getInitialState<TicketsExtraState>({
  status: "idle",
  error: null,
});

// --- Async thunks: one per server call -------------------------------------

export const fetchTickets = createAsyncThunk("tickets/fetch", () =>
  ticketsApi.list()
);

export const createTicket = createAsyncThunk(
  "tickets/create",
  (input: NewTicketInput) => ticketsApi.create(input)
);

export const updateTicket = createAsyncThunk(
  "tickets/update",
  ({ id, patch }: { id: number; patch: TicketPatch }) =>
    ticketsApi.update(id, patch)
);

export const deleteTicket = createAsyncThunk("tickets/delete", async (id: number) => {
  await ticketsApi.remove(id);
  return id;
});

// --- Slice -----------------------------------------------------------------

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    // Optimistic local edit example (not wired to UI, kept for demonstration).
    ticketAssigned(
      state,
      action: PayloadAction<{ id: number; assignee: string | null }>
    ) {
      const t = state.entities[action.payload.id];
      if (t) t.assignee = action.payload.assignee;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.status = "succeeded";
        ticketsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load tickets";
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        ticketsAdapter.addOne(state, action.payload);
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        ticketsAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        ticketsAdapter.removeOne(state, action.payload);
      });
  },
});

export const { ticketAssigned } = ticketsSlice.actions;

// Adapter-generated selectors, bound to the tickets slice.
export const {
  selectAll: selectAllTickets,
  selectById: selectTicketById,
  selectTotal: selectTicketCount,
} = ticketsAdapter.getSelectors<RootState>((state) => state.tickets);

export const selectTicketsStatus = (state: RootState) => state.tickets.status;
export const selectTicketsError = (state: RootState) => state.tickets.error;

export default ticketsSlice.reducer;
