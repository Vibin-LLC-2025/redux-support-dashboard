import { describe, expect, it } from "vitest";
import reducer, { notesToggled, readStoredPreference, persistNotesVisible } from "./uiSlice";

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

  it("readStoredPreference honors true/false and falls back on garbage", () => {
    // Missing key -> fallback
    expect(readStoredPreference(true)).toBe(true);
    expect(readStoredPreference(false)).toBe(false);

    // Write and read recognized values
    globalThis.localStorage.setItem("supportdesk.notesVisible", "true");
    expect(readStoredPreference(false)).toBe(true);
    globalThis.localStorage.setItem("supportdesk.notesVisible", "false");
    expect(readStoredPreference(true)).toBe(false);

    // Garbage -> fallback
    globalThis.localStorage.setItem("supportdesk.notesVisible", "garbage");
    expect(readStoredPreference(true)).toBe(true);
    expect(readStoredPreference(false)).toBe(false);
  });

  it("persistNotesVisible writes stringified boolean", () => {
    persistNotesVisible(true);
    expect(globalThis.localStorage.getItem("supportdesk.notesVisible")).toBe("true");
    persistNotesVisible(false);
    expect(globalThis.localStorage.getItem("supportdesk.notesVisible")).toBe("false");
  });
});
