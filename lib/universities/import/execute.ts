import { University } from "@/lib/db";
import { releaseUnusedImages } from "@/lib/upload/cleanup";
import { ImageValidationError } from "@/lib/upload/detect";
import { rehostRemoteImage, storeImageFile, type ImageKind } from "@/lib/upload/ingest";
import type { ImportKey } from "@/lib/universities/import/columns";
import { rowMessages, rowStatus, type PreviewRow } from "@/lib/universities/import/preview";
import type { ZipIndex } from "@/lib/universities/import/zip";

export type ImportOptions = {
  updateExisting: boolean;
  skipErrors: boolean;
};

export type ImportReportRow = {
  rowNumber: number;
  name: string;
  slug: string;
  status: string;
  messages: string;
};

export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  imageFailures: number;
  report: ImportReportRow[];
  slugs: string[];
};

export async function executeImport(
  rows: PreviewRow[],
  present: Set<ImportKey>,
  zip: ZipIndex,
  options: ImportOptions,
  onProgress?: (event: { completed: number; total: number; name: string }) => void,
): Promise<ImportResult> {
  const actionable = rows.filter((row) => shouldImport(row, options));
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, imageFailures: 0, report: [], slugs: [] };
  let completed = 0;

  for (const row of rows) {
    if (!shouldImport(row, options)) {
      result.skipped += 1;
      result.report.push({
        rowNumber: row.rowNumber,
        name: row.name,
        slug: row.slug,
        status: rowStatus(row, options.updateExisting),
        messages: rowMessages(row, options.updateExisting).join(" "),
      });
      continue;
    }

    const failures: string[] = [];
    const images = await placeImages(row, present, zip, failures);
    result.imageFailures += failures.length;
    const document = documentFor(row, present, images);
    try {
      if (row.match && options.updateExisting) {
        const current = await University.findById(row.match.id).lean();
        await University.updateOne({ _id: row.match.id }, { $set: document });
        if (current) {
          const before: Array<string | undefined> = [];
          const after: Array<string | undefined> = [];
          if (present.has("logo")) {
            before.push(current.logo);
            after.push(typeof document.logo === "string" ? document.logo : current.logo);
          }
          if (present.has("featuredImage")) {
            before.push(current.featuredImage);
            after.push(typeof document.featuredImage === "string" ? document.featuredImage : current.featuredImage);
          }
          if (present.has("ogImage")) {
            before.push(current.ogImage);
            after.push(typeof document.ogImage === "string" ? document.ogImage : current.ogImage);
          }
          if (present.has("gallery") && Array.isArray(document.gallery)) {
            before.push(...(current.gallery || []));
            after.push(...(document.gallery as string[]));
          }
          await releaseUnusedImages(before, after);
        }
        result.updated += 1;
      } else {
        await University.create(document);
        result.created += 1;
      }
      result.slugs.push(String(document.slug));
      if (row.match && row.match.slug !== document.slug) result.slugs.push(row.match.slug);
      if (failures.length) {
        result.report.push({
          rowNumber: row.rowNumber,
          name: row.name,
          slug: row.slug,
          status: "Imported with image problems",
          messages: failures.join(" "),
        });
      }
    } catch (error) {
      result.skipped += 1;
      result.report.push({
        rowNumber: row.rowNumber,
        name: row.name,
        slug: row.slug,
        status: "Error",
        messages: error instanceof Error ? error.message : "Could not save this row.",
      });
    }
    completed += 1;
    onProgress?.({ completed, total: actionable.length, name: row.name });
  }

  return result;
}

function shouldImport(row: PreviewRow, options: ImportOptions) {
  if (row.errors.length) return false;
  if (row.match && !options.updateExisting) return false;
  return true;
}

