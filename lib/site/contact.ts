/** Visible brand on the landing design (Figma frame “Köprü — Landing Desktop”). */
export const BRAND_NAME = "Köprü";

/** Existing site placeholder until a real number is configured. */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+92-XXX-XXXXXXX (PLACEHOLDER)";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@unipass.example.com";

export const OFFICE_ADDRESS = "Office address in Pakistan";

export function whatsappHref(number: string = WHATSAPP_NUMBER) {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 10) return "https://wa.me/PLACEHOLDER";
  return `https://wa.me/${digits}`;
}
