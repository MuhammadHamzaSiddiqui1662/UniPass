import { NextRequest, NextResponse } from "next/server";
import { connectDB, Guide } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;
    const guide = await Guide.findById(id).lean();

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json({ guide });
  } catch (error) {
    console.error("Get guide error:", error);
    return NextResponse.json({ error: "Failed to fetch guide" }, { status: 500 });
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

    if (body.slug) {
      const existing = await Guide.findOne({
        slug: body.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A guide with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const oldGuide = await Guide.findById(id);
    const guide = await Guide.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    revalidatePath("/guides");
    revalidatePath("/");
    revalidatePath(`/guides/${guide.slug}`);
    if (oldGuide && oldGuide.slug !== guide.slug) {
      revalidatePath(`/guides/${oldGuide.slug}`);
    }

    return NextResponse.json({ guide });
  } catch (error) {
    console.error("Update guide error:", error);
    return NextResponse.json({ error: "Failed to update guide" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const guide = await Guide.findByIdAndDelete(id);

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    revalidatePath("/guides");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete guide error:", error);
    return NextResponse.json({ error: "Failed to delete guide" }, { status: 500 });
  }
}
