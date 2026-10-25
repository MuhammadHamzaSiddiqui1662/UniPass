import { NextRequest, NextResponse } from "next/server";
import { connectDB, Guide } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();

    // Check for duplicate slug
    const existing = await Guide.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json(
        { error: "A guide with this slug already exists" },
        { status: 400 }
      );
    }

    const guide = await Guide.create(body);

    revalidatePath("/guides");
    revalidatePath("/");
    if (body.status === "published") {
      revalidatePath(`/guides/${body.slug}`);
    }

    return NextResponse.json({ guide }, { status: 201 });
  } catch (error) {
    console.error("Create guide error:", error);
    return NextResponse.json({ error: "Failed to create guide" }, { status: 500 });
  }
}
