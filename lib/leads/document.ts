import { v2 as cloudinary } from "cloudinary";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { imageProviderName, type ImageProviderName } from "@/lib/upload/storage";

export const MAX_PDF_BYTES = 15 * 1024 * 1024;

const documentsRoot = path.resolve(process.cwd(), "storage", "lead-documents");

export class LeadDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadDocumentError";
  }
}

export type StoredLeadPdf = {
  storageKey: string;
  provider: ImageProviderName;
};

export type PublicLeadDocument = {
  fileName: string;
  size: number;
  uploadedAt: Date | string;
  uploadedBy?: { name: string };
};

export function assertPdf(buffer: Buffer, contentType: string) {
  const type = contentType.split(";")[0]?.trim().toLowerCase();
  if (buffer.length > MAX_PDF_BYTES) {
    throw new LeadDocumentError("PDF must be 15 MB or smaller.");
  }
  const header = buffer.length >= 4 ? buffer.subarray(0, 4).toString("latin1") : "";
  if (type !== "application/pdf" || header !== "%PDF") {
    throw new LeadDocumentError("Only PDF files can be uploaded.");
  }
}

export function safePdfFileName(name: string) {
  const base = name.split(/[/\\]/).pop()?.replace(/[\u0000-\u001f"]/g, "") ?? "";
  const cleaned = base.replace(/[^\w.\- ()]+/g, "_").replace(/^\.+/, "").slice(0, 120).trim();
  const stem = cleaned || "document.pdf";
  return stem.toLowerCase().endsWith(".pdf") ? stem : `${stem}.pdf`;
}

export function pdfContentDisposition(fileName: string) {
  const safe = safePdfFileName(fileName).replace(/["\\]/g, "_");
  return `attachment; filename="${safe}"`;
}

export function resolveLocalLeadDocument(storageKey: string): string | null {
  if (!/^[a-f0-9]{24}\.pdf$/i.test(storageKey)) return null;
  const full = path.resolve(documentsRoot, storageKey);
  if (full !== path.join(documentsRoot, storageKey)) return null;
  return full;
}

export function presentLeadDocument(document: unknown): PublicLeadDocument | null {
  if (!document || typeof document !== "object") return null;
  const doc = document as {
    fileName?: unknown;
    storageKey?: unknown;
    size?: unknown;
    uploadedAt?: unknown;
    uploadedBy?: unknown;
  };
  if (typeof doc.fileName !== "string" || !doc.fileName) return null;
  if (typeof doc.storageKey !== "string" || !doc.storageKey) return null;
  const uploadedAt =
    doc.uploadedAt instanceof Date || typeof doc.uploadedAt === "string" ? doc.uploadedAt : "";
  let uploadedBy: { name: string } | undefined;
  if (doc.uploadedBy && typeof doc.uploadedBy === "object" && "name" in doc.uploadedBy) {
    const name = (doc.uploadedBy as { name?: unknown }).name;
    if (typeof name === "string" && name) uploadedBy = { name };
  }
  return {
    fileName: doc.fileName,
    size: typeof doc.size === "number" ? doc.size : 0,
    uploadedAt,
    uploadedBy,
  };
}

export function presentLead<T extends { document?: unknown }>(lead: T) {
  const { document, ...rest } = lead;
  return {
    ...rest,
    document: presentLeadDocument(document),
  };
}

export async function storeLeadPdf(
  leadId: string,
  buffer: Buffer,
  provider: ImageProviderName = imageProviderName()
): Promise<StoredLeadPdf> {
  assertPdf(buffer, "application/pdf");
  if (!/^[a-f0-9]{24}$/i.test(leadId)) {
    throw new LeadDocumentError("Lead not found");
  }

  if (provider === "cloudinary") {
    return { storageKey: await uploadCloudinary(leadId, buffer), provider };
  }
  return { storageKey: await uploadLocal(leadId, buffer), provider: "local" };
}

export async function readLeadPdf(document: StoredLeadPdf): Promise<Buffer> {
  if (document.provider === "local") {
    const full = resolveLocalLeadDocument(document.storageKey);
    if (!full) throw new LeadDocumentError("Document not found");
    return readFile(full);
  }

  configureCloudinary();
  const url = cloudinary.url(document.storageKey, {
    resource_type: "raw",
    type: "authenticated",
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + 120,
  });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to read stored PDF (${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function deleteStoredLeadPdf(
  document: { storageKey?: string; provider?: string } | null | undefined
) {
  if (!document?.storageKey || !document.provider) return;

  if (document.provider === "cloudinary") {
    configureCloudinary();
    await cloudinary.uploader.destroy(document.storageKey, {
      resource_type: "raw",
      type: "authenticated",
      invalidate: true,
    });
    return;
  }

  if (document.provider !== "local") return;
  const full = resolveLocalLeadDocument(document.storageKey);
  if (!full) return;
  await unlink(full).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

async function uploadLocal(leadId: string, buffer: Buffer) {
  const storageKey = `${leadId.toLowerCase()}.pdf`;
  const full = resolveLocalLeadDocument(storageKey);
  if (!full) throw new LeadDocumentError("Could not store PDF");
  await mkdir(documentsRoot, { recursive: true });
  await writeFile(full, buffer);
  return storageKey;
}

async function uploadCloudinary(leadId: string, buffer: Buffer) {
  configureCloudinary();
  const publicId = `unipass/lead-documents/${leadId.toLowerCase()}.pdf`;
  const uploaded = await new Promise<{ public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        type: "authenticated",
        public_id: publicId,
        overwrite: true,
        unique_filename: false,
        invalidate: true,
      },
      (error, result) => {
        if (error || !result?.public_id) reject(error || new Error("Failed to store PDF"));
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
  return uploaded.public_id;
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
