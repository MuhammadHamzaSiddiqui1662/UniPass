import { storeImageFile, type ImageKind } from "@/lib/upload/ingest";

export async function uploadImage(file: File, options?: { kind?: ImageKind; slug?: string }): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storeImageFile({
    buffer,
    kind: options?.kind || "photo",
    slug: options?.slug,
  });
  return stored.url;
}
