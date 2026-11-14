import { NextRequest, NextResponse } from "next/server";
import { connectDB, Testimonial } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { parseTestimonialWrite } from "@/lib/testimonials/input";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const parsed = parseTestimonialWrite(await request.json());
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const testimonial = await Testimonial.create(parsed.data);
    revalidatePath("/");
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error("Create testimonial error:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
