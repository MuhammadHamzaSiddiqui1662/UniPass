import { NextRequest, NextResponse } from "next/server";
import { connectDB, Program } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;
    const program = await Program.findById(id).lean();

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error("Get program error:", error);
    return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    if (body.slug) {
      const existing = await Program.findOne({ slug: body.slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "A program with this slug already exists" }, { status: 400 });
      }
    }

    const oldProgram = await Program.findById(id);
    const program = await Program.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    revalidatePath("/programs");
    revalidatePath(`/programs/${program.slug}`);
    if (oldProgram && oldProgram.slug !== program.slug) {
      revalidatePath(`/programs/${oldProgram.slug}`);
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error("Update program error:", error);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const program = await Program.findByIdAndDelete(id);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    revalidatePath("/programs");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete program error:", error);
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
