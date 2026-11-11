export type CompareUniversity = {
  _id: string;
  slug: string;
  name: string;
  type: string;
  city: string;
  tuitionFrom?: number;
  tuitionTo?: number;
  fields: string[];
  levels: string[];
  hasMeritScholarship: boolean;
};

export function toCompareUniversity(university: {
  _id?: unknown;
  slug?: string;
  name?: string;
  type?: string;
  city?: string;
  tuitionFrom?: number;
  tuitionTo?: number;
  fields?: string[];
  levels?: string[];
  hasMeritScholarship?: boolean;
}): CompareUniversity | null {
  const slug = university.slug?.trim();
  const name = university.name?.trim();
  if (!slug || !name) return null;
  const rawId = university._id == null ? "" : String(university._id).trim();
  return {
    _id: rawId || slug,
    slug,
    name,
    type: university.type || "",
    city: university.city || "",
    tuitionFrom: typeof university.tuitionFrom === "number" ? university.tuitionFrom : undefined,
    tuitionTo: typeof university.tuitionTo === "number" ? university.tuitionTo : undefined,
    fields: Array.isArray(university.fields) ? university.fields.filter((item) => typeof item === "string") : [],
    levels: Array.isArray(university.levels) ? university.levels.filter((item) => typeof item === "string") : [],
    hasMeritScholarship: Boolean(university.hasMeritScholarship),
  };
}