async function placeImages(row: PreviewRow, present: Set<ImportKey>, zip: ZipIndex, failures: string[]) {
  const slug = row.match && !present.has("slug") ? row.match.slug : row.values.slug;
  const logo = await one(row.values.logo, "logo", slug, present.has("logo"), zip, failures);
  const featuredImage = await one(row.values.featuredImage, "featured", slug, present.has("featuredImage"), zip, failures);
  const ogImage = await one(row.values.ogImage, "featured", slug, present.has("ogImage"), zip, failures);
  const gallery: Placed[] = [];
  if (present.has("gallery")) {
    for (const item of row.values.gallery) gallery.push(await one(item, "gallery", slug, true, zip, failures));
  }
  return { slug, logo, featuredImage, ogImage, gallery };
}

type Placed = { url: string } | { clear: true } | { keep: true };

async function one(
  value: string,
  kind: ImageKind,
  slug: string,
  active: boolean,
  zip: ZipIndex,
  failures: string[],
): Promise<Placed> {
  if (!active) return { keep: true };
  if (!value) return { clear: true };
  try {
    if (/^https?:\/\//i.test(value)) {
      const stored = await rehostRemoteImage({ url: value, kind, slug });
      return { url: stored.url };
    }
    if (value.startsWith("/")) return { url: value };
    const file = zip.get(value);
    if (!file) {
      failures.push(`${value} was not in the ZIP.`);
      return { keep: true };
    }
    const stored = await storeImageFile({ buffer: file, kind, slug });
    return { url: stored.url };
  } catch (error) {
    const message = error instanceof ImageValidationError || error instanceof Error ? error.message : "Image failed.";
    failures.push(`${value}: ${message}`);
    return { keep: true };
  }
}

function documentFor(
  row: PreviewRow,
  present: Set<ImportKey>,
  images: { slug: string; logo: Placed; featuredImage: Placed; ogImage: Placed; gallery: Placed[] },
) {
  const values = row.values;
  const document: Record<string, unknown> = { name: values.name, slug: images.slug };
  if (!row.match || present.has("type")) document.type = values.type;
  if (!row.match || present.has("city")) document.city = values.city;
  if (!row.match || present.has("description")) document.description = values.description;
  if (!row.match || present.has("tuitionFrom")) document.tuitionFrom = values.tuitionFrom ?? 0;
  const text: [ImportKey, string][] = [
    ["country", values.country],
    ["countryCode", values.countryCode],
    ["scholarshipType", values.scholarshipType],
    ["tuitionCurrency", values.tuitionCurrency],
    ["whyChoose", values.whyChoose],
    ["programsInfo", values.programsInfo],
    ["campusLife", values.campusLife],
    ["website", values.website],
    ["metaTitle", values.metaTitle],
    ["metaDescription", values.metaDescription],
  ];
  for (const [key, value] of text) if (present.has(key)) document[key] = value;
  if (present.has("fields")) document.fields = values.fields;
  if (present.has("levels")) document.levels = values.levels;
  if (present.has("languages")) document.languages = values.languages;
  if (present.has("aliases")) document.aliases = values.aliases;
  if (present.has("facts")) document.facts = values.facts;
  if (present.has("tuitionTo")) document.tuitionTo = values.tuitionTo ?? undefined;
  if (present.has("ranking")) document.ranking = values.ranking ?? undefined;
  if (present.has("featuredOnHome")) document.featuredOnHome = values.featuredOnHome;
  if (present.has("homeOrder")) document.homeOrder = values.homeOrder;
  if (present.has("hasMeritScholarship")) document.hasMeritScholarship = values.hasMeritScholarship;
  if (present.has("published")) document.status = values.status;
  assignImage(document, "logo", images.logo, present.has("logo"));
  assignImage(document, "featuredImage", images.featuredImage, present.has("featuredImage"));
  assignImage(document, "ogImage", images.ogImage, present.has("ogImage"));
  if (present.has("gallery")) {
    const urls = images.gallery.flatMap((item) => ("url" in item ? [item.url] : []));
    const failed = images.gallery.some((item) => "keep" in item);
    if (!failed || urls.length) {
      document.gallery = urls;
      document.galleryAlts = urls.map(() => "");
    }
  }
  return document;
}

function assignImage(document: Record<string, unknown>, key: string, placed: Placed, active: boolean) {
  if (!active || "keep" in placed) return;
  document[key] = "url" in placed ? placed.url : "";
}
