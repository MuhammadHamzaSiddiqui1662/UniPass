import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB, University } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { universityFieldsSchema, validationError } from "@/lib/validations/university";
import { withUniversityDefaults } from "@/lib/universities/defaults";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }
    const university = await University.findById(id).lean();

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      university: withUniversityDefaults(JSON.parse(JSON.stringify(university))),
    });
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
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }
    const body = await request.json();
    const current = await University.findById(id).lean();
    if (!current) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }
    const parsed = universityFieldsSchema.safeParse({
      name: body.name ?? current.name,
      slug: body.slug ?? current.slug,
      type: body.type ?? current.type,
      city: body.city ?? current.city,
      country: body.country || current.country || "Türkiye",
      countryCode: body.countryCode || current.countryCode || "TR",
      scholarshipType:
        body.scholarshipType || current.scholarshipType || (current.hasMeritScholarship ? "partially_funded" : "none"),
      aliases: Array.isArray(body.aliases) ? body.aliases : current.aliases || [],
      featuredOnHome: body.featuredOnHome ?? current.featuredOnHome ?? false,
      homeOrder: body.homeOrder ?? current.homeOrder ?? 0,
      tuitionFrom: body.tuitionFrom ?? current.tuitionFrom,
      description: body.description ?? current.description,
      fields: body.fields ?? current.fields ?? [],
      levels: body.levels ?? current.levels ?? [],
      languages: Array.isArray(body.languagesOffered) ? body.languagesOffered : current.languages || [],
      hasMeritScholarship: body.hasMeritScholarship ?? current.hasMeritScholarship ?? false,
      status: body.status ?? current.status,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 });
    }

    // If slug is being changed, check for duplicates
    if (parsed.data.slug) {
      const existing = await University.findOne({
        slug: parsed.data.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A university with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const oldUniversity = current;
    const university = await University.findByIdAndUpdate(id, {
      ...parsed.data,
      metaTitle: typeof body.metaTitle === "string" ? body.metaTitle : current.metaTitle,
      metaDescription: typeof body.metaDescription === "string" ? body.metaDescription : current.metaDescription,
    }, {
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
