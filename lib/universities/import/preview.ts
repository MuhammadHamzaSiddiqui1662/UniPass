import { fold } from "@/lib/universities/search";
import { isStoredImageReference } from "@/lib/upload/urls";
import type { ImportKey } from "@/lib/universities/import/columns";
import type { CsvTable } from "@/lib/universities/import/csv";
import type { ZipIndex } from "@/lib/universities/import/zip";

export type ExistingRef = { id: string; name: string; slug: string };

export type ImageState = "empty" | "zip" | "url" | "hosted" | "missing" | "invalid";

export type PreviewImage = {
  field: "logo" | "featured_image" | "gallery" | "ogImage";
  value: string;
  state: ImageState;
  detail: string;
};

export type PreviewRow = {
  rowNumber: number;
  name: string;
  slug: string;
  errors: string[];
  warnings: string[];
  match: { id: string; name: string; slug: string } | null;
  images: PreviewImage[];
  values: ParsedValues;
};

export type ParsedValues = {
  name: string;
  slug: string;
  type: "public" | "private" | "";
  city: string;
  country: string;
  countryCode: string;
  scholarshipType: "fully_funded" | "partially_funded" | "none" | "";
  fields: string[];
  levels: string[];
  languages: string[];
  tuitionFrom: number | null;
  tuitionTo: number | null;
  tuitionCurrency: string;
  description: string;
  whyChoose: string;
  programsInfo: string;
  campusLife: string;
  website: string;
  ranking: number | null;
  facts: Record<string, string>;
  aliases: string[];
  featuredOnHome: boolean;
  homeOrder: number;
  hasMeritScholarship: boolean;
  status: "draft" | "published";
  logo: string;
  featuredImage: string;
  gallery: string[];
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
};

const IMAGE_FIELDS: { key: ImportKey; field: PreviewImage["field"]; many: boolean }[] = [
  { key: "logo", field: "logo", many: false },
  { key: "featuredImage", field: "featured_image", many: false },
  { key: "gallery", field: "gallery", many: true },
  { key: "ogImage", field: "ogImage", many: false },
];

export function previewImport(table: CsvTable, zip: ZipIndex, existing: ExistingRef[]): PreviewRow[] {
  const bySlug = new Map<string, ExistingRef>();
  const nameBuckets = new Map<string, ExistingRef[]>();
  for (const record of existing) {
    bySlug.set(record.slug, record);
    const key = normalizeUniversityName(record.name);
    nameBuckets.set(key, [...(nameBuckets.get(key) || []), record]);
  }
  const seenSlugs = new Map<string, number>();
  const seenNames = new Map<string, number>();
  return table.rows.map((row) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const cells = row.cells;
    const values = parseValues(cells, table.present, errors);
    if (values.slug) {
      const previous = seenSlugs.get(values.slug);
      if (previous) errors.push(`Slug ${values.slug} is also used on row ${previous}.`);
      else seenSlugs.set(values.slug, row.rowNumber);
    }
    const nameKey = normalizeUniversityName(values.name);
    if (nameKey) {
      const previous = seenNames.get(nameKey);
      if (previous) errors.push(`This name repeats row ${previous}.`);
      else seenNames.set(nameKey, row.rowNumber);
    }

    let match: PreviewRow["match"] = null;
    if (values.slug && bySlug.has(values.slug)) {
      const found = bySlug.get(values.slug)!;
      match = { id: found.id, name: found.name, slug: found.slug };
    } else if (nameKey && nameBuckets.has(nameKey)) {
      const bucket = nameBuckets.get(nameKey)!;
      if (bucket.length > 1) errors.push("More than one saved university has this name. Set a slug.");
      else {
        match = { id: bucket[0].id, name: bucket[0].name, slug: bucket[0].slug };
        if (values.slug && bySlug.has(values.slug) && bySlug.get(values.slug)!.id !== match.id) {
          errors.push(`Slug ${values.slug} belongs to a different university.`);
        }
      }
    }

    const images = imageReport(cells, table.present, zip, warnings);
    if (!match) {
      if (!table.present.has("type") && !values.type) errors.push("Type must be public or private.");
      if (!table.present.has("city") && !values.city) errors.push("City is required.");
      if (!table.present.has("description") && !values.description) errors.push("Description is required.");
      if (!table.present.has("tuitionFrom") && values.tuitionFrom === null) errors.push("Tuition minimum is required.");
    }
    return {
      rowNumber: row.rowNumber,
      name: values.name,
      slug: values.slug,
      errors,
      warnings,
      match,
      images,
      values,
    };
  });
}

