// Taxonomy seeding: migrate from constants to database
import { connectDB, Taxonomy } from "@/lib/db";
import {
  CITIES_IN_PAKISTAN,
  CITIES_IN_TURKIYE,
  STUDY_FIELDS,
  STUDY_LEVELS,
  BEST_TIME_OPTIONS,
} from "./utils/constants";

export async function seedTaxonomies() {
  await connectDB();

  const taxonomies = [
    ...CITIES_IN_PAKISTAN.map((city, i) => ({
      type: "pakistani_city",
      value: city,
      label: city,
      order: i,
      active: true,
    })),
    ...CITIES_IN_TURKIYE.map((city, i) => ({
      type: "turkish_city",
      value: city,
      label: city,
      order: i,
      active: true,
    })),
    ...STUDY_FIELDS.map((field, i) => ({
      type: "study_field",
      value: field,
      label: field,
      order: i,
      active: true,
    })),
    ...STUDY_LEVELS.map((level, i) => ({
      type: "study_level",
      value: level,
      label: level,
      order: i,
      active: true,
    })),
    ...BEST_TIME_OPTIONS.map((opt, i) => ({
      type: "best_time" as const,
      value: opt,
      label: opt,
      order: i,
      active: true,
    })),
  ];

  for (const tax of taxonomies) {
    try {
      await Taxonomy.findOneAndUpdate(
        { type: tax.type, value: tax.value },
        tax,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.log(`Taxonomy ${tax.type}:${tax.value} already exists`);
    }
  }

  console.log("✅ Taxonomies seeded");
}
