import { fallbackUniversities, type ScholarshipType } from "@/lib/universities/catalog";
import type { IUniversity } from "@/lib/db/models/University";
import { formatCurrency } from "@/lib/utils/format";

export type DetailUniversity = {
  _id?: string;
  slug: string;
  name: string;
  type: "public" | "private";
  city: string;
  country: string;
  countryCode: string;
  scholarshipType: ScholarshipType;
  tuitionFrom: number;
  tuitionTo?: number;
  tuitionCurrency: string;
  website?: string;
  languages: string[];
  fields: string[];
  levels: string[];
  description: string;
  whyChoose: string;
  programsInfo: string;
  campusLife: string;
  turkiyeBurslariEligible: boolean;
  hasMeritScholarship: boolean;
  foundedYear?: number;
  studentsCount?: number;
  internationalStudents?: number;
  ranking?: number;
  accreditations: string[];
  facilityHighlights: string[];
  keyFacts: string[];
  facts: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  logo?: string;
  logoAlt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  gallery: string[];
  galleryAlts: string[];
  ogImage?: string;
};

export type DetailFact = {
  label: string;
  value: string;
  href?: string;
  compact: boolean;
  primary: boolean;
};

const COMPACT_FACTS = new Set([
  "type",
  "country",
  "city",
  "founded",
  "students",
  "international students",
  "national ranking",
]);

const PRIMARY_FACTS = new Set(["type", "country", "city", "tuition", "levels", "fields", "scholarships"]);

const about =
  "Placeholder paragraph: two or three sentences about the university's history, reputation and standing in Türkiye. Replace with real, verified copy before publishing.";
const why =
  "Placeholder paragraph: strengths such as research output, faculty, facilities or location that matter to prospective students.";
const programs =
  "Placeholder paragraph: an overview of the main faculties and popular programs, with links to the full list where relevant.";
const campus =
  "Placeholder paragraph: housing, clubs, the international student community and what a typical week looks like.";

/** Detail copy for the same eight schools the listing uses as fallback. */
export const detailFallbacks: DetailUniversity[] = fallbackUniversities.map((university) => ({
  ...university,
  description: about,
  whyChoose: why,
  programsInfo: programs,
  campusLife: campus,
  turkiyeBurslariEligible: university.type === "public",
  tuitionCurrency: "USD",
  languages: [],
  accreditations: [],
  facilityHighlights: [],
  keyFacts: [],
  facts: {},
  gallery: [],
  galleryAlts: [],
}));

export function fallbackDetail(slug: string) {
  return detailFallbacks.find((university) => university.slug === slug) || null;
}

export function scholarshipLabel(
  university: Pick<DetailUniversity, "scholarshipType" | "turkiyeBurslariEligible" | "hasMeritScholarship">,
) {
  const parts: string[] = [];
  if (university.scholarshipType === "fully_funded") parts.push("Fully funded");
  else if (university.scholarshipType === "partially_funded") parts.push("Partially funded");
  if (university.hasMeritScholarship) parts.push("Merit scholarships available");
  if (university.turkiyeBurslariEligible) parts.push("Eligible for Türkiye Bursları");
  return parts.length ? parts.join(" · ") : null;
}

export function publicUniversity(university: IUniversity, sample: DetailUniversity | null): DetailUniversity {
  return {
    _id: String(university._id),
    slug: university.slug,
    name: university.name,
    type: university.type,
    city: university.city,
    country: university.country || "Türkiye",
    countryCode: university.countryCode || "TR",
    scholarshipType: university.scholarshipType || "none",
    tuitionFrom: university.tuitionFrom,
    tuitionTo: positive(university.tuitionTo),
    tuitionCurrency: university.tuitionCurrency || "USD",
    website: university.website?.trim() || undefined,
    languages: textList(university.languages),
    fields: textList(university.fields),
    levels: textList(university.levels),
    description: university.description || sample?.description || "",
    whyChoose: university.whyChoose?.trim() || "",
    programsInfo: university.programsInfo?.trim() || "",
    campusLife: university.campusLife?.trim() || "",
    turkiyeBurslariEligible: Boolean(university.turkiyeBurslariEligible),
    hasMeritScholarship: Boolean(university.hasMeritScholarship),
    foundedYear: positive(university.foundedYear),
    studentsCount: positive(university.studentsCount),
    internationalStudents: positive(university.internationalStudents),
    ranking: positive(university.ranking),
    accreditations: textList(university.accreditations),
    facilityHighlights: textList(university.facilityHighlights),
    keyFacts: textList(university.keyFacts),
    facts: factPairs(university.facts),
    metaTitle: university.metaTitle,
    metaDescription: university.metaDescription,
    logo: university.logo || undefined,
    logoAlt: university.logoAlt || undefined,
    featuredImage: university.featuredImage || undefined,
    featuredImageAlt: university.featuredImageAlt || undefined,
    gallery: Array.isArray(university.gallery) ? university.gallery.filter(Boolean) : [],
    galleryAlts: Array.isArray(university.galleryAlts) ? university.galleryAlts : [],
    ogImage: university.ogImage || undefined,
  };
}

