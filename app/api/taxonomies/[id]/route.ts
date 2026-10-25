import { NextRequest, NextResponse } from "next/server";
import { connectDB, Taxonomy } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;
    const taxonomy = await Taxonomy.findById(id).lean();

    if (!taxonomy) {
      return NextResponse.json({ error: "Taxonomy not found" }, { status: 404 });
    }

    return NextResponse.json({ taxonomy: JSON.parse(JSON.stringify(taxonomy)) });
  } catch (error) {
    console.error("Get taxonomy error:", error);
    return NextResponse.json({ error: "Failed to fetch taxonomy" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const taxonomy = await Taxonomy.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();

    if (!taxonomy) {
      return NextResponse.json({ error: "Taxonomy not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/universities");
    revalidatePath("/contact");

    return NextResponse.json({ taxonomy: JSON.parse(JSON.stringify(taxonomy)) });
  } catch (error: any) {
    console.error("Update taxonomy error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "A taxonomy with this type and value already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update taxonomy" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const taxonomy = await Taxonomy.findByIdAndDelete(id);

    if (!taxonomy) {
      return NextResponse.json({ error: "Taxonomy not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/universities");
    revalidatePath("/contact");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete taxonomy error:", error);
    return NextResponse.json({ error: "Failed to delete taxonomy" }, { status: 500 });
  }
}
