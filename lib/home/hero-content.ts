export const HERO_BUTTON_STYLES = ["solid", "outline"] as const;

export type HeroButtonStyle = (typeof HERO_BUTTON_STYLES)[number];

export type HeroButton = {
  label: string;
  href: string;
  style: HeroButtonStyle;
};

export type HeroSlideContent = {
  backgroundImage: string;
  imageAlt: string;
  title: string;
  description: string;
  buttons: HeroButton[];
  showTrustPoints: boolean;
  status: "draft" | "published";
};

export type AdminHeroSlide = HeroSlideContent & {
  id: string;
  order: number;
};

export type PublicHeroSlide = {
  id: string;
  backgroundImage: string;
  imageAlt: string;
  title: string;
  description: string;
  buttons: HeroButton[];
  showTrustPoints: boolean;
};

/** The hero that shipped with the landing page, used until a slide is published. */
export const currentHeroContent: HeroSlideContent = {
  backgroundImage: "/home/imgGroup1.svg",
  imageAlt: "",
  title: "Your degree in Türkiye\nstarts here",
  description:
    "Compare universities, understand scholarships and get help with every step, from Pakistan to your first day on campus.",
  buttons: [
    { label: "Explore universities", href: "/universities", style: "solid" },
    { label: "Book free consultation", href: "/#book", style: "outline" },
  ],
  showTrustPoints: true,
  status: "published",
};

export const fallbackHeroSlides: PublicHeroSlide[] = [
  {
    id: "default-hero",
    backgroundImage: currentHeroContent.backgroundImage,
    imageAlt: currentHeroContent.imageAlt,
    title: currentHeroContent.title,
    description: currentHeroContent.description,
    buttons: currentHeroContent.buttons,
    showTrustPoints: true,
  },
];

export function isSafeHeroHref(value: string) {
  if (value.startsWith("#") && value.length > 1 && !/[\s\\]/.test(value)) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.includes("\n")) {
    return !value.split("?")[0].split("/").includes("..");
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function slideHeading(slide: { title?: string }) {
  const title = slide.title
    ?.split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  return title || "Image only";
}
