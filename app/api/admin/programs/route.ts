import { NextRequest, NextResponse } from "next/server";
import { connectDB, Program } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();

    const existing = await Program.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ error: "A program with this slug already exists" }, { status: 400 });
    }

    const program = await Program.create(body);

    revalidatePath("/programs");
    revalidatePath("/");
    if (body.status === "published") {
      revalidatePath(`/programs/${body.slug}`);
    }

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error("Create program error:", error);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}
