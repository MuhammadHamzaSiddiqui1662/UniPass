export type CatalogUniversity = {
  _id?: string;
  slug: string;
  name: string;
  type: "public" | "private";
  city: string;
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

export const fallbackUniversities: CatalogUniversity[] = [
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

export const FILTER_CITIES = ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Other"];
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
  city?: string;
  field?: string;
  type?: string;
  level?: string;
  sort?: string;
  page?: string;
  cleared?: string;
};

export function hasActiveFilters(query: ListingQuery) {
  return Boolean(
    (query.city && query.city !== "all") ||
      (query.field && query.field !== "all") ||
      (query.type && query.type !== "all") ||
      (query.level && query.level !== "all"),
  );
}

export function filterCatalog(list: CatalogUniversity[], query: ListingQuery) {
  return list.filter((university) => {
    if (query.city && query.city !== "all" && university.city !== query.city) return false;
    if (query.type && query.type !== "all" && university.type !== query.type) return false;
    if (query.field && query.field !== "all" && !university.fields.includes(query.field)) {
      return false;
    }
    if (query.level && query.level !== "all" && !university.levels.includes(query.level)) {
      return false;
    }
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
