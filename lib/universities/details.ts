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

function school(
  partial: Omit<DetailUniversity, "description" | "whyChoose" | "programsInfo" | "campusLife"> &
    Partial<Pick<DetailUniversity, "description" | "whyChoose" | "programsInfo" | "campusLife">>,
): DetailUniversity {
  return {
    description: about,
    whyChoose: why,
    programsInfo: programs,
    campusLife: campus,
    ...partial,
  };
}

export const detailFallbacks: DetailUniversity[] = [
  school({
    slug: "istanbul-technical-university",
    name: "Istanbul Technical University",
    type: "public",
    city: "Istanbul",
    tuitionFrom: 1200,
    fields: ["Engineering", "Architecture", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    turkiyeBurslariEligible: true,
    hasMeritScholarship: false,
  }),
  school({
    slug: "middle-east-technical-university",
    name: "Middle East Technical University",
    type: "public",
    city: "Ankara",
    tuitionFrom: 1500,
    fields: ["Engineering", "Sciences", "Architecture"],
    levels: ["Bachelor's", "Master's", "PhD"],
    turkiyeBurslariEligible: true,
    hasMeritScholarship: false,
  }),
  school({
    slug: "bogazici-university",
    name: "Boğaziçi University",
    type: "public",
    city: "Istanbul",
    tuitionFrom: 1800,
    fields: ["Engineering", "Sciences", "Business"],
    levels: ["Bachelor's", "Master's", "PhD"],
    turkiyeBurslariEligible: true,
    hasMeritScholarship: false,
  }),
  school({
    slug: "hacettepe-university",
    name: "Hacettepe University",
    type: "public",
    city: "Ankara",
    tuitionFrom: 800,
    fields: ["Medicine and Health", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    turkiyeBurslariEligible: true,
    hasMeritScholarship: false,
  }),
  school({
    slug: "ege-university",
    name: "Ege University",
    type: "public",
    city: "Izmir",
    tuitionFrom: 700,
    fields: ["Engineering", "Medicine and Health"],
    levels: ["Bachelor's", "Master's", "PhD"],
    turkiyeBurslariEligible: true,
    hasMeritScholarship: false,
  }),
  school({
    slug: "bahcesehir-university",
    name: "Bahçeşehir University",
    type: "private",
    city: "Istanbul",
    tuitionFrom: 8000,
    fields: ["Business", "Engineering", "Architecture"],
    levels: ["Bachelor's", "Master's"],
    turkiyeBurslariEligible: false,
    hasMeritScholarship: true,
  }),
  school({
    slug: "bilkent-university",
    name: "Bilkent University",
    type: "private",
    city: "Ankara",
    tuitionFrom: 14000,
    fields: ["Business", "Engineering", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    turkiyeBurslariEligible: false,
    hasMeritScholarship: true,
  }),
  school({
    slug: "koc-university",
    name: "Koç University",
    type: "private",
    city: "Istanbul",
    tuitionFrom: 20000,
    fields: ["Engineering", "Business", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    turkiyeBurslariEligible: false,
    hasMeritScholarship: true,
  }),
];

export function fallbackDetail(slug: string) {
  return detailFallbacks.find((university) => university.slug === slug) || null;
}

export function scholarshipLabel(university: Pick<DetailUniversity, "turkiyeBurslariEligible" | "hasMeritScholarship">) {
  if (university.turkiyeBurslariEligible) return "Eligible for Türkiye Bursları";
  if (university.hasMeritScholarship) return "Merit scholarships available";
  return "Ask an advisor which scholarships fit";
}
