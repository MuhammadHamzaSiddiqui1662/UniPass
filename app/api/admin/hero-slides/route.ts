import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authFailure } from "@/lib/auth/http";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB, HeroSlide } from "@/lib/db";
import { heroSlideSchema, serializeHeroSlide } from "@/lib/home/hero";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ slides: slides.map((slide) => serializeHeroSlide(slide)) });
  } catch (error) {
    const failure = authFailure(error);
    if (failure) return failure;
    console.error("List hero slides error:", error);
    return NextResponse.json({ error: "Failed to load hero slides" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const slideInput = heroSlideSchema.parse(await request.json());
    const last = await HeroSlide.findOne().sort({ order: -1 }).select("order").lean();
    const created = await HeroSlide.create({
      ...slideInput,
      order: (last?.order ?? -1) + 1,
    });
    revalidatePath("/");
    return NextResponse.json({ slide: serializeHeroSlide(created) }, { status: 201 });
  } catch (error) {
    const failure = authFailure(error);
    if (failure) return failure;
    console.error("Create hero slide error:", error);
    return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 });
  }
}
