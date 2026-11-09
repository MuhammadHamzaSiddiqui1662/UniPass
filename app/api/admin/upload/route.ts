import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { ImageValidationError, MAX_IMAGE_BYTES } from "@/lib/upload/detect";
import { ingestImageUrl, normalizeKind, storeImageFile } from "@/lib/upload/ingest";
import { getImageStorage } from "@/lib/upload/storage";
import { safePublicId } from "@/lib/upload/urls";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const stored = await ingestImageUrl({
        url: typeof body.url === "string" ? body.url : "",
        kind: normalizeKind(body.kind),
        slug: typeof body.slug === "string" ? body.slug : undefined,
      });
      return NextResponse.json(stored);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    const kindValue = formData.get("kind");
    const slugValue = formData.get("slug");
    const kind = normalizeKind(typeof kindValue === "string" ? kindValue : "");
    const slug = typeof slugValue === "string" ? slugValue : "";
    const stored = await storeImageFile({
      buffer: Buffer.from(await file.arrayBuffer()),
      kind,
      slug: slug || undefined,
    });
    return NextResponse.json(stored);
  } catch (error) {
    return uploadError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url : undefined;
    const publicId = safePublicId(typeof body.publicId === "string" ? body.publicId : undefined) || undefined;
    if (!url && !publicId) {
      return NextResponse.json({ error: "No image to delete" }, { status: 400 });
    }
    try {
      await getImageStorage().remove({ url, publicId });
    } catch (error) {
      console.warn("Image delete skipped:", error);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return uploadError(error);
  }
}

function uploadError(error: unknown) {
  if (error instanceof ImageValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof Error && (error.message === "Unauthorized" || error.message.startsWith("Forbidden"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.error("Upload error:", error);
  return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
}
