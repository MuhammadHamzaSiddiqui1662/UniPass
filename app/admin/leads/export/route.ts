import { NextResponse } from "next/server";
import { connectDB, Lead } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { authFailure } from "@/lib/auth/http";
import { leadsToCsv } from "@/lib/leads/csv";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const leads = await Lead.find().sort({ createdAt: -1 }).populate("university", "name").lean();
    const csv = leadsToCsv(leads);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="unipass-leads-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    const auth = authFailure(error);
    if (auth) return auth;
    console.error("Export leads error:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}
