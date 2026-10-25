import { NextRequest, NextResponse } from "next/server";
import { connectDB, Scholarship } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const scholarship = await Scholarship.create(body);
    revalidatePath("/scholarships");
    revalidatePath("/");
    return NextResponse.json({ scholarship }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create scholarship" }, { status: 500 });
  }
}
