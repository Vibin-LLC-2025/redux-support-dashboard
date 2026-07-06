import { configureStore } from "@reduxjs/toolkit";
import ticketsReducer from "../features/tickets/ticketsSlice";
import filtersReducer from "../features/filters/filtersSlice";

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    filters: filtersReducer,
  },
});

// Inferred types keep the store as the single source of truth for shape.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