export function willImport(row: Pick<PreviewRow, "errors" | "match">, updateExisting: boolean) {
  if (row.errors.length) return false;
  if (row.match && !updateExisting) return false;
  return true;
}

export function rowStatus(
  row: Pick<PreviewRow, "errors" | "warnings" | "match">,
  updateExisting: boolean,
): "New" | "Update" | "Error" | "Warning" {
  if (row.errors.length) return "Error";
  if (row.warnings.length || (row.match && !updateExisting)) return "Warning";
  if (row.match) return "Update";
  return "New";
}

export function rowMessages(row: Pick<PreviewRow, "errors" | "warnings" | "match">, updateExisting: boolean) {
  const messages = [...row.errors, ...row.warnings];
  if (!row.errors.length && row.match && !updateExisting) {
    messages.push(`Matches ${row.match.name}. Turn on “Update existing” to overwrite it.`);
  } else if (!row.errors.length && row.match) {
    messages.unshift(`Updates ${row.match.slug}.`);
  }
  return messages;
}

export function normalizeUniversityName(value: string) {
  return fold(value)
    .split(" ")
    .filter((word) => word && word !== "university" && word !== "universitesi" && word !== "uni")
    .join(" ");
}

function parseValues(cells: CsvTable["rows"][number]["cells"], present: Set<ImportKey>, errors: string[]): ParsedValues {
  const name = cell(cells, "name");
  if (name.trim().length < 2) errors.push("Name is required.");
  const type = parseType(cell(cells, "type"), errors);
  const city = cell(cells, "city");
  if (present.has("city") && !city) errors.push("City is required.");
  const slugSource = cell(cells, "slug");
  const slug = slugSource ? slugifyImport(slugSource) : slugifyImport(name);
  if (slugSource && slug !== slugSource) errors.push("Slug can use lowercase letters, numbers, and hyphens.");
  else if (!slug || slug.length < 2) errors.push("Slug could not be created from the name.");

  const country = cell(cells, "country") || "Türkiye";
  const countryCode = (cell(cells, "countryCode") || "TR").toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) errors.push("Country code must be two letters.");

  const scholarshipType = parseScholarship(cell(cells, "scholarshipType"), errors);
  const tuitionFrom = parseNumber(cell(cells, "tuitionFrom"), "Tuition minimum", present.has("tuitionFrom"), errors);
  const tuitionTo = parseNumber(cell(cells, "tuitionTo"), "Tuition maximum", false, errors);
  if (tuitionFrom !== null && tuitionTo !== null && tuitionTo < tuitionFrom) {
    errors.push("Tuition maximum is lower than the minimum.");
  }
  const description = cell(cells, "description");
  if (present.has("description") && !description) errors.push("Description is required.");
  const website = cell(cells, "website");
  if (website && !/^https?:\/\//i.test(website)) errors.push("Website must start with http:// or https://.");
  const ranking = parseInteger(cell(cells, "ranking"), "Ranking", errors);
  const homeOrderRaw = cell(cells, "homeOrder");
  const homeOrder = homeOrderRaw ? parseInteger(homeOrderRaw, "Home order", errors) || 0 : 0;
  const featured = parseBool(cell(cells, "featuredOnHome"), false, "Show on home", errors);
  const merit = parseBool(cell(cells, "hasMeritScholarship"), false, "Merit scholarship", errors);
  const status = parseStatus(cell(cells, "published"), errors);

  return {
    name,
    slug,
    type,
    city,
    country,
    countryCode,
    scholarshipType,
    fields: splitList(cell(cells, "fields")),
    levels: splitList(cell(cells, "levels")),
    languages: splitList(cell(cells, "languages")),
    tuitionFrom,
    tuitionTo,
    tuitionCurrency: (cell(cells, "tuitionCurrency") || "USD").toUpperCase(),
    description,
    whyChoose: cell(cells, "whyChoose"),
    programsInfo: cell(cells, "programsInfo"),
    campusLife: cell(cells, "campusLife"),
    website,
    ranking,
    facts: parseFacts(cell(cells, "facts")),
    aliases: splitList(cell(cells, "aliases")),
    featuredOnHome: featured,
    homeOrder,
    hasMeritScholarship: merit,
    status,
    logo: firstSingle(cell(cells, "logo")),
    featuredImage: firstSingle(cell(cells, "featuredImage")),
    gallery: splitList(cell(cells, "gallery")),
    metaTitle: cell(cells, "metaTitle"),
    metaDescription: cell(cells, "metaDescription"),
    ogImage: firstSingle(cell(cells, "ogImage")),
  };
}

