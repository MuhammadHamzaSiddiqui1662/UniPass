export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

export type DetectedImage = {
  format: "jpeg" | "png" | "webp" | "svg";
  extension: "jpg" | "png" | "webp" | "svg";
  contentType: string;
  buffer: Buffer;
};

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function inspectImage(buffer: Buffer, options?: { allowSvg?: boolean }): DetectedImage {
  if (!buffer.length) {
    throw new ImageValidationError("The file is empty.");
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new ImageValidationError("File too large. Maximum size is 10MB.");
  }

  if (buffer.length >= PNG.length && buffer.subarray(0, PNG.length).equals(PNG)) {
    return { format: "png", extension: "png", contentType: "image/png", buffer };
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { format: "jpeg", extension: "jpg", contentType: "image/jpeg", buffer };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { format: "webp", extension: "webp", contentType: "image/webp", buffer };
  }
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "GIF8") {
    throw new ImageValidationError("Only JPEG, PNG, and WebP images are allowed.");
  }
  if (looksLikeSvg(buffer)) {
    if (!options?.allowSvg) {
      throw new ImageValidationError("SVG images are only allowed for a university logo.");
    }
    const sanitized = sanitizeSvg(buffer);
    return {
      format: "svg",
      extension: "svg",
      contentType: "image/svg+xml",
      buffer: sanitized,
    };
  }

  throw new ImageValidationError("Only JPEG, PNG, and WebP images are allowed.");
}

function looksLikeSvg(buffer: Buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 512)).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  if (!sample.startsWith("<")) return false;
  const head = sample.slice(0, 300).toLowerCase();
  return head.includes("<svg");
}

function sanitizeSvg(buffer: Buffer) {
  let text = buffer.toString("utf8").replace(/^\uFEFF/, "");
  if (text.length > 1_500_000) {
    throw new ImageValidationError("SVG is too large.");
  }
  if (/<html[\s>]/i.test(text)) {
    throw new ImageValidationError("This SVG could not be made safe and was rejected.");
  }

  text = text.replace(/<!--[\s\S]*?-->/g, "");
  text = text.replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  text = text.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, "");
  text = text.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "");
  text = text.replace(/<object\b[\s\S]*?<\/object>/gi, "");
  text = text.replace(/<embed\b[\s\S]*?>/gi, "");
  text = text.replace(/<\s*\/?\s*(script|foreignObject|iframe|object|embed|handler)\b[^>]*>/gi, "");
  text = text.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  text = text.replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  text = text.replace(/\s+(?:xlink:href|href)\s*=\s*("([^"]*)"|'([^']*)')/gi, (full, _quoted, doubleQuoted, singleQuoted) => {
    const value = String(doubleQuoted ?? singleQuoted ?? "").trim();
    if (value.startsWith("#") && !value.toLowerCase().includes("script")) return full;
    return "";
  });

  const lower = text.toLowerCase();
  if (
    !/<svg[\s>]/i.test(text) ||
    lower.includes("<script") ||
    lower.includes("javascript:") ||
    lower.includes("foreignobject") ||
    lower.includes("<iframe") ||
    lower.includes("<embed") ||
    lower.includes("<object") ||
    lower.includes("data:text/html") ||
    /\son[a-z]+\s*=/.test(lower)
  ) {
    throw new ImageValidationError("This SVG could not be made safe and was rejected.");
  }

  return Buffer.from(text, "utf8");
}
