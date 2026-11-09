import { z } from "zod";
import { isStoredImageReference } from "@/lib/upload/urls";

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

const imageReference = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => value === "" || isStoredImageReference(value), {
    message: "Image address must be an http(s) URL or a site path",
  });

export const universityImageSchema = z.object({
  logo: imageReference.optional().default(""),
  logoAlt: z.string().trim().max(300).optional().default(""),
  featuredImage: imageReference.optional().default(""),
  featuredImageAlt: z.string().trim().max(300).optional().default(""),
  gallery: z.array(imageReference).max(24).optional().default([]),
  galleryAlts: z.array(z.string().trim().max(300)).max(24).optional().default([]),
});

export type UniversityImageFields = {
  logo?: string;
  logoAlt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  gallery?: string[];
  galleryAlts?: string[];
};

export function parseUniversityImages(body: Record<string, unknown>, current?: UniversityImageFields) {
  const parsed = universityImageSchema.parse({
    logo: pick(body, "logo", current?.logo || ""),
    logoAlt: pick(body, "logoAlt", current?.logoAlt || ""),
    featuredImage: pick(body, "featuredImage", current?.featuredImage || ""),
    featuredImageAlt: pick(body, "featuredImageAlt", current?.featuredImageAlt || ""),
    gallery: pick(body, "gallery", current?.gallery || []),
    galleryAlts: pick(body, "galleryAlts", current?.galleryAlts || []),
  });
  const gallery = parsed.gallery
    .map((url, index) => ({ url, alt: parsed.galleryAlts[index] || "" }))
    .filter((item) => item.url);
  return {
    logo: parsed.logo,
    logoAlt: parsed.logoAlt,
    featuredImage: parsed.featuredImage,
    featuredImageAlt: parsed.featuredImageAlt,
    gallery: gallery.map((item) => item.url),
    galleryAlts: gallery.map((item) => item.alt),
  };
}

function pick(body: Record<string, unknown>, key: string, fallback: unknown) {
  return Object.prototype.hasOwnProperty.call(body, key) ? body[key] : fallback;
}

export function validationError(error: z.ZodError) {
  const issue = error.issues[0];
  return issue?.message || "Invalid university";
}
