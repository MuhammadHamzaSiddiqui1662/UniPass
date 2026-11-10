import { NextResponse } from "next/server";
import { connectDB, Lead } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { authFailure } from "@/lib/auth/http";
import { canAccessLead, canExportLead } from "@/lib/auth/permissions";
import { leadsToCsv } from "@/lib/leads/csv";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!canExportLead(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const lead = await Lead.findById(id).populate("university", "name").lean();
    if (!lead || !canAccessLead(session.role, session.userId, lead.assignedTo)) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const csv = leadsToCsv([lead]);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="unipass-lead-${id}.csv"`,
      },
    });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Export lead error:", error);
    return NextResponse.json({ error: "Failed to export lead" }, { status: 500 });
  }
}
