import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import ticketsReducer from "../features/tickets/ticketsSlice";
import filtersReducer from "../features/filters/filtersSlice";
import uiReducer, {
  persistNotesVisible,
  readStoredPreference,
  notesToggled,
} from "../features/ui/uiSlice";

// Hydrate persisted UI preference at store creation time.
const preloadedUi = { notesVisible: readStoredPreference(true) };

const listenerMiddleware = createListenerMiddleware();

// Persist the preference when it changes via the toggle action.
listenerMiddleware.startListening({
  actionCreator: notesToggled,
  effect: async (_action, api) => {
    const visible = (api.getState() as RootState).ui.notesVisible;
    persistNotesVisible(visible);
  },
});

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    filters: filtersReducer,
    ui: uiReducer,
  },
  preloadedState: {
    ui: preloadedUi,
  },
  middleware: (getDefault) => getDefault().prepend(listenerMiddleware.middleware),
});

// Inferred types keep the store as the single source of truth for shape.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
