import { NextResponse } from "next/server";
import { connectDB, Lead } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { authFailure } from "@/lib/auth/http";
import { canAccessLead, canExportLeadActivity } from "@/lib/auth/permissions";
import { leadActivityToCsv } from "@/lib/leads/csv";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!canExportLeadActivity(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const lead = await Lead.findById(id).populate("activity.user", "name").lean();
    if (!lead || !canAccessLead(session.role, session.userId, lead.assignedTo)) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const csv = leadActivityToCsv(lead.activity, lead.notes);
    const fileId = safeFilePart(lead.trackingId || id);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="unipass-lead-${fileId}-logs.csv"`,
      },
    });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Export lead activity error:", error);
    return NextResponse.json({ error: "Failed to export lead logs" }, { status: 500 });
  }
}

function safeFilePart(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "lead";
}
