export type ScholarshipType = "fully_funded" | "partially_funded" | "none";

export type CatalogUniversity = {
  _id?: string;
  slug: string;
  name: string;
  type: "public" | "private";
  city: string;
  country: string;
  countryCode: string;
  scholarshipType: ScholarshipType;
  aliases: string[];
  featuredOnHome: boolean;
  homeOrder: number;
  fields: string[];
  levels: string[];
  tuitionFrom: number;
  hasMeritScholarship: boolean;
  featuredImage?: string;
};

/** Design order for the eight universities on the listing frame. */
export const DESIGN_ORDER = [
  "istanbul-technical-university",
  "middle-east-technical-university",
  "bogazici-university",
  "hacettepe-university",
  "ege-university",
  "bahcesehir-university",
  "bilkent-university",
  "koc-university",
];

const universitySeeds: Omit<
  CatalogUniversity,
  "country" | "countryCode" | "scholarshipType" | "aliases" | "featuredOnHome" | "homeOrder"
>[] = [
  {
    slug: "istanbul-technical-university",
    name: "Istanbul Technical University",
    type: "public",
    city: "Istanbul",
    fields: ["Engineering", "Architecture", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 1200,
    hasMeritScholarship: false,
  },
  {
    slug: "middle-east-technical-university",
    name: "Middle East Technical University",
    type: "public",
    city: "Ankara",
    fields: ["Engineering", "Sciences", "Architecture"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 1500,
    hasMeritScholarship: false,
  },
  {
    slug: "bogazici-university",
    name: "Boğaziçi University",
    type: "public",
    city: "Istanbul",
    fields: ["Engineering", "Sciences", "Business"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 1800,
    hasMeritScholarship: false,
  },
  {
    slug: "hacettepe-university",
    name: "Hacettepe University",
    type: "public",
    city: "Ankara",
    fields: ["Medicine and Health", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 800,
    hasMeritScholarship: false,
  },
  {
    slug: "ege-university",
    name: "Ege University",
    type: "public",
    city: "Izmir",
    fields: ["Engineering", "Medicine and Health"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 700,
    hasMeritScholarship: false,
  },
  {
    slug: "bahcesehir-university",
    name: "Bahçeşehir University",
    type: "private",
    city: "Istanbul",
    fields: ["Business", "Engineering", "Architecture"],
    levels: ["Bachelor's", "Master's"],
    tuitionFrom: 8000,
    hasMeritScholarship: true,
  },
  {
    slug: "bilkent-university",
    name: "Bilkent University",
    type: "private",
    city: "Ankara",
    fields: ["Business", "Engineering", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 14000,
    hasMeritScholarship: true,
  },
  {
    slug: "koc-university",
    name: "Koç University",
    type: "private",
    city: "Istanbul",
    fields: ["Engineering", "Business", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 20000,
    hasMeritScholarship: true,
  },
];

const HOME_SLUGS = [
  "istanbul-technical-university",
  "middle-east-technical-university",
  "bogazici-university",
];

const ALIASES: Record<string, string[]> = {
  "istanbul-technical-university": ["ITU", "Istanbul Teknik", "İstanbul Teknik Üniversitesi"],
  "middle-east-technical-university": ["METU", "ODTÜ", "ODTU", "Orta Doğu Teknik"],
  "bogazici-university": ["BOUN", "Boğaziçi", "Bogazici Universitesi"],
  "hacettepe-university": ["Hacettepe Universitesi"],
  "ege-university": ["Ege Universitesi"],
  "bahcesehir-university": ["BAU", "Bahcesehir", "Bahçeşehir Universitesi"],
  "bilkent-university": ["Bilkent Universitesi"],
  "koc-university": ["Koc", "Koç Universitesi"],
};

export const fallbackUniversities: CatalogUniversity[] = universitySeeds.map((university, index) => ({
  ...university,
  country: "Türkiye",
  countryCode: "TR",
  scholarshipType:
    university.slug === "bilkent-university"
      ? "fully_funded"
      : university.hasMeritScholarship
        ? "partially_funded"
        : "none",
  aliases: ALIASES[university.slug] ?? [],
  featuredOnHome: HOME_SLUGS.includes(university.slug),
  homeOrder: index + 1,
}));

export const FILTER_CITIES = ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Other"];
export const CITY_LABELS: Record<string, string> = { Izmir: "İzmir" };
export function cityLabel(city: string) {
  return CITY_LABELS[city] ?? city;
}
export const SCHOLARSHIP_FILTERS: { value: ScholarshipType; label: string }[] = [
  { value: "fully_funded", label: "Fully funded" },
  { value: "partially_funded", label: "Partially funded" },
];
export function scholarshipLabel(value: string) {
  return SCHOLARSHIP_FILTERS.find((item) => item.value === value)?.label ?? value;
}
export const FILTER_FIELDS = [
  "Engineering",
  "Architecture",
  "Sciences",
  "Business",
  "Medicine and Health",
];
export const FILTER_TYPES = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];
export const FILTER_LEVELS = ["Bachelor's", "Master's", "PhD"];

export type ListingQuery = {
  q?: string;
  city?: string;
  field?: string;
  type?: string;
  level?: string;
  country?: string | string[];
  scholarship?: string | string[];
  sort?: string;
  page?: string;
  cleared?: string;
};

export function asList(value?: string | string[]) {
  if (!value) return [];
  return (Array.isArray(value) ? value : value.split(","))
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasActiveFilters(query: ListingQuery) {
  return Boolean(
    query.q?.trim() ||
      (query.city && query.city !== "all") ||
      (query.field && query.field !== "all") ||
      (query.type && query.type !== "all") ||
      (query.level && query.level !== "all") ||
      asList(query.country).length ||
      asList(query.scholarship).length,
  );
}

export function filterCatalog(list: CatalogUniversity[], query: ListingQuery) {
  const countries = asList(query.country);
  const scholarships = asList(query.scholarship);
  return list.filter((university) => {
    if (query.city && query.city !== "all" && university.city !== query.city) return false;
    if (query.type && query.type !== "all" && university.type !== query.type) return false;
    if (query.field && query.field !== "all" && !university.fields.includes(query.field)) {
      return false;
    }
    if (query.level && query.level !== "all" && !university.levels.includes(query.level)) {
      return false;
    }
    if (
      countries.length &&
      !countries.includes(university.countryCode) &&
      !countries.includes(university.country)
    ) {
      return false;
    }
    if (scholarships.length && !scholarships.includes(university.scholarshipType)) return false;
    return true;
  });
}

export function sortCatalog(list: CatalogUniversity[], sort?: string) {
  const copy = [...list];
  if (sort === "tuition-low") {
    copy.sort((a, b) => a.tuitionFrom - b.tuitionFrom || a.name.localeCompare(b.name));
  } else if (sort === "tuition-high") {
    copy.sort((a, b) => b.tuitionFrom - a.tuitionFrom || a.name.localeCompare(b.name));
  } else if (sort === "name") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => {
      const ai = DESIGN_ORDER.indexOf(a.slug);
      const bi = DESIGN_ORDER.indexOf(b.slug);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }
  return copy;
}
