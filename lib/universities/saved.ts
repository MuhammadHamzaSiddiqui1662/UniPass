export const SAVED_UNIVERSITIES_KEY = "savedUniversities";
export const COMPARE_LIST_KEY = "compareList";

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
