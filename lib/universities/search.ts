import {
  cityLabel,
  FILTER_TYPES,
  scholarshipLabel,
  type CatalogUniversity,
} from "@/lib/universities/catalog";
import { compact, fold, searchRecords, type SearchField } from "@/lib/search/text";

export { compact, fold };

export type UniversitySearchRecord = CatalogUniversity & {
  tuitionTo?: number;
  tuitionCurrency?: string;
  ranking?: number;
  intake?: string;
  languages?: string[];
  description?: string;
  whyChoose?: string;
  programsInfo?: string;
  campusLife?: string;
  turkiyeBurslariEligible?: boolean;
  foundedYear?: number;
  studentsCount?: number;
  internationalStudents?: number;
  accreditations?: string[];
  facilityHighlights?: string[];
  keyFacts?: string[];
  facts?: {
    type?: string;
    city?: string;
    tuitionFrom?: string;
    levels?: string;
    fields?: string;
    scholarships?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
};

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

export function universitySearchFields(university: UniversitySearchRecord): SearchField[] {
  const typeLabel = FILTER_TYPES.find((type) => type.value === university.type)?.label;
  const facts = university.facts;
  return [
    ...fields("identity", [
      university.name,
      university.city,
      cityLabel(university.city),
      university.country,
      university.countryCode,
      university.slug.replace(/-/g, " "),
      ...university.aliases,
    ]),
    ...fields("detail", [
      university.type,
      typeLabel,
      ...university.fields,
      ...university.levels,
      scholarshipLabel(university.scholarshipType),
      university.scholarshipType.replace(/_/g, " "),
      university.hasMeritScholarship ? "merit scholarship" : undefined,
      university.turkiyeBurslariEligible ? "Turkiye Burslari" : undefined,
      university.tuitionFrom,
      university.tuitionTo,
      university.tuitionCurrency,
      ...(university.languages ?? []),
      university.intake,
      university.ranking,
      university.foundedYear,
      university.studentsCount,
      university.internationalStudents,
      university.description,
      university.whyChoose,
      university.programsInfo,
      university.campusLife,
      ...(university.accreditations ?? []),
      ...(university.facilityHighlights ?? []),
      ...(university.keyFacts ?? []),
      facts?.type,
      facts?.city,
      facts?.tuitionFrom,
      facts?.levels,
      facts?.fields,
      facts?.scholarships,
      university.metaTitle,
      university.metaDescription,
    ]),
  ];
}

export function searchUniversities<T extends UniversitySearchRecord>(list: T[], rawQuery: string) {
  return searchRecords(list, rawQuery, {
    fields: universitySearchFields,
    label: (university) => university.name,
  });
}
