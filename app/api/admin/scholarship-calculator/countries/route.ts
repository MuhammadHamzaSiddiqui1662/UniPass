import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { CountryOutlook, connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { countryOutlookSchema } from "@/lib/validations/scorecard";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const countries = await CountryOutlook.find().sort({ order: 1, country: 1 }).lean();
    return NextResponse.json({ countries });
  } catch (error) {
    console.error("List country outlooks error:", error);
    return NextResponse.json({ error: "Failed to load countries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const parsed = countryOutlookSchema.safeParse(await request.json());
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Check the country fields and try again.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const country = await CountryOutlook.create(parsed.data);
    revalidatePath("/scholarships");
    return NextResponse.json({ country }, { status: 201 });
  } catch (error) {
    console.error("Create country outlook error:", error);
    return NextResponse.json({ error: "Failed to create country" }, { status: 500 });
  }
}
