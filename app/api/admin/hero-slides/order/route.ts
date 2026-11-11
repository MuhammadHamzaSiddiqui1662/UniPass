import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authFailure } from "@/lib/auth/http";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB, HeroSlide } from "@/lib/db";

function isSlideId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : [];
    if (ids.length === 0 || ids.some((id: string) => !isSlideId(id)) || new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: "Send each slide id once, in the new order" }, { status: 400 });
    }

    const existing = await HeroSlide.find().select("_id").lean();
    const existingIds = new Set(existing.map((slide) => String(slide._id)));
    if (ids.length !== existingIds.size || ids.some((id: string) => !existingIds.has(id))) {
      return NextResponse.json({ error: "Reorder the full list of slides" }, { status: 400 });
    }

    await Promise.all(ids.map((id: string, order: number) => HeroSlide.updateOne({ _id: id }, { order })));
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    const failure = authFailure(error);
    if (failure) return failure;
    console.error("Reorder hero slides error:", error);
    return NextResponse.json({ error: "Failed to reorder hero slides" }, { status: 500 });
  }
}
