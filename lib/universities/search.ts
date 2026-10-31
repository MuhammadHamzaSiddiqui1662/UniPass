import type { CatalogUniversity } from "@/lib/universities/catalog";

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

export type SearchHit = {
  university: CatalogUniversity;
  kind: "exact" | "normalized" | "fuzzy";
};

export type SearchResult = {
  items: CatalogUniversity[];
  hint: string | null;
};

export function searchUniversities(list: CatalogUniversity[], rawQuery: string): SearchResult {
  const query = rawQuery.trim();
  const folded = fold(query);
  const compacted = compact(query);
  if (!folded) return { items: list, hint: null };

  const ranked = list
    .map((university) => {
      const names = [
        university.name,
        university.city,
        university.country,
        university.countryCode,
        university.slug.replace(/-/g, " "),
        ...university.aliases,
      ];
      const foldedNames = names.map(fold).filter(Boolean);
      const compactNames = names.map(compact).filter(Boolean);
      if (foldedNames.some((name) => name.includes(folded))) {
        return { university, score: 0, kind: "exact" as const };
      }
      if (
        compacted &&
        compactNames.some((name) => name.includes(compacted) || (compacted.includes(name) && name.length > 2))
      ) {
        return { university, score: 1, kind: "normalized" as const };
      }
      const tokens = compacted.split(" ").filter(Boolean);
      const hay = new Set(compactNames.flatMap((name) => name.split(" ")));
      if (!tokens.length) return null;
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
      return { university, score: 2 + total, kind: "fuzzy" as const };
    })
    .filter((hit): hit is NonNullable<typeof hit> => Boolean(hit))
    .sort((a, b) => a.score - b.score || a.university.name.localeCompare(b.university.name));

  const items = ranked.map((hit) => hit.university);
  const fuzzy = ranked.some((hit) => hit.kind !== "exact");
  const top = ranked[0];
  let hint: string | null = null;
  if (fuzzy && top) {
    hint =
      items.length === 1
        ? `Did you mean ${top.university.name}?`
        : `Showing results for “${top.university.name}” and similar matches`;
  }
  return { items, hint };
}
