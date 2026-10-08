import { describe, expect, it, vi } from "vitest";

// This suite verifies that the store hydrates ui.notesVisible from localStorage
// at creation time and mirrors changes back to storage via listener middleware.
describe("store ui persistence", () => {
  it("hydrates notesVisible from localStorage at store creation", async () => {
    // Ensure a clean module registry so store.ts runs fresh.
    vi.resetModules();
    // Seed storage before importing the store module.
    globalThis.localStorage.setItem("supportdesk.notesVisible", "false");
    const { store } = await import("./store");
    expect(store.getState().ui.notesVisible).toBe(false);
  });

  it("persists changes triggered by notesToggled", async () => {
    vi.resetModules();
    // Start with true
    globalThis.localStorage.setItem("supportdesk.notesVisible", "true");
    const { store } = await import("./store");
    const { notesToggled } = await import("../features/ui/uiSlice");
    // Toggle once -> false
    store.dispatch(notesToggled());
    expect(globalThis.localStorage.getItem("supportdesk.notesVisible")).toBe("false");
    // Toggle again -> true
    store.dispatch(notesToggled());
    expect(globalThis.localStorage.getItem("supportdesk.notesVisible")).toBe("true");
  });
});

