import { lookup } from "dns/promises";
import { isIP } from "net";
import { ImageValidationError, MAX_IMAGE_BYTES, inspectImage } from "@/lib/upload/detect";
import { folderFor, getImageStorage, imageProviderName, type StoredImage } from "@/lib/upload/storage";
import { isStoredImageReference } from "@/lib/upload/urls";

export type ImageKind = "logo" | "featured" | "gallery" | "photo";

const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal", "metadata.internal"]);

export function normalizeKind(value: unknown): ImageKind {
  if (value === "logo" || value === "featured" || value === "gallery" || value === "photo") return value;
  return "photo";
}

export async function storeImageFile(input: {
  buffer: Buffer;
  kind: ImageKind;
  slug?: string;
}): Promise<StoredImage> {
  const detected = inspectImage(input.buffer, { allowSvg: input.kind === "logo" });
  return getImageStorage().upload({
    buffer: detected.buffer,
    contentType: detected.contentType,
    extension: detected.extension,
    folder: folderFor(input.kind, input.slug),
  });
}

export async function ingestImageUrl(input: {
  url: string;
  kind: ImageKind;
  slug?: string;
}): Promise<StoredImage> {
  const url = input.url.trim();
  if (!isStoredImageReference(url)) {
    throw new ImageValidationError("Enter an http(s) image URL or an uploaded path.");
  }

  const remote = url.startsWith("http://") || url.startsWith("https://");
  if (!remote || imageProviderName() !== "cloudinary") {
    return { url, provider: imageProviderName() };
  }

  const buffer = await downloadPublicImage(url);
  return storeImageFile({ buffer, kind: input.kind, slug: input.slug });
}

async function downloadPublicImage(start: string) {
  let current = start;
  const deadline = AbortSignal.timeout(12_000);
  for (let hop = 0; hop < 3; hop += 1) {
    await assertPublicHttpUrl(current);
    const response = await fetch(current, { redirect: "manual", signal: deadline });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new ImageValidationError("That image URL could not be downloaded.");
      current = new URL(location, current).toString();
      continue;
    }
    if (!response.ok) throw new ImageValidationError("That image URL could not be downloaded.");
    const advertised = Number(response.headers.get("content-length") || 0);
    if (advertised > MAX_IMAGE_BYTES) {
      throw new ImageValidationError("File too large. Maximum size is 10MB.");
    }
    return readLimited(response);
  }
  throw new ImageValidationError("That image URL redirected too many times.");
}

async function readLimited(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) throw new ImageValidationError("That image URL could not be downloaded.");
  const chunks: Buffer[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_IMAGE_BYTES) {
      await reader.cancel();
      throw new ImageValidationError("File too large. Maximum size is 10MB.");
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

async function assertPublicHttpUrl(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ImageValidationError("Enter an http(s) image URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ImageValidationError("Enter an http(s) image URL.");
  }
  if (parsed.username || parsed.password) {
    throw new ImageValidationError("That image URL cannot be fetched.");
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost")) {
    throw new ImageValidationError("That image URL cannot be fetched.");
  }
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new ImageValidationError("That image URL cannot be fetched.");
    return;
  }
  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    throw new ImageValidationError("That image URL could not be resolved.");
  }
  if (!addresses.length || addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new ImageValidationError("That image URL cannot be fetched.");
  }
}

function isPrivateIp(ip: string) {
  const version = isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  if (version === 6) {
    const normalized = ip.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80") ||
      normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:192.168.")
    );
  }
  return true;
}