export function detailFacts(university: DetailUniversity): DetailFact[] {
  const rows: DetailFact[] = [];
  const shown = new Set<string>();
  const add = (key: string, label: string, value?: string | null, href?: string) => {
    const text = value?.trim();
    if (!text) return;
    shown.add(key);
    rows.push({
      label,
      value: text,
      href,
      compact: COMPACT_FACTS.has(key),
      primary: PRIMARY_FACTS.has(key),
    });
  };

  add("type", "Type", university.type === "public" ? "Public" : "Private");
  add("country", "Country", university.country);
  add("city", "City", university.city);
  add("founded", "Founded", university.foundedYear ? String(university.foundedYear) : undefined);
  add("students", "Students", count(university.studentsCount));
  add("international students", "International students", count(university.internationalStudents));
  add("national ranking", "National ranking", university.ranking ? `#${university.ranking}` : undefined);
  add("tuition", "Tuition from", tuitionValue(university));
  add("languages", "Languages", university.languages.join(", "));
  add("levels", "Levels", university.levels.join(", "));
  add("fields", "Fields", university.fields.join(", "));
  add("accreditations", "Accreditations", university.accreditations.join(", "));
  add("scholarships", "Scholarships", scholarshipLabel(university));
  if (university.website) {
    add("website", "Website", websiteLabel(university.website), websiteHref(university.website));
  }

  for (const [label, value] of Object.entries(university.facts)) {
    const key = factKey(label);
    if (shown.has(key)) continue;
    add(key, label, value);
  }
  return rows;
}

function tuitionValue(university: DetailUniversity) {
  const from = money(university.tuitionFrom, university.tuitionCurrency);
  const suffix = university._id ? "" : " (sample)";
  if (university.tuitionTo) {
    return `${from}–${money(university.tuitionTo, university.tuitionCurrency)} a year${suffix}`;
  }
  return `${from} a year${suffix}`;
}

function money(amount: number, currency: string) {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  return formatCurrency(amount, code);
}

function count(value?: number) {
  return value ? new Intl.NumberFormat("en-US").format(value) : undefined;
}

function websiteHref(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return undefined;
  }
  return undefined;
}

function websiteLabel(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function factKey(label: string) {
  const key = label.trim().toLowerCase().replace(/[_-]+/g, " ");
  const aliases: Record<string, string> = {
    founded: "founded",
    "founded year": "founded",
    "year founded": "founded",
    students: "students",
    "students count": "students",
    "student count": "students",
    "international students": "international students",
    ranking: "national ranking",
    "national ranking": "national ranking",
    tuition: "tuition",
    "tuition from": "tuition",
    language: "languages",
    languages: "languages",
    "languages offered": "languages",
    level: "levels",
    levels: "levels",
    field: "fields",
    fields: "fields",
    accreditation: "accreditations",
    accreditations: "accreditations",
    scholarship: "scholarships",
    scholarships: "scholarships",
    website: "website",
    type: "type",
    city: "city",
    country: "country",
  };
  return aliases[key] || key;
}

function positive(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.trunc(value) : undefined;
}

function textList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function factPairs(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const pairs: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item !== "string" && typeof item !== "number") continue;
    const label = key.trim();
    const text = String(item).trim();
    if (label && text) pairs[label] = text;
  }
  return pairs;
}
