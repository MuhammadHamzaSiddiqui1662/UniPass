import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB, Lead } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { authFailure } from "@/lib/auth/http";
import { canAccessLead, canDownloadLeadDocument } from "@/lib/auth/permissions";
import {
  assertPdf,
  deleteStoredLeadPdf,
  LeadDocumentError,
  MAX_PDF_BYTES,
  pdfContentDisposition,
  presentLead,
  readLeadPdf,
  safePdfFileName,
  storeLeadPdf,
} from "@/lib/leads/document";

export const runtime = "nodejs";

function loadLead(id: string) {
  return Lead.findById(id)
    .populate("assignedTo", "name")
    .populate("university", "name")
    .populate("activity.user", "name")
    .populate("document.uploadedBy", "name");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();

    const { id } = await params;
    const lead = await findAccessibleLead(id, session.role, session.userId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (!canDownloadLeadDocument(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!lead.document?.storageKey || !lead.document.provider) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 404 });
    }

    const bytes = await readLeadPdf({
      storageKey: lead.document.storageKey,
      provider: lead.document.provider,
    });
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": pdfContentDisposition(lead.document.fileName || "document.pdf"),
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Download lead document error:", error);
    return NextResponse.json({ error: "Failed to download PDF" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();

    const { id } = await params;
    const existing = await findAccessibleLead(id, session.role, session.userId);
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "PDF must be 15 MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    assertPdf(buffer, file.type || "");

    const previous = existing.document?.storageKey
      ? { storageKey: existing.document.storageKey, provider: existing.document.provider }
      : null;
    const stored = await storeLeadPdf(id, buffer);
    const fileName = safePdfFileName(file.name || "document.pdf");

    await Lead.findByIdAndUpdate(
      id,
      {
        $set: {
          document: {
            fileName,
            storageKey: stored.storageKey,
            provider: stored.provider,
            size: buffer.length,
            uploadedBy: session.userId,
            uploadedAt: new Date(),
          },
        },
        $push: {
          activity: {
            action: previous ? "Document replaced" : "Document uploaded",
            note: fileName,
            user: session.userId,
            timestamp: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (
      previous?.storageKey &&
      (previous.provider !== stored.provider || previous.storageKey !== stored.storageKey)
    ) {
      await deleteStoredLeadPdf(previous).catch((error) => {
        console.warn("Previous lead document delete skipped:", error);
      });
    }

    const lead = await loadLead(id).lean();
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ lead: presentLead(lead) });
  } catch (error) {
    if (error instanceof LeadDocumentError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Upload lead document error:", error);
    return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
  }
}

async function findAccessibleLead(id: string, role: Parameters<typeof canAccessLead>[0], userId: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const lead = await Lead.findById(id);
  if (!lead || !canAccessLead(role, userId, lead.assignedTo)) return null;
  return lead;
}
