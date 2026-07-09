import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const STORAGE_KEY = "supportdesk.notesVisible";

// Guarded so the reducer stays usable under the node test environment, where
// there is no localStorage.
function readStoredPreference(fallback: boolean): boolean {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw === null || raw === undefined ? fallback : raw === "true";
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
  notesVisible: readStoredPreference(true),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    notesToggled(state) {
      state.notesVisible = !state.notesVisible;
    },
    notesVisibilitySet(state, action: PayloadAction<boolean>) {
      state.notesVisible = action.payload;
    },
  },
});

export const { notesToggled, notesVisibilitySet } = uiSlice.actions;

export const selectNotesVisible = (state: RootState) => state.ui.notesVisible;

export default uiSlice.reducer;
