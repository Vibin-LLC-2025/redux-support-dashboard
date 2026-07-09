import { configureStore } from "@reduxjs/toolkit";
import ticketsReducer from "../features/tickets/ticketsSlice";
import filtersReducer from "../features/filters/filtersSlice";
import uiReducer, { persistNotesVisible } from "../features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    filters: filtersReducer,
    ui: uiReducer,
  },
});

// Mirror the one persisted preference back to localStorage on change.
let lastNotesVisible = store.getState().ui.notesVisible;
store.subscribe(() => {
  const { notesVisible } = store.getState().ui;
  if (notesVisible !== lastNotesVisible) {
    lastNotesVisible = notesVisible;
    persistNotesVisible(notesVisible);
  }
});

// Inferred types keep the store as the single source of truth for shape.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
