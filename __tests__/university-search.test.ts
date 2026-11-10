import { fallbackUniversities } from "@/lib/universities/catalog";
import { searchUniversities, type UniversitySearchRecord } from "@/lib/universities/search";

function slugs(query: string, list: UniversitySearchRecord[] = fallbackUniversities) {
  return searchUniversities(list, query).items.map((university) => university.slug);
}

describe("searchUniversities", () => {
  test("matches a field of study", () => {
    const matches = slugs("engineering");
    expect(matches).toContain("istanbul-technical-university");
    expect(matches).not.toContain("hacettepe-university");
  });

  test("matches university type", () => {
    const matches = searchUniversities(fallbackUniversities, "public").items;
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((university) => university.type === "public")).toBe(true);
  });

  test("matches a scholarship label", () => {
    expect(slugs("fully funded")).toEqual(["bilkent-university"]);
  });

  test("matches tuition", () => {
    expect(slugs("1200")).toEqual(["istanbul-technical-university"]);
  });

  test("matches an alias", () => {
    const result = searchUniversities(fallbackUniversities, "BOUN");
    expect(result.items[0]?.slug).toBe("bogazici-university");
    expect(result.hint).toBeNull();
  });

  test("matches a small name typo", () => {
    const result = searchUniversities(fallbackUniversities, "bogazuci");
    expect(result.items[0]?.slug).toBe("bogazici-university");
    expect(result.hint).toContain("Boğaziçi University");
  });

  test("matches profile text without outranking the name", () => {
    const described: UniversitySearchRecord = {
      ...fallbackUniversities.find((university) => university.slug === "koc-university")!,
      description: "Students often compare the campus with Ankara.",
    };
    const ankara = fallbackUniversities.filter((university) => university.city === "Ankara");
    const result = searchUniversities([described, ...ankara], "Ankara");
    expect(result.items.at(-1)?.slug).toBe("koc-university");
    expect(result.items[0]?.city).toBe("Ankara");
    expect(result.hint).toBeNull();
  });

  test("ignores image urls, ids, and internal flags", () => {
    const record: UniversitySearchRecord = {
      ...fallbackUniversities[0],
      _id: "507f1f77bcf86cd799439011",
      featuredImage: "https://cdn.example.com/campus-hero-zz9.jpg",
      featuredOnHome: true,
      homeOrder: 42,
    };
    expect(slugs("507f1f77bcf86cd799439011", [record])).toEqual([]);
    expect(slugs("campus-hero-zz9", [record])).toEqual([]);
    expect(slugs("42", [record])).toEqual([]);
  });
});
