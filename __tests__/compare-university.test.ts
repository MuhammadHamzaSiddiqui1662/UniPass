import { describe, expect, test } from "vitest";
import { COMPARE_ROWS, toCompareUniversity, visibleCompareRows } from "@/lib/universities/compare";

const rich = {
  _id: "abc",
  slug: "istanbul-technical-university",
  name: "Istanbul Technical University",
  type: "public",
  city: "Izmir",
  country: "Türkiye",
  tuitionFrom: 1200,
  tuitionTo: 2500,
  tuitionCurrency: "eur",
  website: "https://itu.edu.tr/",
  fields: ["Engineering", "Architecture"],
  knownFor: ["Architecture", "Law", "Engineering", "Engineering"],
  levels: ["Bachelor's"],
  languagesOffered: ["English", "Turkish"],
  hasMeritScholarship: true,
  scholarshipType: "partially_funded",
  turkiyeBurslariEligible: true,
  foundedYear: "1773",
  studentsCount: 37000,
  internationalStudents: 0,
  rankingNational: 2,
  accreditations: ["YÖK", "ABET"],
  facilityHighlights: ["Library", "Labs"],
  keyFacts: ["Research university"],
};

describe("toCompareUniversity", () => {
  test("keeps the comparison facts added to the university record", () => {
    const university = toCompareUniversity(rich);
    expect(university).toMatchObject({
      country: "Türkiye",
      city: "Izmir",
      tuitionFrom: 1200,
      tuitionTo: 2500,
      tuitionCurrency: "EUR",
      website: "https://itu.edu.tr/",
      knownFor: ["Architecture", "Engineering"],
      languages: ["English", "Turkish"],
      scholarshipType: "partially_funded",
      turkiyeBurslariEligible: true,
      foundedYear: 1773,
      studentsCount: 37000,
      internationalStudents: undefined,
      ranking: 2,
      accreditations: ["YÖK", "ABET"],
      facilityHighlights: ["Library", "Labs"],
      keyFacts: ["Research university"],
    });
  });

  test("drops a website that is not an http address and an unknown scholarship", () => {
    const university = toCompareUniversity({
      slug: "example",
      name: "Example",
      website: "javascript:alert(1)",
      scholarshipType: "full ride",
    });
    expect(university?.website).toBeUndefined();
    expect(university?.scholarshipType).toBe("none");
    expect(university?.tuitionCurrency).toBe("USD");
  });
});

describe("visibleCompareRows", () => {
  test("lists the facts a comparison can show", () => {
    expect(COMPARE_ROWS.map((row) => row.label)).toEqual([
      "Type",
      "Country",
      "City",
      "Founded",
      "National ranking",
      "Students",
      "International students",
      "Tuition (per year)",
      "Languages",
      "Known for",
      "Fields offered",
      "Levels",
      "Scholarship",
      "Merit scholarship",
      "Türkiye Bursları",
      "Accreditations",
      "Facility highlights",
      "Key facts",
      "Website",
    ]);
  });

  test("hides a fact only when every selected university is blank", () => {
    const filled = toCompareUniversity(rich);
    const sparse = toCompareUniversity({ slug: "other", name: "Other", type: "private", city: "Ankara" });
    const labels = visibleCompareRows([filled, sparse]).map((row) => row.label);
    expect(labels).toContain("Founded");
    expect(labels).toContain("Website");
    expect(labels).not.toContain("International students");
    expect(visibleCompareRows([sparse]).map((row) => row.label)).not.toContain("Founded");
    expect(visibleCompareRows([undefined]).map((row) => row.label)).toContain("Founded");
  });

  test("formats tuition in the stored currency", () => {
    const university = toCompareUniversity(rich);
    const tuition = COMPARE_ROWS.find((row) => row.label === "Tuition (per year)");
    expect(university && tuition?.value(university)).toBe("€1,200 – €2,500 a year");
    expect(university && COMPARE_ROWS.find((row) => row.label === "City")?.value(university)).toBe("İzmir");
    expect(university && COMPARE_ROWS.find((row) => row.label === "Website")?.href?.(university)).toBe(
      "https://itu.edu.tr/",
    );
  });
});
