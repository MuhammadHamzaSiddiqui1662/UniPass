import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ScorecardConfig, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { ensureScorecardDefaults } from "@/lib/scholarships/store";
import { parseScorecardConfig } from "@/lib/validations/scorecard";

export async function GET() {
  try {
    await requireAdmin();
    await ensureScorecardDefaults();
    const doc = await ScorecardConfig.findOne().lean();
    return NextResponse.json({ config: doc?.config });
  } catch (error) {
    console.error("Get scorecard config error:", error);
    return NextResponse.json({ error: "Failed to load scorecard rules" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const parsed = parseScorecardConfig(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const doc = await ScorecardConfig.findOneAndUpdate(
      {},
      { config: parsed.config },
      { new: true, upsert: true }
    ).lean();
    revalidatePath("/scholarships");
    return NextResponse.json({ config: doc?.config });
  } catch (error) {
    console.error("Save scorecard config error:", error);
    return NextResponse.json({ error: "Failed to save scorecard rules" }, { status: 500 });
  }
}
