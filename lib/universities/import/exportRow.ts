import { IMPORT_COLUMNS } from "@/lib/universities/import/columns";

export function universityToCsvRow(university: Record<string, unknown>) {
  const facts = university.facts && typeof university.facts === "object" && !Array.isArray(university.facts)
    ? Object.entries(university.facts as Record<string, unknown>)
        .filter(([, value]) => value != null && value !== "")
        .map(([key, value]) => `${key}: ${value}`)
        .join("|")
    : "";
  const row: Record<string, string> = {};
  for (const column of IMPORT_COLUMNS) row[column.header] = "";
  row.name = text(university.name);
  row.slug = text(university.slug);
  row.type = text(university.type);
  row.city = text(university.city);
  row.country = text(university.country);
  row.countryCode = text(university.countryCode);
  row.scholarshipType = text(university.scholarshipType);
  row.fields = list(university.fields);
  row.levels = list(university.levels);
  row.languages = list(university.languages);
  row.tuitionFrom = university.tuitionFrom == null ? "" : String(university.tuitionFrom);
  row.tuitionTo = university.tuitionTo == null ? "" : String(university.tuitionTo);
  row.tuitionCurrency = text(university.tuitionCurrency);
  row.description = text(university.description);
  row.whyChoose = text(university.whyChoose);
  row.programsInfo = text(university.programsInfo);
  row.campusLife = text(university.campusLife);
  row.website = text(university.website);
  row.ranking = university.ranking == null ? "" : String(university.ranking);
  row.facts = facts;
  row.aliases = list(university.aliases);
  row.featuredOnHome = university.featuredOnHome ? "true" : "false";
  row.homeOrder = university.homeOrder == null ? "0" : String(university.homeOrder);
  row.hasMeritScholarship = university.hasMeritScholarship ? "true" : "false";
  row.published = university.status === "published" ? "true" : "false";
  row.logo = text(university.logo);
  row.featured_image = text(university.featuredImage);
  row.gallery = list(university.gallery);
  row.metaTitle = text(university.metaTitle);
  row.metaDescription = text(university.metaDescription);
  row.ogImage = text(university.ogImage);
  return row;
}

function text(value: unknown) {
  return value == null ? "" : String(value);
}

function list(value: unknown) {
  return Array.isArray(value) ? value.filter(Boolean).join("|") : "";
}
