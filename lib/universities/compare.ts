import { cityLabel, FILTER_TYPES } from "@/lib/universities/catalog";
import { sanitizeKnownFor } from "@/lib/universities/known-for";
import { formatCurrency } from "@/lib/utils/format";

export const COMPARE_EMPTY = "—";

export type CompareUniversity = {
  _id: string;
  slug: string;
  name: string;
  type: string;
  city: string;
  country: string;
  tuitionFrom?: number;
  tuitionTo?: number;
  tuitionCurrency: string;
  website?: string;
  fields: string[];
  knownFor: string[];
  levels: string[];
  languages: string[];
  hasMeritScholarship: boolean;
  scholarshipType: "fully_funded" | "partially_funded" | "none";
  turkiyeBurslariEligible: boolean;
  foundedYear?: number;
  studentsCount?: number;
  internationalStudents?: number;
  ranking?: number;
  accreditations: string[];
  facilityHighlights: string[];
  keyFacts: string[];
};

type CompareSource = {
  _id?: unknown;
  slug?: string;
  name?: string;
  type?: string;
  city?: string;
  country?: string;
  tuitionFrom?: unknown;
  tuitionTo?: unknown;
  tuitionCurrency?: unknown;
  website?: unknown;
  fields?: unknown;
  knownFor?: unknown;
  levels?: unknown;
  languages?: unknown;
  languagesOffered?: unknown;
  hasMeritScholarship?: boolean;
  scholarshipType?: unknown;
  turkiyeBurslariEligible?: boolean;
  foundedYear?: unknown;
  studentsCount?: unknown;
  internationalStudents?: unknown;
  ranking?: unknown;
  rankingNational?: unknown;
  accreditations?: unknown;
  facilityHighlights?: unknown;
  keyFacts?: unknown;
};

export type CompareRow = {
  label: string;
  value: (university: CompareUniversity) => string;
  href?: (university: CompareUniversity) => string | undefined;
};

export function toCompareUniversity(university: CompareSource): CompareUniversity | null {
  const slug = university.slug?.trim();
  const name = university.name?.trim();
  if (!slug || !name) return null;
  const rawId = university._id == null ? "" : String(university._id).trim();
  const fields = textList(university.fields);
  return {
    _id: rawId || slug,
    slug,
    name,
    type: university.type || "",
    city: university.city || "",
    country: text(university.country),
    tuitionFrom: optionalNumber(university.tuitionFrom),
    tuitionTo: positiveNumber(university.tuitionTo),
    tuitionCurrency: currency(university.tuitionCurrency),
    website: websiteHref(university.website),
    fields,
    knownFor: sanitizeKnownFor(fields, university.knownFor),
    levels: textList(university.levels),
    languages: textList(university.languages ?? university.languagesOffered),
    hasMeritScholarship: Boolean(university.hasMeritScholarship),
    scholarshipType: scholarshipType(university.scholarshipType),
    turkiyeBurslariEligible: Boolean(university.turkiyeBurslariEligible),
    foundedYear: positiveNumber(university.foundedYear),
    studentsCount: positiveNumber(university.studentsCount),
    internationalStudents: positiveNumber(university.internationalStudents),
    ranking: positiveNumber(university.ranking ?? university.rankingNational),
    accreditations: textList(university.accreditations),
    facilityHighlights: textList(university.facilityHighlights),
    keyFacts: textList(university.keyFacts),
  };
}

export const COMPARE_ROWS: CompareRow[] = [
  { label: "Type", value: (university) => typeLabel(university.type) },
  { label: "Country", value: (university) => university.country || COMPARE_EMPTY },
  { label: "City", value: (university) => cityLabel(university.city) || COMPARE_EMPTY },
  { label: "Founded", value: (university) => (university.foundedYear ? String(university.foundedYear) : COMPARE_EMPTY) },
  { label: "National ranking", value: (university) => (university.ranking ? `#${university.ranking}` : COMPARE_EMPTY) },
  { label: "Students", value: (university) => countText(university.studentsCount) },
  { label: "International students", value: (university) => countText(university.internationalStudents) },
  { label: "Tuition (per year)", value: tuitionText },
  { label: "Languages", value: (university) => listText(university.languages) },
  { label: "Known for", value: (university) => listText(university.knownFor) },
  { label: "Fields offered", value: (university) => listText(university.fields) },
  { label: "Levels", value: (university) => listText(university.levels) },
  { label: "Scholarship", value: (university) => scholarshipText(university.scholarshipType) },
  { label: "Merit scholarship", value: (university) => (university.hasMeritScholarship ? "Yes" : "No") },
  { label: "Türkiye Bursları", value: (university) => (university.turkiyeBurslariEligible ? "Eligible" : "Not eligible") },
  { label: "Accreditations", value: (university) => listText(university.accreditations) },
  { label: "Facility highlights", value: (university) => linesText(university.facilityHighlights) },
  { label: "Key facts", value: (university) => linesText(university.keyFacts) },
  {
    label: "Website",
    value: (university) => websiteLabel(university.website),
    href: (university) => university.website,
  },
];

/** Keep a row when at least one selected university has a value. An empty selection shows every row. */
export function visibleCompareRows(universities: Array<CompareUniversity | undefined>) {
  const selected = universities.filter((university): university is CompareUniversity => Boolean(university));
  if (!selected.length) return COMPARE_ROWS;
  return COMPARE_ROWS.filter((row) => selected.some((university) => row.value(university) !== COMPARE_EMPTY));
}

function typeLabel(type: string) {
  return FILTER_TYPES.find((item) => item.value === type)?.label || type || COMPARE_EMPTY;
}

function tuitionText(university: CompareUniversity) {
  if (university.tuitionFrom == null) return COMPARE_EMPTY;
  const from = formatCurrency(university.tuitionFrom, university.tuitionCurrency);
  if (university.tuitionTo == null) return `${from} a year`;
  return `${from} – ${formatCurrency(university.tuitionTo, university.tuitionCurrency)} a year`;
}

function scholarshipText(type: CompareUniversity["scholarshipType"]) {
  if (type === "fully_funded") return "Fully funded";
  if (type === "partially_funded") return "Partially funded";
  return "None";
}

function scholarshipType(value: unknown): CompareUniversity["scholarshipType"] {
  if (value === "fully_funded" || value === "partially_funded" || value === "none") return value;
  return "none";
}

function listText(values: string[]) {
  return values.length ? values.join(", ") : COMPARE_EMPTY;
}

function linesText(values: string[]) {
  return values.length ? values.join("\n") : COMPARE_EMPTY;
}

function countText(value?: number) {
  return value ? new Intl.NumberFormat("en-US").format(value) : COMPARE_EMPTY;
}

function websiteLabel(value?: string) {
  if (!value) return COMPARE_EMPTY;
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function websiteHref(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return undefined;
  }
  return undefined;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function textList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function optionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function positiveNumber(value: unknown) {
  const number = optionalNumber(value);
  return number != null && number > 0 ? Math.trunc(number) : undefined;
}

function currency(value: unknown) {
  if (typeof value === "string" && /^[A-Za-z]{3}$/.test(value.trim())) return value.trim().toUpperCase();
  return "USD";
}
