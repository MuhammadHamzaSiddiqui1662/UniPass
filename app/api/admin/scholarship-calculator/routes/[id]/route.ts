import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FundingRoute, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { fundingRouteSchema } from "@/lib/validations/scorecard";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const parsed = fundingRouteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Check the route fields and try again." }, { status: 400 });
    }
    const route = await FundingRoute.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).lean();
    if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });
    revalidatePath("/scholarships");
    return NextResponse.json({ route });
  } catch (error) {
    console.error("Update funding route error:", error);
    return NextResponse.json({ error: "Failed to update funding route" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const route = await FundingRoute.findByIdAndDelete(id);
    if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });
    revalidatePath("/scholarships");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete funding route error:", error);
    return NextResponse.json({ error: "Failed to delete funding route" }, { status: 500 });
  }
}
