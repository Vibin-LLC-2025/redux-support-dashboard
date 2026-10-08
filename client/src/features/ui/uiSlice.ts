import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const STORAGE_KEY = "supportdesk.notesVisible";

// Guarded so the reducer stays usable under the node test environment, where
// there is no localStorage.
export function readStoredPreference(fallback: boolean): boolean {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) return fallback;
    if (raw === "true") return true;
    if (raw === "false") return false;
    // Unrecognized content falls back rather than coercing to false.
    return fallback;
  } catch {
    return fallback;
  }
}

export function persistNotesVisible(visible: boolean): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, String(visible));
  } catch {
    /* private mode / storage disabled — the preference just won't survive reload */
  }
}

interface UiState {
  // Build notes are on by default: this build is a teaching artifact first.
  notesVisible: boolean;
}

const initialState: UiState = {
  // Default; actual hydration occurs via store preloadedState in app/store.ts.
  notesVisible: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    notesToggled(state) {
      state.notesVisible = !state.notesVisible;
    },
  },
});

export const { notesToggled } = uiSlice.actions;

export const selectNotesVisible = (state: RootState) => state.ui.notesVisible;

export default uiSlice.reducer;
