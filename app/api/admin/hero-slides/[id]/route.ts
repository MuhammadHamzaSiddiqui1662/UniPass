import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authFailure } from "@/lib/auth/http";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB, HeroSlide } from "@/lib/db";
import { heroSlideSchema, serializeHeroSlide } from "@/lib/home/hero";

type RouteContext = { params: Promise<{ id: string }> };

function isSlideId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    if (!isSlideId(id)) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    const slideInput = heroSlideSchema.parse(await request.json());
    const slide = await HeroSlide.findByIdAndUpdate(id, slideInput, {
      new: true,
      runValidators: true,
    }).lean();

    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ slide: serializeHeroSlide(slide) });
  } catch (error) {
    const failure = authFailure(error);
    if (failure) return failure;
    console.error("Update hero slide error:", error);
    return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    if (!isSlideId(id)) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    const slide = await HeroSlide.findByIdAndDelete(id);
    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    const failure = authFailure(error);
    if (failure) return failure;
    console.error("Delete hero slide error:", error);
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 });
  }
}
