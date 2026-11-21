import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { CountryOutlook, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { countryOutlookSchema } from "@/lib/validations/scorecard";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const parsed = countryOutlookSchema.safeParse(await request.json());
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Check the country fields and try again.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const country = await CountryOutlook.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).lean();
    if (!country) return NextResponse.json({ error: "Country not found" }, { status: 404 });
    revalidatePath("/scholarships");
    return NextResponse.json({ country });
  } catch (error) {
    console.error("Update country outlook error:", error);
    return NextResponse.json({ error: "Failed to update country" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const country = await CountryOutlook.findByIdAndDelete(id);
    if (!country) return NextResponse.json({ error: "Country not found" }, { status: 404 });
    revalidatePath("/scholarships");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete country outlook error:", error);
    return NextResponse.json({ error: "Failed to delete country" }, { status: 500 });
  }
}
