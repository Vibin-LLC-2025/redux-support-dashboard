import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { TicketPriority, TicketStatus } from "../../types";

export type StatusFilter = TicketStatus | "all";
export type PriorityFilter = TicketPriority | "all";
export type SortField = "priority" | "createdAt" | "status" | "subject";
export type SortDir = "asc" | "desc";

interface FiltersState {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  sortField: SortField;
  sortDir: SortDir;
}

const initialState: FiltersState = {
  search: "",
  status: "all",
  priority: "all",
  sortField: "priority",
  sortDir: "desc",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    statusFilterChanged(state, action: PayloadAction<StatusFilter>) {
      state.status = action.payload;
    },
    priorityFilterChanged(state, action: PayloadAction<PriorityFilter>) {
      state.priority = action.payload;
    },
    // Clicking the same column toggles direction; a new column resets to desc.
    sortChanged(state, action: PayloadAction<SortField>) {
      if (state.sortField === action.payload) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortField = action.payload;
        state.sortDir = "desc";
      }
    },
    filtersCleared() {
      return initialState;
    },
  },
});

export const {
  searchChanged,
  statusFilterChanged,
  priorityFilterChanged,
  sortChanged,
  filtersCleared,
} = filtersSlice.actions;

export const selectFilters = (state: RootState) => state.filters;

export default filtersSlice.reducer;
