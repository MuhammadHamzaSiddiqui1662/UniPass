import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB, University } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { parseUniversityImages, universityFieldsSchema, validationError } from "@/lib/validations/university";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const universities = await University.find({ status: "published" })
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ universities: JSON.parse(JSON.stringify(universities)) });
  } catch (error) {
    console.error("Get universities error:", error);
    return NextResponse.json({ universities: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const parsed = universityFieldsSchema.safeParse({
      ...body,
      languages: Array.isArray(body.languagesOffered) ? body.languagesOffered : body.languages,
      country: body.country || "Türkiye",
      countryCode: body.countryCode || "TR",
      scholarshipType: body.scholarshipType || "none",
      aliases: Array.isArray(body.aliases) ? body.aliases : [],
      featuredOnHome: Boolean(body.featuredOnHome),
      homeOrder: Number(body.homeOrder) || 0,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 });
    }
    let images;
    try {
      images = parseUniversityImages(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: validationError(error) }, { status: 400 });
      }
      throw error;
    }
    const existing = await University.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json({ error: "A university with this slug already exists" }, { status: 400 });
    }
    const university = await University.create({
      ...parsed.data,
      ...images,
      metaTitle: typeof body.metaTitle === "string" ? body.metaTitle : undefined,
      metaDescription: typeof body.metaDescription === "string" ? body.metaDescription : undefined,
    });
    revalidatePath("/universities");
    revalidatePath("/");
    return NextResponse.json({ university: JSON.parse(JSON.stringify(university)) }, { status: 201 });
  } catch (error) {
    console.error("Create university error:", error);
    return NextResponse.json({ error: "Failed to create university" }, { status: 500 });
  }
}
