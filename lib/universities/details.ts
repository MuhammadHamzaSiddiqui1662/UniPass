import { fallbackUniversities } from "@/lib/universities/catalog";

export type DetailUniversity = {
  _id?: string;
  slug: string;
  name: string;
  type: "public" | "private";
  city: string;
  tuitionFrom: number;
  fields: string[];
  levels: string[];
  description: string;
  whyChoose: string;
  programsInfo: string;
  campusLife: string;
  turkiyeBurslariEligible: boolean;
  hasMeritScholarship: boolean;
  metaTitle?: string;
  metaDescription?: string;
};

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
}));

export function fallbackDetail(slug: string) {
  return detailFallbacks.find((university) => university.slug === slug) || null;
}

export function scholarshipLabel(
  university: Pick<DetailUniversity, "turkiyeBurslariEligible" | "hasMeritScholarship">,
) {
  if (university.turkiyeBurslariEligible) return "Eligible for Türkiye Bursları";
  if (university.hasMeritScholarship) return "Merit scholarships available";
  return "Ask an advisor which scholarships fit";
}
