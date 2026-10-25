import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB, Lead } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const { leadIds, status } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "No leads selected" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { status } }
    );

    revalidatePath("/admin/leads");

    return NextResponse.json({ updated: result.modifiedCount });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Failed to update leads" }, { status: 500 });
  }
}
