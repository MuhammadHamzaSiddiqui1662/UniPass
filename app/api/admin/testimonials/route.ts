import { NextRequest, NextResponse } from "next/server";
import { connectDB, Testimonial } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const testimonial = await Testimonial.create(body);
    revalidatePath("/");
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
