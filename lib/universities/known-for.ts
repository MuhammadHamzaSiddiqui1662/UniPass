/** Keep up to three highlights that still belong to the university's fields, in the order chosen. */
export function sanitizeKnownFor(fields: string[], knownFor?: unknown): string[] {
  const allowed = new Set(fields.map((field) => field.trim()).filter(Boolean));
  if (!Array.isArray(knownFor)) return [];

  const picked: string[] = [];
  for (const item of knownFor) {
    const value = String(item).trim();
    if (!value || !allowed.has(value) || picked.includes(value)) continue;
    picked.push(value);
    if (picked.length === 3) break;
  }
  return picked;
}

/** Highlights for a preview card. An empty choice falls back to the first three fields. */
export function cardKnownFor(fields: string[], knownFor?: string[]): string[] {
  const picked = sanitizeKnownFor(fields, knownFor);
  if (picked.length) return picked;
  return fields.map((field) => field.trim()).filter(Boolean).slice(0, 3);
}
