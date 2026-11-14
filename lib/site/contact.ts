import { formatPhoneNumber } from "@/lib/utils/format";

export const BRAND_NAME = "UniPass";

export type PublicContact = {
  whatsappNumber: string;
  email: string;
  officeAddress: string;
};

/** Used when settings are missing or still the seeded placeholder. */
export const PUBLIC_CONTACT_FALLBACK: PublicContact = {
  whatsappNumber: "",
  email: "hello@unipass.example.com",
  officeAddress: "Office address in Pakistan",
};

/** Hide seeded placeholder copy. A real saved value is returned as entered. */
export function visibleContactText(value: string | undefined, fallback: string) {
  const text = value?.trim() || "";
  if (!text || /placeholder/i.test(text)) return fallback;
  return text;
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
