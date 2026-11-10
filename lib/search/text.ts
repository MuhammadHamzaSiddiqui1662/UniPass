const FOLDS: Record<string, string> = {
  ü: "u",
  ö: "o",
  ş: "s",
  ç: "c",
  ğ: "g",
  ı: "i",
  â: "a",
  î: "i",
  û: "u",
};

const STOP = new Set([
  "the",
  "of",
  "and",
  "university",
  "universitesi",
  "universites",
  "uni",
  "univ",
]);

/** Fold Turkish letters, case, and punctuation so "Boğaziçi" and "bogazici" compare. */
export function fold(input: string) {
  return input
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLocaleLowerCase("tr")
    .replace(/[üöşçğıâîû]/g, (char) => FOLDS[char] || char)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bturkiye\b/g, "turkey")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compact(input: string) {
  return fold(input)
    .split(" ")
    .filter((word) => word && !STOP.has(word))
    .join(" ");
}

function levenshtein(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let previous = i - 1;
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const current = row[j];
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + cost);
      previous = current;
    }
  }
  return row[right.length];
}

function tokenLimit(token: string) {
  if (token.length <= 4) return 1;
  if (token.length <= 8) return 2;
  return 3;
}

export type SearchFieldWeight = "identity" | "detail";

export type SearchField = {
  value: string;
  weight: SearchFieldWeight;
};

export type SearchMatchKind = "exact" | "normalized" | "fuzzy";

export type SearchRecordsResult<T> = {
  items: T[];
  hint: string | null;
};

function valuesOf(fields: SearchField[], weight: SearchFieldWeight) {
  return fields.filter((field) => field.weight === weight && field.value.trim()).map((field) => field.value);
}

function phraseMatch(values: string[], folded: string, compacted: string): Exclude<SearchMatchKind, "fuzzy"> | null {
  const foldedValues = values.map(fold).filter(Boolean);
  if (foldedValues.some((value) => value.includes(folded))) return "exact";
  if (!compacted) return null;
  const compactValues = values.map(compact).filter(Boolean);
  if (
    compactValues.some((value) => value.includes(compacted) || (compacted.includes(value) && value.length > 2))
  ) {
    return "normalized";
  }
  return null;
}

function fuzzyDistance(values: string[], compacted: string) {
  const tokens = compacted.split(" ").filter(Boolean);
  if (!tokens.length) return null;
  const hay = new Set(
    values
      .map(compact)
      .filter(Boolean)
      .flatMap((value) => value.split(" ")),
  );
  if (!hay.size) return null;
  let total = 0;
  for (const token of tokens) {
    let best = Infinity;
    for (const word of hay) {
      if (word.includes(token) || (token.includes(word) && word.length > 2)) {
        best = 0;
        break;
      }
      best = Math.min(best, levenshtein(token, word));
    }
    if (best > tokenLimit(token)) return null;
    total += best;
  }
  return total;
}

/**
 * Rank records against a free-text query.
 * Identity fields keep exact, normalized, and fuzzy matching.
 * Detail fields match the phrase only, so long text does not absorb typos.
 * Any identity hit ranks ahead of a detail hit.
 */
export function searchRecords<T>(
  list: T[],
  rawQuery: string,
  options: {
    fields: (item: T) => SearchField[];
    label: (item: T) => string;
  },
): SearchRecordsResult<T> {
  const query = rawQuery.trim();
  const folded = fold(query);
  const compacted = compact(query);
  if (!folded) return { items: list, hint: null };

  const ranked = list
    .map((item) => {
      const fields = options.fields(item);
      const identity = valuesOf(fields, "identity");
      const detail = valuesOf(fields, "detail");
      const identityPhrase = phraseMatch(identity, folded, compacted);
      if (identityPhrase === "exact") return { item, score: 0, kind: "exact" as const };
      if (identityPhrase === "normalized") return { item, score: 1, kind: "normalized" as const };
      const distance = fuzzyDistance(identity, compacted);
      if (distance !== null) return { item, score: 2 + distance, kind: "fuzzy" as const };
      const detailPhrase = phraseMatch(detail, folded, compacted);
      if (detailPhrase === "exact") return { item, score: 100, kind: "exact" as const };
      if (detailPhrase === "normalized") return { item, score: 101, kind: "normalized" as const };
      return null;
    })
    .filter((hit): hit is NonNullable<typeof hit> => Boolean(hit))
    .sort((a, b) => a.score - b.score || options.label(a.item).localeCompare(options.label(b.item)));

  const items = ranked.map((hit) => hit.item);
  const top = ranked[0];
  const hint =
    top?.kind === "fuzzy"
      ? items.length === 1
        ? `Did you mean ${options.label(top.item)}?`
        : `Showing results for “${options.label(top.item)}” and similar matches`
      : null;
  return { items, hint };
}
