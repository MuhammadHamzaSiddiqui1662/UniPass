export const SAVED_UNIVERSITIES_KEY = "savedUniversities";
export const COMPARE_LIST_KEY = "compareList";
export const COMPARE_SLOT_COUNT = 3;

export type CompareSlots = (string | null)[];
export type CompareAddResult = "added" | "already" | "full";

export function emptyCompareSlots(): CompareSlots {
  return Array.from({ length: COMPARE_SLOT_COUNT }, () => null);
}

/** Packed id lists fill from the left. A 3-long list keeps empty columns in place. */
export function normalizeCompareSlots(value: unknown): CompareSlots {
  const slots = emptyCompareSlots();
  if (!Array.isArray(value)) return slots;

  const isSlotList = value.length === COMPARE_SLOT_COUNT || value.some((item) => item === null);
  const seen = new Set<string>();

  if (isSlotList) {
    for (let index = 0; index < COMPARE_SLOT_COUNT; index += 1) {
      const item = value[index];
      if (typeof item !== "string" || !item || seen.has(item)) continue;
      seen.add(item);
      slots[index] = item;
    }
    return slots;
  }

  let index = 0;
  for (const item of value) {
    if (index >= COMPARE_SLOT_COUNT) break;
    if (typeof item !== "string" || !item || seen.has(item)) continue;
    seen.add(item);
    slots[index] = item;
    index += 1;
  }
  return slots;
}

export function readCompareSlots(): CompareSlots {
  if (typeof window === "undefined") return emptyCompareSlots();
  try {
    return normalizeCompareSlots(JSON.parse(localStorage.getItem(COMPARE_LIST_KEY) || "[]"));
  } catch {
    return emptyCompareSlots();
  }
}

export function writeCompareSlots(slots: CompareSlots) {
  localStorage.setItem(COMPARE_LIST_KEY, JSON.stringify(normalizeCompareSlots(slots)));
}

export function addCompareId(
  slots: CompareSlots,
  id: string,
): { slots: CompareSlots; result: CompareAddResult } {
  const current = normalizeCompareSlots(slots);
  if (current.includes(id)) return { slots: current, result: "already" };
  const empty = current.indexOf(null);
  if (empty === -1) return { slots: current, result: "full" };
  const next = [...current];
  next[empty] = id;
  return { slots: next, result: "added" };
}

export function setCompareSlot(slots: CompareSlots, index: number, id: string | null): CompareSlots {
  const current = normalizeCompareSlots(slots);
  if (index < 0 || index >= COMPARE_SLOT_COUNT) return current;
  if (id && current.some((slot, slotIndex) => slotIndex !== index && slot === id)) return current;
  const next = [...current];
  next[index] = id;
  return next;
}

export function addToCompare(id: string): CompareAddResult {
  const { slots, result } = addCompareId(readCompareSlots(), id);
  if (result === "added") writeCompareSlots(slots);
  return result;
}

export function readIdList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writeIdList(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

/** Returns whether `id` is in the list after the toggle. */
export function toggleId(key: string, id: string): boolean {
  const current = readIdList(key);
  const saved = current.includes(id);
  writeIdList(
    key,
    saved ? current.filter((item) => item !== id) : [...current, id],
  );
  return !saved;
}
