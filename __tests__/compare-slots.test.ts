import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  COMPARE_LIST_KEY,
  addCompareId,
  addToCompare,
  normalizeCompareSlots,
  readCompareSlots,
  setCompareSlot,
  writeCompareSlots,
} from "@/lib/universities/saved";

describe("normalizeCompareSlots", () => {
  test("pads a packed list and keeps only the first three unique ids", () => {
    expect(normalizeCompareSlots(["a", "b"])).toEqual(["a", "b", null]);
    expect(normalizeCompareSlots(["a", "a", "b", "c", "d"])).toEqual(["a", "b", "c"]);
  });

  test("keeps an empty column where it is", () => {
    expect(normalizeCompareSlots(["a", null, "c"])).toEqual(["a", null, "c"]);
  });

  test("clears a repeated id without shifting the other columns", () => {
    expect(normalizeCompareSlots(["a", "b", "a"])).toEqual(["a", "b", null]);
    expect(normalizeCompareSlots("nope")).toEqual([null, null, null]);
  });
});

describe("addCompareId", () => {
  test("fills the first empty slot", () => {
    expect(addCompareId(["a", null, "c"], "b")).toEqual({
      slots: ["a", "b", "c"],
      result: "added",
    });
  });

  test("reports a university that is already selected", () => {
    const slots = ["a", "b", null];
    expect(addCompareId(slots, "b")).toEqual({ slots, result: "already" });
  });

  test("refuses a fourth university", () => {
    const slots = ["a", "b", "c"];
    expect(addCompareId(slots, "d")).toEqual({ slots, result: "full" });
  });
});

describe("setCompareSlot", () => {
  test("replaces or clears one column and leaves the others in place", () => {
    expect(setCompareSlot(["a", "b", "c"], 1, "d")).toEqual(["a", "d", "c"]);
    expect(setCompareSlot(["a", "b", "c"], 0, null)).toEqual([null, "b", "c"]);
  });

  test("does not copy a university into a second column", () => {
    expect(setCompareSlot(["a", "b", null], 2, "a")).toEqual(["a", "b", null]);
  });
});

describe("addToCompare", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("stores three slots and stops at the limit", () => {
    expect(addToCompare("a")).toBe("added");
    expect(addToCompare("a")).toBe("already");
    expect(addToCompare("b")).toBe("added");
    expect(addToCompare("c")).toBe("added");
    expect(addToCompare("d")).toBe("full");
    expect(readCompareSlots()).toEqual(["a", "b", "c"]);
    expect(JSON.parse(localStorage.getItem(COMPARE_LIST_KEY) || "[]")).toEqual(["a", "b", "c"]);
  });

  test("writes a cleared column as an empty slot", () => {
    writeCompareSlots(["a", null, "b"]);
    expect(readCompareSlots()).toEqual(["a", null, "b"]);
    expect(addToCompare("c")).toBe("added");
    expect(readCompareSlots()).toEqual(["a", "c", "b"]);
  });
});
