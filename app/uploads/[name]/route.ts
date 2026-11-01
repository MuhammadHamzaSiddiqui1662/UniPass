import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { resolveUploadPath } from "@/lib/upload/storage";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/** Serves files written to public/uploads after the server started. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const full = resolveUploadPath(`/uploads/${name}`);
  if (!full) return new NextResponse("Not found", { status: 404 });
  try {
    const body = await readFile(full);
    const extension = path.extname(name).slice(1).toLowerCase();
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": TYPES[extension] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
