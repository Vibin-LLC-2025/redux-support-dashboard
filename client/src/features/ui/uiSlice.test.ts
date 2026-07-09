import { describe, expect, it } from "vitest";
import reducer, { notesToggled, notesVisibilitySet } from "./uiSlice";

const initial = () => reducer(undefined, { type: "@@INIT" });

describe("uiSlice", () => {
  it("shows the build notes by default", () => {
    expect(initial()).toEqual({ notesVisible: true });
  });

  it("notesToggled flips visibility", () => {
    const off = reducer(initial(), notesToggled());
    expect(off.notesVisible).toBe(false);

    const backOn = reducer(off, notesToggled());
    expect(backOn.notesVisible).toBe(true);
  });

  it("notesVisibilitySet assigns explicitly, without toggling", () => {
    const state = reducer(initial(), notesVisibilitySet(false));
    expect(state.notesVisible).toBe(false);

    // Setting the same value again is a no-op, unlike a toggle.
    expect(reducer(state, notesVisibilitySet(false)).notesVisible).toBe(false);
  });
});
