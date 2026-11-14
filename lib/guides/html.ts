import sanitizeHtml from "sanitize-html";

const COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i];

const STYLE_RULES: Record<string, RegExp[]> = {
  color: COLOR,
  "background-color": COLOR,
  "font-size": [/^\d{1,3}(?:\.\d+)?px$/],
  "text-align": [/^(?:left|center|right|justify)$/],
  "margin-inline-start": [/^\d{1,3}px$/],
  "margin-inline": [/^auto$/],
  "margin-top": [/^\d{1,2}px$/],
  "margin-left": [/^\d{1,3}px$/],
  width: [/^\d{1,4}(?:\.\d+)?(?:%|px)$/],
  "max-width": [/^100%$/],
  display: [/^(?:table|table-caption)$/],
  "caption-side": [/^bottom$/],
  "vertical-align": [/^(?:top|middle|bottom)$/],
};

const STYLE_TAGS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "blockquote", "li", "td", "th", "figure", "figcaption", "table", "col", "mark", "div"];

export function sanitizeGuideHtml(html: string): string {
  return sanitizeHtml(typeof html === "string" ? html : "", {
    allowedTags: [
      "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup",
      "blockquote", "code", "pre", "ul", "ol", "li",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col", "caption",
      "span", "mark", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "download", "name"],
      img: ["src", "alt", "title", "width", "height"],
      figure: ["data-align", "style"],
      figcaption: ["style"],
      span: ["style"],
      mark: ["style", "data-color"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      h5: ["style"],
      h6: ["style"],
      blockquote: ["style"],
      li: ["style"],
      td: ["colspan", "rowspan", "colwidth", "style"],
      th: ["colspan", "rowspan", "colwidth", "style"],
      table: ["style", "class"],
      col: ["style", "span"],
      colgroup: ["span"],
      div: ["class", "style"],
    },
    allowedClasses: {
      table: ["guide-rte-table", "e-rte-table"],
      div: ["tableWrapper"],
    },
    allowedStyles: Object.fromEntries(STYLE_TAGS.map((tag) => [tag, STYLE_RULES])),
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  }).trim();
}

export function guideHtmlHasBody(html: string): boolean {
  if (/<img\b/i.test(html)) return true;
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;/g, " ").trim().length > 0;
}

const IMAGE_URL = /^(?:https?:\/\/|\/(?!\/)).+/i;

export type GuideWriteInput = {
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  coverImage: string;
  readTime: number;
  featured: boolean;
  order: number;
  status: "draft" | "published";
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
};

export function parseGuideWrite(body: unknown): { ok: true; data: GuideWriteInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid guide" };
  const input = body as Record<string, unknown>;
  const title = text(input.title, 200);
  const slug = slugify(text(input.slug, 120));
  const category = text(input.category, 80);
  const description = clip(input.description, 2000);
  const content = sanitizeGuideHtml(typeof input.content === "string" ? input.content : "");
  if (!title) return { ok: false, error: "Title is required" };
  if (!slug) return { ok: false, error: "Slug is required" };
  if (!category) return { ok: false, error: "Category is required" };
  if (!description) return { ok: false, error: "Description is required" };
  if (!guideHtmlHasBody(content)) return { ok: false, error: "Write the guide before saving" };

  const cover = imageUrl(input.coverImage);
  if (typeof input.coverImage === "string" && input.coverImage.trim() && !cover) {
    return { ok: false, error: "Cover image must be an uploaded file or an http(s) URL" };
  }
  const requestedOg = imageUrl(input.ogImage);
  if (typeof input.ogImage === "string" && input.ogImage.trim() && !requestedOg) {
    return { ok: false, error: "Social image must be an uploaded file or an http(s) URL" };
  }

  const status = input.status === "published" ? "published" : input.status === "draft" ? "draft" : "";
  if (!status) return { ok: false, error: "Choose draft or published" };

  return {
    ok: true,
    data: {
      title,
      slug,
      category,
      description,
      content,
      coverImage: cover,
      readTime: clampInt(input.readTime, 1, 180, 5),
      featured: input.featured === true,
      order: clampInt(input.order, -1000, 10000, 0),
      status,
      metaTitle: text(input.metaTitle, 200),
      metaDescription: clip(input.metaDescription, 500),
      ogImage: requestedOg || cover,
    },
  };
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function imageUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (!url || url.length > 2000 || !IMAGE_URL.test(url)) return "";
  if (url.startsWith("/")) return url.startsWith("/uploads/") ? url : "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    return "";
  }
  return "";
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
