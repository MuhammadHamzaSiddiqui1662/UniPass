import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FundingRoute, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { fundingRouteSchema } from "@/lib/validations/scorecard";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const routes = await FundingRoute.find().sort({ order: 1, name: 1 }).lean();
    return NextResponse.json({ routes });
  } catch (error) {
    console.error("List funding routes error:", error);
    return NextResponse.json({ error: "Failed to load funding routes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const parsed = fundingRouteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Check the route fields and try again." }, { status: 400 });
    }
    const route = await FundingRoute.create(parsed.data);
    revalidatePath("/scholarships");
    return NextResponse.json({ route }, { status: 201 });
  } catch (error) {
    console.error("Create funding route error:", error);
    return NextResponse.json({ error: "Failed to create funding route" }, { status: 500 });
  }
}
