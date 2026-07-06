import { describe, expect, it } from "vitest";
import reducer, {
  filtersCleared,
  priorityFilterChanged,
  searchChanged,
  sortChanged,
  statusFilterChanged,
} from "./filtersSlice";

const initial = () => reducer(undefined, { type: "@@INIT" });

describe("filtersSlice", () => {
  it("defaults to no filters, priority sort descending", () => {
    const state = initial();
    expect(state).toEqual({
      search: "",
      status: "all",
      priority: "all",
      sortField: "priority",
      sortDir: "desc",
    });
  });

  it("records the search term", () => {
    const state = reducer(initial(), searchChanged("safari"));
    expect(state.search).toBe("safari");
  });

  it("sets status and priority filters", () => {
    let state = reducer(initial(), statusFilterChanged("open"));
    state = reducer(state, priorityFilterChanged("urgent"));
    expect(state.status).toBe("open");
    expect(state.priority).toBe("urgent");
  });

  it("toggles direction when the same sort column is clicked again", () => {
    const state = reducer(initial(), sortChanged("priority"));
    expect(state.sortField).toBe("priority");
    expect(state.sortDir).toBe("asc"); // flipped from default desc
  });

  it("switches column and resets to descending on a new sort field", () => {
    const state = reducer(initial(), sortChanged("subject"));
    expect(state.sortField).toBe("subject");
    expect(state.sortDir).toBe("desc");
  });

  it("resets everything on clear", () => {
    let state = reducer(initial(), searchChanged("x"));
    state = reducer(state, statusFilterChanged("resolved"));
    state = reducer(state, filtersCleared());
    expect(state).toEqual(initial());
  });
});
