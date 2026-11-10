import { fallbackGuides } from "@/lib/guides/catalog";
import { searchPrograms, searchScholarships, searchSite } from "@/lib/search/site";
import { fallbackUniversities, type CatalogUniversity } from "@/lib/universities/catalog";

const emptyCatalog = {
  universities: fallbackUniversities,
  guides: fallbackGuides,
  programs: [],
  scholarships: [],
};

describe("searchSite", () => {
  test("returns no groups for a blank query", async () => {
    const result = await searchSite("   ", emptyCatalog);
    expect(result.groups).toEqual([]);
  });

  test("finds a university by name", async () => {
    const result = await searchSite("Istanbul Technical", emptyCatalog);
    const universities = result.groups.find((group) => group.key === "universities");
    expect(universities?.hits[0]).toMatchObject({
      title: "Istanbul Technical University",
      subtitle: "Istanbul",
      href: "/universities/istanbul-technical-university",
    });
  });

  test("finds a guide by title", async () => {
    const result = await searchSite("visa", emptyCatalog);
    const guides = result.groups.find((group) => group.key === "guides");
    expect(guides?.hits.some((hit) => hit.href === "/guides/turkey-student-visa-guide")).toBe(true);
  });

  test("ignores an image url and an internal id", async () => {
    const university: CatalogUniversity = {
      ...fallbackUniversities[0],
      _id: "507f1f77bcf86cd799439011",
      featuredImage: "https://cdn.example.com/campus-hero-zz9.jpg",
    };
    const result = await searchSite("campus-hero-zz9", {
      ...emptyCatalog,
      universities: [university],
      guides: [],
    });
    expect(result.groups).toEqual([]);
    const byId = await searchSite("507f1f77bcf86cd799439011", {
      ...emptyCatalog,
      universities: [university],
      guides: [],
    });
    expect(byId.groups).toEqual([]);
  });
});

describe("searchPrograms", () => {
  test("matches a program description and links to the program", () => {
    const hits = searchPrograms(
      [
        {
          slug: "computer-science",
          name: "Computer Science",
          level: "Bachelor's",
          field: "Engineering",
          language: "English",
          description: "Software and systems.",
          requirements: "Transcripts",
          universityName: "Istanbul Technical University",
        },
      ],
      "software",
    );
    expect(hits).toEqual([
      {
        id: "program:computer-science",
        title: "Computer Science",
        subtitle: "Bachelor's · Istanbul Technical University",
        href: "/programs/computer-science",
      },
    ]);
  });
});

describe("searchScholarships", () => {
  test("matches coverage and links to the scholarships page", () => {
    const hits = searchScholarships(
      [
        {
          slug: "turkiye-burslari",
          name: "Türkiye Bursları",
          type: "turkiye-burslari",
          coverage: ["Tuition", "Housing"],
          description: "The Turkish government scholarship.",
          criteria: "Marks and age limits",
        },
      ],
      "housing",
    );
    expect(hits).toEqual([
      {
        id: "scholarship:turkiye-burslari",
        title: "Türkiye Bursları",
        subtitle: "Tuition, Housing",
        href: "/scholarships",
      },
    ]);
  });

  test("matches the merit scholarship label", () => {
    const hits = searchScholarships(
      [
        {
          slug: "koc-merit",
          name: "Koç merit award",
          type: "university-merit",
          description: "A tuition reduction for strong marks.",
          amount: "50%",
        },
      ],
      "university merit",
    );
    expect(hits[0]?.href).toBe("/scholarships");
    expect(hits[0]?.title).toBe("Koç merit award");
  });
});
