export function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item) => item != null && item !== "").map(String);
  if (typeof value === "string" && value.trim()) {
    return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item != null && item !== "")
      .map(([key, item]) => (typeof item === "string" || typeof item === "number" ? `${key}: ${item}` : key));
  }
  return [];
}

export function withUniversityDefaults<T extends Record<string, unknown>>(university: T) {
  const languages = stringList(university.languagesOffered);
  return {
    ...university,
    country: typeof university.country === "string" && university.country ? university.country : "Türkiye",
    countryCode:
      typeof university.countryCode === "string" && university.countryCode
        ? university.countryCode.toUpperCase()
        : "TR",
    scholarshipType:
      university.scholarshipType === "fully_funded" || university.scholarshipType === "partially_funded"
        ? university.scholarshipType
        : university.hasMeritScholarship
          ? "partially_funded"
          : "none",
    aliases: stringList(university.aliases),
    featuredOnHome: Boolean(university.featuredOnHome),
    homeOrder: Number(university.homeOrder) || 0,
    fields: stringList(university.fields),
    levels: stringList(university.levels),
    languages: languages.length ? languages : stringList(university.languages),
    languagesOffered: languages.length ? languages : stringList(university.languages),
    accreditations: stringList(university.accreditations),
    facilityHighlights: stringList(university.facilityHighlights),
    facts: stringList(university.facts),
  };
}
