/**
 * Re-upload university images stored as /uploads/* and rewrite those fields.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.
 *
 *   npx tsx scripts/migrate-local-uploads-to-cloudinary.ts
 *
 * Reads .env.local and .env when the variables are not already set.
 * Local files are left in place.
 */
import { existsSync, readFileSync } from "fs";
import path from "path";

loadEnvFile(".env.local");
loadEnvFile(".env");

async function main() {
  const { connectDB, University } = await import("@/lib/db");
  const { folderFor, getImageStorage, imageProviderName, resolveUploadPath } = await import("@/lib/upload/storage");
  const { inspectImage } = await import("@/lib/upload/detect");
  const { readFile } = await import("fs/promises");

  if (imageProviderName() !== "cloudinary") {
    console.error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET, then run this again.");
    process.exitCode = 1;
    return;
  }

  await connectDB();
  const docs = await University.find({
    $or: [
      { logo: uploadMatch },
      { featuredImage: uploadMatch },
      { ogImage: uploadMatch },
      { gallery: uploadMatch },
    ],
  }).lean();

  if (!docs.length) {
    console.log("No local /uploads/ images found on universities.");
    return;
  }

  const storage = getImageStorage();
  let updated = 0;
  let failed = 0;

  for (const doc of docs) {
    try {
      const folder = folderFor("gallery", doc.slug);
      const logo = await rehost(doc.logo, folder);
      const featuredImage = await rehost(doc.featuredImage, folder);
      const ogImage = await rehost(doc.ogImage, folder);
      const gallery = await Promise.all((doc.gallery || []).map((url) => rehost(url, folder)));
      const $set: Record<string, unknown> = {};
      if (logo !== doc.logo) $set.logo = logo || "";
      if (featuredImage !== doc.featuredImage) $set.featuredImage = featuredImage || "";
      if (ogImage !== doc.ogImage) $set.ogImage = ogImage || "";
      if (gallery.some((url, index) => url !== doc.gallery?.[index])) $set.gallery = gallery;
      if (Object.keys($set).length) {
        await University.updateOne({ _id: doc._id }, { $set });
      }
      updated += 1;
      console.log(`Updated ${doc.slug}`);
    } catch (error) {
      failed += 1;
      console.error(`Skipped ${doc.slug}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`Rewrote ${updated} universities. ${failed} failed.`);
  if (failed) process.exitCode = 1;

  async function rehost(url: string | undefined, folder: string) {
    const localPath = uploadPath(url);
    if (!url || !localPath) return url;
    const full = resolveUploadPath(localPath);
    if (!full) throw new Error(`Refusing to read ${url}`);
    const detected = inspectImage(await readFile(full), { allowSvg: true });
    const stored = await storage.upload({
      buffer: detected.buffer,
      contentType: detected.contentType,
      extension: detected.extension,
      folder,
    });
    return stored.url;
  }
}

const uploadMatch = { $regex: /\/uploads\// };

function uploadPath(url: string | undefined) {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return url.split("?")[0];
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/uploads/")) return parsed.pathname;
  } catch {
    return null;
  }
  return null;
}

function loadEnvFile(file: string) {
  const full = path.resolve(file);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

main()
  .then(() => process.exit(process.exitCode || 0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
