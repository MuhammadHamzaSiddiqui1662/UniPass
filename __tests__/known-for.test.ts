import { cardKnownFor, sanitizeKnownFor } from "@/lib/universities/known-for";
import { universityFieldsSchema } from "@/lib/validations/university";

const fields = ["Engineering", "Medicine", "Law", "Business"];

describe("cardKnownFor", () => {
  test("uses the saved highlights in the order they were chosen", () => {
    expect(cardKnownFor(fields, ["Law", "Engineering"])).toEqual(["Law", "Engineering"]);
  });

  test("drops unknown names, duplicates, and anything past three", () => {
    expect(cardKnownFor(fields, ["Law", "Law", "Art", "Engineering", "Medicine", "Business"])).toEqual([
      "Law",
      "Engineering",
      "Medicine",
    ]);
  });

  test("falls back to the first three fields when nothing is chosen", () => {
    expect(cardKnownFor(fields, [])).toEqual(["Engineering", "Medicine", "Law"]);
    expect(cardKnownFor(fields)).toEqual(["Engineering", "Medicine", "Law"]);
  });
});

describe("sanitizeKnownFor", () => {
  test("keeps an empty choice empty so the card can apply its own fallback", () => {
    expect(sanitizeKnownFor(fields, [])).toEqual([]);
    expect(sanitizeKnownFor(fields, ["Art"])).toEqual([]);
  });

  test("saved university highlights must belong to the selected fields", () => {
    const parsed = universityFieldsSchema.parse({
      name: "Ege University",
      slug: "ege-university",
      type: "public",
      city: "Izmir",
      tuitionFrom: 700,
      description: "A university",
      fields: ["Engineering", "Medicine"],
      knownFor: ["Medicine", "Law", "Engineering", "Engineering"],
      levels: ["Bachelor's"],
      status: "published",
    });
    expect(parsed.knownFor).toEqual(["Medicine", "Engineering"]);
  });
});
