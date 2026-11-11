import { z } from "zod";
import { isStoredImageReference } from "@/lib/upload/urls";
import {
  HERO_BUTTON_STYLES,
  isSafeHeroHref,
  type AdminHeroSlide,
  type PublicHeroSlide,
} from "@/lib/home/hero-content";

export {
  currentHeroContent,
  fallbackHeroSlides,
  slideHeading,
  type AdminHeroSlide,
  type HeroButton,
  type HeroSlideContent,
  type PublicHeroSlide,
} from "@/lib/home/hero-content";

const heroButtonSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Each button needs a label")
    .max(40, "Button labels can be up to 40 characters"),
  href: z
    .string()
    .trim()
    .min(1, "Each button needs a link")
    .max(500)
    .refine(isSafeHeroHref, "Button links must be a site path or an http(s) URL"),
  style: z.enum(HERO_BUTTON_STYLES).default("solid"),
});

export const heroSlideSchema = z.object({
  backgroundImage: z
    .string()
    .trim()
    .min(1, "A background image is required")
    .refine(isStoredImageReference, "Use an uploaded image or an image URL"),
  imageAlt: z.string().trim().max(200, "Alt text can be up to 200 characters").optional().default(""),
  title: z
    .string()
    .trim()
    .max(180, "The title can be up to 180 characters")
    .optional()
    .default("")
    .transform((value) => value.replace(/\r\n/g, "\n")),
  description: z
    .string()
    .trim()
    .max(500, "The description can be up to 500 characters")
    .optional()
    .default("")
    .transform((value) => value.replace(/\r\n/g, "\n")),
  buttons: z.array(heroButtonSchema).max(2, "A slide can have up to two buttons").optional().default([]),
  showTrustPoints: z.boolean().optional().default(false),
  status: z.enum(["draft", "published"]).optional().default("published"),
});

export type HeroSlideRecord = {
  _id: { toString(): string } | string;
  backgroundImage?: string | null;
  imageAlt?: string | null;
  title?: string | null;
  description?: string | null;
  buttons?: Array<{ label?: string | null; href?: string | null; style?: string | null }> | null;
  showTrustPoints?: boolean | null;
  status?: string | null;
  order?: number | null;
};

export function serializeHeroSlide(slide: HeroSlideRecord): AdminHeroSlide {
  return {
    id: String(slide._id),
    backgroundImage: slide.backgroundImage?.trim() || "",
    imageAlt: slide.imageAlt?.trim() || "",
    title: slide.title?.replace(/\r\n/g, "\n").trim() || "",
    description: slide.description?.replace(/\r\n/g, "\n").trim() || "",
    buttons: (slide.buttons || [])
      .filter((button) => button?.label?.trim() && button?.href?.trim())
      .slice(0, 2)
      .map((button) => ({
        label: String(button.label).trim(),
        href: String(button.href).trim(),
        style: button.style === "outline" ? "outline" : "solid",
      })),
    showTrustPoints: Boolean(slide.showTrustPoints),
    status: slide.status === "draft" ? "draft" : "published",
    order: typeof slide.order === "number" && Number.isFinite(slide.order) ? slide.order : 0,
  };
}

export function toPublicHeroSlide(slide: AdminHeroSlide): PublicHeroSlide {
  return {
    id: slide.id,
    backgroundImage: slide.backgroundImage,
    imageAlt: slide.imageAlt,
    title: slide.title,
    description: slide.description,
    buttons: slide.buttons,
    showTrustPoints: slide.showTrustPoints,
  };
}
