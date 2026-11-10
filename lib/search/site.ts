import { connectDB, Guide, Program, Scholarship, University } from "@/lib/db";
import { fallbackGuides, type GuideArticle } from "@/lib/guides/catalog";
import { searchRecords, type SearchField } from "@/lib/search/text";
import { fallbackUniversities, cityLabel } from "@/lib/universities/catalog";
import { searchUniversities, type UniversitySearchRecord } from "@/lib/universities/search";

const LIMIT = 5;

export type SiteSearchHit = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export type SiteSearchGroup = {
  key: "universities" | "guides" | "programs" | "scholarships";
  label: string;
  hits: SiteSearchHit[];
};

export type SiteSearchResult = {
  groups: SiteSearchGroup[];
};

export type ProgramSearchRecord = {
  slug: string;
  name: string;
  level: string;
  field: string;
  language?: string;
  description?: string;
  requirements?: string;
  universityName?: string;
};

export type ScholarshipSearchRecord = {
  slug: string;
  name: string;
  type: "turkiye-burslari" | "university-merit" | "other";
  coverage?: string[];
  criteria?: string;
  description?: string;
  amount?: string;
  eligibilityLevel?: string;
};

export type SiteCatalog = {
  universities: UniversitySearchRecord[];
  guides: GuideArticle[];
  programs: ProgramSearchRecord[];
  scholarships: ScholarshipSearchRecord[];
};

