import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import type { DetectedImage } from "@/lib/upload/detect";
import { cloudinaryPublicId, safePublicId } from "@/lib/upload/urls";

export type ImageProviderName = "cloudinary" | "local";

export type StoredImage = {
  url: string;
  publicId?: string;
  provider: ImageProviderName;
};

export type UploadInput = {
  buffer: Buffer;
  contentType: string;
  extension: DetectedImage["extension"];
  folder: string;
};

export interface ImageStorage {
  readonly name: ImageProviderName;
  upload(input: UploadInput): Promise<StoredImage>;
  remove(image: { url?: string; publicId?: string }): Promise<void>;
}

const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");

export function imageProviderName(): ImageProviderName {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return "cloudinary";
  }
  return "local";
}

export function getImageStorage(): ImageStorage {
  return imageProviderName() === "cloudinary" ? cloudinaryStorage : localStorage;
}

export function folderFor(kind: string, slug?: string) {
  if (kind === "photo") return "unipass/testimonials";
  const safe =
    (slug || "unassigned")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "unassigned";
  return `unipass/universities/${safe}`;
}

export function resolveUploadPath(url: string): string | null {
  const pathOnly = url.split("?")[0];
  if (!pathOnly.startsWith("/uploads/")) return null;
  let decoded = pathOnly;
  try {
    decoded = decodeURIComponent(pathOnly);
  } catch {
    return null;
  }
  if (decoded.includes("\0") || decoded.includes("\\")) return null;
  const relative = decoded.slice("/uploads/".length);
  if (!relative || relative.split("/").some((part) => !part || part === "." || part === "..")) return null;
  const full = path.resolve(uploadsRoot, relative);
  if (full !== uploadsRoot && !full.startsWith(uploadsRoot + path.sep)) return null;
  return full;
}

const localStorage: ImageStorage = {
  name: "local",
  async upload(input) {
    await mkdir(uploadsRoot, { recursive: true });
    const filename = `${randomUUID()}.${input.extension}`;
    await writeFile(path.join(uploadsRoot, filename), input.buffer);
    return { url: `/uploads/${filename}`, provider: "local" };
  },
  async remove(image) {
    if (!image.url) return;
    const full = resolveUploadPath(image.url);
    if (!full) return;
    await unlink(full).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  },
};

const cloudinaryStorage: ImageStorage = {
  name: "cloudinary",
  async upload(input) {
    configureCloudinary();
    const uploaded = await cloudinary.uploader.upload(
      `data:${input.contentType};base64,${input.buffer.toString("base64")}`,
      {
        folder: input.folder,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
        transformation:
          input.extension === "svg"
            ? undefined
            : [{ width: 2000, crop: "limit", quality: "auto:good" }],
      },
    );
    const publicId = safePublicId(uploaded.public_id) || uploaded.public_id;
    if (input.extension === "svg") {
      return { url: uploaded.secure_url, publicId, provider: "cloudinary" };
    }
    const url = cloudinary.url(uploaded.public_id, {
      secure: true,
      transformation: [{ width: 2000, crop: "limit", quality: "auto", fetch_format: "auto" }],
    });
    return { url, publicId, provider: "cloudinary" };
  },
  async remove(image) {
    const publicId = safePublicId(image.publicId) || (image.url ? cloudinaryPublicId(image.url) : null);
    if (publicId) {
      configureCloudinary();
      await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    }
    if (image.url) await localStorage.remove({ url: image.url });
  },
};

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
