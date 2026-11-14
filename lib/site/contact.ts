import { formatPhoneNumber } from "@/lib/utils/format";

export const BRAND_NAME = "UniPass";

export type PublicSocials = {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
};

export type PublicContact = {
  brandName: string;
  tagline: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  officeAddress: string;
  officeHours: string;
  socials: PublicSocials;
  metaTitle: string;
  metaDescription: string;
};

const EMPTY_SOCIALS: PublicSocials = {
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  youtube: "",
};

/** Used when settings are missing or still the seeded placeholder. */
export const PUBLIC_CONTACT_FALLBACK: PublicContact = {
  brandName: BRAND_NAME,
  tagline:
    "Advisors for students applying to universities in Türkiye. UniPass is your bridge to Turkish education.",
  whatsappNumber: "",
  phone: "",
  email: "hello@unipass.example.com",
  officeAddress: "Office address in Pakistan",
  officeHours: "Monday - Friday: 9:00 AM - 6:00 PM (PKT)\nSaturday: 10:00 AM - 4:00 PM (PKT)\nSunday: Closed",
  socials: EMPTY_SOCIALS,
  metaTitle: "UniPass | Study in Türkiye from Pakistan",
  metaDescription:
    "Expert guidance for Pakistani students applying to Turkish universities. Free consultation, scholarship info, and full application support.",
};

/** Hide seeded placeholder copy. A real saved value is returned as entered. */
export function visibleContactText(value: string | undefined, fallback: string) {
  const text = value?.trim() || "";
  if (!text || /placeholder/i.test(text)) return fallback;
  return text;
}

/** Only http(s) links from settings are published. */
export function publicUrl(value: string | undefined) {
  const text = value?.trim() || "";
  return /^https?:\/\//i.test(text) ? text : "";
}

export function whatsappDigits(number: string = "") {
  return number.replace(/\D/g, "");
}

/** Readable international number, or null while the saved value is still a placeholder. */
export function whatsappDisplayNumber(number: string = "") {
  const digits = whatsappDigits(number);
  if (digits.length < 10) return null;
  return formatPhoneNumber(`+${digits}`);
}

export function whatsappHref(number: string = "") {
  const digits = whatsappDigits(number);
  if (digits.length < 10) return "https://wa.me/PLACEHOLDER";
  return `https://wa.me/${digits}`;
}
