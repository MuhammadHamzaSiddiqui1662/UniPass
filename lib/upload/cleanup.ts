import { getImageStorage } from "@/lib/upload/storage";

export function collectImageUrls(record: {
  logo?: string | null;
  featuredImage?: string | null;
  ogImage?: string | null;
  gallery?: Array<string | null> | null;
}) {
  return [record.logo, record.featuredImage, record.ogImage, ...(record.gallery || [])].filter(
    (url): url is string => Boolean(url),
  );
}

/** Drop hosted files that are no longer referenced. Failures are logged and never thrown. */
export async function releaseUnusedImages(before: Array<string | null | undefined>, after: Array<string | null | undefined>) {
  const keep = new Set(after.filter((url): url is string => Boolean(url)));
  const storage = getImageStorage();
  const seen = new Set<string>();
  for (const url of before) {
    if (!url || keep.has(url) || seen.has(url)) continue;
    seen.add(url);
    try {
      await storage.remove({ url });
    } catch (error) {
      console.warn("Image cleanup skipped:", error);
    }
  }
}
