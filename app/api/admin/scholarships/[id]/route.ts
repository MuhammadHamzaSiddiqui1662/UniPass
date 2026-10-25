import { NextRequest, NextResponse } from "next/server";
import { connectDB, Scholarship } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await connectDB();
    const { id } = await params;
    const scholarship = await Scholarship.findById(id).lean();
    if (!scholarship) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ scholarship });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const scholarship = await Scholarship.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!scholarship) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidatePath("/scholarships");
    revalidatePath("/");
    return NextResponse.json({ scholarship });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const scholarship = await Scholarship.findByIdAndDelete(id);
    if (!scholarship) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidatePath("/scholarships");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
