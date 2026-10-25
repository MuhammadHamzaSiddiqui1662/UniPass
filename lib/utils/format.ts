export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  // Assuming E.164 format: +92XXXXXXXXXX
  const cleaned = phone.replace(/^\+/, "");
  if (cleaned.startsWith("92")) {
    const rest = cleaned.substring(2);
    return `+92 ${rest.substring(0, 3)} ${rest.substring(3)}`;
  }
  return phone;
}

export function generateWhatsAppLink(phone: string, text?: string): string {
  const cleanedPhone = phone.replace(/\s/g, "").replace(/^\+/, "");
  const url = `https://wa.me/${cleanedPhone}`;
  if (text) {
    return `${url}?text=${encodeURIComponent(text)}`;
  }
  return url;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
