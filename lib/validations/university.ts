import { z } from "zod";

const countryCode = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{2}$/, "Country code must be two letters")
  .transform((value) => value.toUpperCase());

export const universityFieldsSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can use lowercase letters, numbers, and hyphens"),
  type: z.enum(["public", "private"]),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(2).default("Türkiye"),
  countryCode: countryCode.default("TR"),
  scholarshipType: z.enum(["fully_funded", "partially_funded", "none"]).default("none"),
  aliases: z.array(z.string().trim().min(1)).default([]),
  featuredOnHome: z.boolean().default(false),
  homeOrder: z.number().int().default(0),
  tuitionFrom: z.number().nonnegative(),
  description: z.string().trim().min(1, "Description is required"),
  fields: z.array(z.string()).default([]),
  levels: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  hasMeritScholarship: z.boolean().default(false),
  status: z.enum(["draft", "published"]),
});

export function validationError(error: z.ZodError) {
  const issue = error.issues[0];
  return issue?.message || "Invalid university";
}