const SCHOLARSHIP_TYPE_LABELS: Record<ScholarshipSearchRecord["type"], string> = {
  "turkiye-burslari": "Türkiye Bursları",
  "university-merit": "University merit",
  other: "Other",
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("database timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function plain(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function text(value: string | number | undefined | null | false) {
  if (value === undefined || value === null || value === false) return [];
  const next = String(value).trim();
  return next ? [next] : [];
}

function fields(
  weight: SearchField["weight"],
  values: Array<string | number | undefined | null | false>,
): SearchField[] {
  return values.flatMap((value) => text(value).map((item) => ({ value: item, weight })));
}

function take(hits: SiteSearchHit[]) {
  return hits.slice(0, LIMIT);
}

function scholarshipTypeLabel(type: ScholarshipSearchRecord["type"]) {
  return SCHOLARSHIP_TYPE_LABELS[type] ?? type;
}

function scholarshipSubtitle(item: ScholarshipSearchRecord) {
  if (item.coverage?.length) return item.coverage.join(", ");
  if (item.amount?.trim()) return item.amount.trim();
  return scholarshipTypeLabel(item.type);
}

export function searchGuides(list: GuideArticle[], rawQuery: string) {
  if (!rawQuery.trim()) return [];
  return take(
    searchRecords(list, rawQuery, {
      label: (guide) => guide.title,
      fields: (guide) => [
        ...fields("identity", [guide.title, guide.slug.replace(/-/g, " "), guide.category]),
        ...fields("detail", [guide.description, plain(guide.content || "")]),
      ],
    }).items.map((guide) => ({
      id: `guide:${guide.slug}`,
      title: guide.title,
      subtitle: guide.category,
      href: `/guides/${guide.slug}`,
    })),
  );
}

export function searchPrograms(list: ProgramSearchRecord[], rawQuery: string) {
  if (!rawQuery.trim()) return [];
  return take(
    searchRecords(list, rawQuery, {
      label: (program) => program.name,
      fields: (program) => [
        ...fields("identity", [program.name, program.slug.replace(/-/g, " "), program.level, program.field]),
        ...fields("detail", [program.description, program.requirements, program.language, program.universityName]),
      ],
    }).items.map((program) => ({
      id: `program:${program.slug}`,
      title: program.name,
      subtitle: program.universityName ? `${program.level} · ${program.universityName}` : program.level,
      href: `/programs/${program.slug}`,
    })),
  );
}

export function searchScholarships(list: ScholarshipSearchRecord[], rawQuery: string) {
  if (!rawQuery.trim()) return [];
  return take(
    searchRecords(list, rawQuery, {
      label: (item) => item.name,
      fields: (item) => [
        ...fields("identity", [item.name, item.slug.replace(/-/g, " "), scholarshipTypeLabel(item.type)]),
        ...fields("detail", [
          item.description,
          item.criteria,
          item.amount,
          item.eligibilityLevel,
          ...(item.coverage ?? []),
        ]),
      ],
    }).items.map((item) => ({
      id: `scholarship:${item.slug}`,
      title: item.name,
      subtitle: scholarshipSubtitle(item),
      href: "/scholarships",
    })),
  );
}

function universityHits(list: UniversitySearchRecord[], rawQuery: string) {
  if (!rawQuery.trim()) return [];
  return take(
    searchUniversities(list, rawQuery).items.map((university) => ({
      id: `university:${university.slug}`,
      title: university.name,
      subtitle: cityLabel(university.city),
      href: `/universities/${university.slug}`,
    })),
  );
}

function group(key: SiteSearchGroup["key"], label: string, hits: SiteSearchHit[]): SiteSearchGroup | null {
  if (!hits.length) return null;
  return { key, label, hits };
}

export async function searchSite(rawQuery: string, catalog?: SiteCatalog): Promise<SiteSearchResult> {
  const query = rawQuery.trim();
  if (!query) return { groups: [] };
  const source = catalog ?? (await loadCatalog());
  const groups = [
    group("universities", "Universities", universityHits(source.universities, query)),
    group("guides", "Guides", searchGuides(source.guides, query)),
    group("programs", "Programs", searchPrograms(source.programs, query)),
    group("scholarships", "Scholarships", searchScholarships(source.scholarships, query)),
  ].filter((item): item is SiteSearchGroup => Boolean(item));
  return { groups };
}

async function loadCatalog(): Promise<SiteCatalog> {
  const [universities, guides, programs, scholarships] = await Promise.all([
    loadUniversities(),
    loadGuides(),
    loadPrograms(),
    loadScholarships(),
  ]);
  return { universities, guides, programs, scholarships };
}

async function loadUniversities(): Promise<UniversitySearchRecord[]> {
  try {
    await withTimeout(connectDB(), 2500);
    const docs = await withTimeout(University.find({ status: "published" }).lean(), 2500);
    if (!docs.length) return fallbackUniversities;
    return docs.map((university) => ({
      _id: String(university._id),
      slug: university.slug,
      name: university.name,
      type: university.type,
      city: university.city,
      country: university.country || "Türkiye",
      countryCode: university.countryCode || "TR",
      scholarshipType:
        university.scholarshipType || (university.hasMeritScholarship ? "partially_funded" : "none"),
      aliases: university.aliases ?? [],
      featuredOnHome: Boolean(university.featuredOnHome),
      homeOrder: university.homeOrder ?? 0,
      fields: university.fields ?? [],
      levels: university.levels ?? [],
      tuitionFrom: university.tuitionFrom,
      tuitionTo: university.tuitionTo,
      tuitionCurrency: university.tuitionCurrency,
      ranking: university.ranking,
      intake: university.intake,
      languages: university.languages ?? [],
      description: university.description,
      whyChoose: university.whyChoose,
      programsInfo: university.programsInfo,
      campusLife: university.campusLife,
      hasMeritScholarship: Boolean(university.hasMeritScholarship),
      turkiyeBurslariEligible: Boolean(university.turkiyeBurslariEligible),
      foundedYear: university.foundedYear,
      studentsCount: university.studentsCount,
      internationalStudents: university.internationalStudents,
      accreditations: university.accreditations ?? [],
      facilityHighlights: university.facilityHighlights ?? [],
      keyFacts: university.keyFacts ?? [],
      facts: university.facts,
      metaTitle: university.metaTitle,
      metaDescription: university.metaDescription,
      featuredImage: university.featuredImage,
      featuredImageAlt: university.featuredImageAlt,
    }));
  } catch (error) {
    console.error("Failed to search universities:", error);
    return fallbackUniversities;
  }
}

async function loadGuides(): Promise<GuideArticle[]> {
  try {
    await withTimeout(connectDB(), 2500);
    const docs = await withTimeout(
      Guide.find({ status: "published" }).sort({ featured: -1, order: 1, createdAt: -1 }).lean(),
      2500,
    );
    if (!docs.length) return fallbackGuides;
    return docs.map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      category: guide.category,
      description: guide.description,
      readTime: guide.readTime,
      featured: Boolean(guide.featured),
      content: guide.content,
      createdAt: guide.createdAt ? new Date(guide.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to search guides:", error);
    return fallbackGuides;
  }
}

async function loadPrograms(): Promise<ProgramSearchRecord[]> {
  try {
    await withTimeout(connectDB(), 2500);
    const docs = await withTimeout(
      Program.find({ status: "published" }).populate("university", "name").lean(),
      2500,
    );
    return docs.map((program) => ({
      slug: program.slug,
      name: program.name,
      level: program.level,
      field: program.field,
      language: program.language,
      description: program.description,
      requirements: program.requirements,
      universityName: universityName(program.university),
    }));
  } catch (error) {
    console.error("Failed to search programs:", error);
    return [];
  }
}

async function loadScholarships(): Promise<ScholarshipSearchRecord[]> {
  try {
    await withTimeout(connectDB(), 2500);
    const docs = await withTimeout(Scholarship.find({ status: "published" }).lean(), 2500);
    return docs.map((item) => ({
      slug: item.slug,
      name: item.name,
      type: item.type,
      coverage: item.coverage ?? [],
      criteria: item.criteria,
      description: item.description,
      amount: item.amount,
      eligibilityLevel: item.eligibility?.level,
    }));
  } catch (error) {
    console.error("Failed to search scholarships:", error);
    return [];
  }
}

function universityName(value: unknown) {
  if (value && typeof value === "object" && "name" in value && typeof value.name === "string") {
    return value.name;
  }
  return undefined;
}