function imageReport(
  cells: CsvTable["rows"][number]["cells"],
  present: Set<ImportKey>,
  zip: ZipIndex,
  warnings: string[],
) {
  const images: PreviewImage[] = [];
  for (const column of IMAGE_FIELDS) {
    if (!present.has(column.key)) continue;
    const values = column.many ? splitList(cell(cells, column.key)) : [firstSingle(cell(cells, column.key))].filter(Boolean);
    if (!values.length) continue;
    for (const value of values) {
      const image = classifyImage(column.field, value, zip);
      images.push(image);
      if (image.state === "missing" || image.state === "invalid") warnings.push(`${image.field}: ${image.detail}`);
    }
  }
  return images;
}

export function classifyImage(field: PreviewImage["field"], value: string, zip: ZipIndex): PreviewImage {
  const trimmed = value.trim();
  if (!trimmed) return { field, value: trimmed, state: "empty", detail: "Empty" };
  if (/^https?:\/\//i.test(trimmed)) {
    if (!publicLookingUrl(trimmed)) return { field, value: trimmed, state: "invalid", detail: `${trimmed} is not a public http(s) URL` };
    return { field, value: trimmed, state: "url", detail: "URL ok" };
  }
  if (trimmed.startsWith("/") && isStoredImageReference(trimmed)) {
    return { field, value: trimmed, state: "hosted", detail: "Already hosted" };
  }
  if (trimmed.startsWith("/")) return { field, value: trimmed, state: "invalid", detail: `${trimmed} is not a usable image path` };
  if (zip.has(trimmed)) return { field, value: trimmed, state: "zip", detail: "Found in ZIP" };
  return { field, value: trimmed, state: "missing", detail: `${trimmed} was not in the ZIP` };
}

function publicLookingUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost")) return false;
    if (host === "metadata.google.internal") return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      const [a, b] = host.split(".").map(Number);
      if (a === 0 || a === 10 || a === 127) return false;
      if (a === 169 && b === 254) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function cell(cells: Partial<Record<ImportKey, string>>, key: ImportKey) {
  return cells[key]?.trim() || "";
}

export function splitList(value: string) {
  return value.split("|").map((part) => part.trim()).filter(Boolean);
}

function firstSingle(value: string) {
  return splitList(value)[0] || "";
}

function parseType(value: string, errors: string[]): ParsedValues["type"] {
  if (!value) return "";
  const normalized = value.trim().toLowerCase();
  if (normalized === "public" || normalized === "state") return "public";
  if (normalized === "private" || normalized === "foundation") return "private";
  errors.push("Type must be public or private.");
  return "";
}

function parseScholarship(value: string, errors: string[]): ParsedValues["scholarshipType"] {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!normalized || normalized === "none" || normalized === "no") return "none";
  if (normalized === "fully_funded" || normalized === "full") return "fully_funded";
  if (normalized === "partially_funded" || normalized === "partial" || normalized === "merit") return "partially_funded";
  errors.push("Scholarship must be fully_funded, partially_funded, or none.");
  return "";
}

function parseNumber(value: string, label: string, required: boolean, errors: string[]) {
  if (!value) {
    if (required) errors.push(`${label} is required.`);
    return null;
  }
  const number = Number(value.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(number) || number < 0) {
    errors.push(`${label} must be a number that is zero or more.`);
    return null;
  }
  return number;
}

function parseInteger(value: string, label: string, errors: string[]) {
  if (!value) return null;
  if (!/^-?\d+$/.test(value.replace(/,/g, ""))) {
    errors.push(`${label} must be a whole number.`);
    return null;
  }
  return Number(value.replace(/,/g, ""));
}

function parseBool(value: string, fallback: boolean, label: string, errors: string[]) {
  if (!value) return fallback;
  const normalized = value.toLowerCase();
  if (["1", "true", "yes", "y"].includes(normalized)) return true;
  if (["0", "false", "no", "n"].includes(normalized)) return false;
  errors.push(`${label} must be true or false.`);
  return fallback;
}

function parseStatus(value: string, errors: string[]): "draft" | "published" {
  if (!value) return "draft";
  const normalized = value.toLowerCase();
  if (["1", "true", "yes", "y", "published"].includes(normalized)) return "published";
  if (["0", "false", "no", "n", "draft"].includes(normalized)) return "draft";
  errors.push("Published must be true or false.");
  return "draft";
}

function parseFacts(value: string) {
  const facts: Record<string, string> = {};
  for (const part of splitList(value)) {
    const index = part.indexOf(":");
    if (index === -1) facts.notes = facts.notes ? `${facts.notes}; ${part}` : part;
    else facts[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return facts;
}

export function slugifyImport(value: string) {
  return fold(value).replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
