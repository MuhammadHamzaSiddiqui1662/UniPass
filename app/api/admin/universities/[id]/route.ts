import { NextRequest, NextResponse } from "next/server";
import { connectDB, University } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;
    const university = await University.findById(id).lean();

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ university });
  } catch (error) {
    console.error("Get university error:", error);
    return NextResponse.json(
      { error: "Failed to fetch university" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // If slug is being changed, check for duplicates
    if (body.slug) {
      const existing = await University.findOne({
        slug: body.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A university with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const oldUniversity = await University.findById(id);
    const university = await University.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    // Revalidate relevant paths
    revalidatePath("/universities");
    revalidatePath("/");
    revalidatePath(`/universities/${university.slug}`);
    if (oldUniversity && oldUniversity.slug !== university.slug) {
      revalidatePath(`/universities/${oldUniversity.slug}`);
    }

    return NextResponse.json({ university });
  } catch (error) {
    console.error("Update university error:", error);
    return NextResponse.json(
      { error: "Failed to update university" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const university = await University.findByIdAndDelete(id);

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    // Revalidate
    revalidatePath("/universities");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete university error:", error);
    return NextResponse.json(
      { error: "Failed to delete university" },
      { status: 500 }
    );
  }
}
