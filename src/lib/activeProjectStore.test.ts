import { beforeEach, describe, expect, it } from "vitest";
import {
  ACTIVE_PROJECT_STORAGE_KEY,
  activeProjectStore,
} from "./activeProjectStore";

const project = { id: "p1", name: "Jambi 2024", sessionId: "s1" };

describe("activeProjectStore", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns the saved project for its own session", () => {
    activeProjectStore.save(project);
    expect(activeProjectStore.loadFor("s1")).toEqual(project);
  });

  it("returns null for a different session", () => {
    activeProjectStore.save(project);
    expect(activeProjectStore.loadFor("s2")).toBeNull();
  });

  it("returns null when nothing is stored or the session is empty", () => {
    expect(activeProjectStore.loadFor("s1")).toBeNull();
    activeProjectStore.save(project);
    expect(activeProjectStore.loadFor("")).toBeNull();
  });

  it("drops a corrupt entry", () => {
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, "{not json");
    expect(activeProjectStore.loadFor("s1")).toBeNull();
    expect(window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY)).toBeNull();

    window.localStorage.setItem(
      ACTIVE_PROJECT_STORAGE_KEY,
      JSON.stringify({ id: 1, name: "x", sessionId: "s1" }),
    );
    expect(activeProjectStore.loadFor("s1")).toBeNull();
  });

  it("clear removes the entry", () => {
    activeProjectStore.save(project);
    activeProjectStore.clear();
    expect(activeProjectStore.loadFor("s1")).toBeNull();
  });
});
