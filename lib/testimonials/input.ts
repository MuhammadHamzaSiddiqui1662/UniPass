import { isStoredImageReference } from "@/lib/upload/urls";

export type TestimonialWriteInput = {
  studentName: string;
  initials: string;
  quote: string;
  origin: string;
  university: string;
  image: string;
  imageAlt: string;
  verified: boolean;
  order: number;
  status: "draft" | "published";
};

export function parseTestimonialWrite(
  body: unknown,
): { ok: true; data: TestimonialWriteInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid testimonial" };
  const input = body as Record<string, unknown>;
  const studentName = text(input.studentName, 80);
  const origin = text(input.origin, 80);
  const university = text(input.university, 120);
  const quote = clip(input.quote, 800);
  const initials = normalizeInitials(input.initials, studentName);
  if (!studentName) return { ok: false, error: "Student name is required" };
  if (!initials) return { ok: false, error: "Add one or two initials" };
  if (!origin) return { ok: false, error: "Origin is required" };
  if (!university) return { ok: false, error: "University is required" };
  if (!quote) return { ok: false, error: "Quote is required" };
  const image = optionalImage(input.image);
  if (image === null) return { ok: false, error: "Use an uploaded image or an image URL" };
  const status = input.status === "published" ? "published" : input.status === "draft" ? "draft" : "";
  if (!status) return { ok: false, error: "Choose draft or published" };

  return {
    ok: true,
    data: {
      studentName,
      initials,
      quote,
      origin,
      university,
      image,
      imageAlt: image ? text(input.imageAlt, 200) : "",
      verified: input.verified === true,
      order: clampInt(input.order, -1000, 10000, 0),
      status,
    },
  };
}

export function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0] || "");
  return letters.join("").toUpperCase().slice(0, 2);
}

function normalizeInitials(value: unknown, name: string) {
  const raw = typeof value === "string" ? value : "";
  const cleaned = raw.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
  return cleaned || initialsFromName(name);
}

function optionalImage(value: unknown) {
  if (value == null) return "";
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url) return "";
  return isStoredImageReference(url) ? url : null;
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
