import { NextRequest, NextResponse } from "next/server";
import { connectDB, Testimonial } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { parseTestimonialWrite } from "@/lib/testimonials/input";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const testimonial = await Testimonial.findById(id).lean();
    if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ testimonial });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const parsed = parseTestimonialWrite(await request.json());
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const testimonial = await Testimonial.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).lean();
    if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidatePath("/");
    return NextResponse.json({ testimonial });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
