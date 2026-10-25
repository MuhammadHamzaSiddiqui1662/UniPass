import { NextRequest, NextResponse } from "next/server";
import { connectDB, Taxonomy } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const query: any = {};
    if (type) {
      query.type = type;
    }

    const taxonomies = await Taxonomy.find(query).sort({ order: 1, label: 1 }).lean();
    return NextResponse.json({ taxonomies: JSON.parse(JSON.stringify(taxonomies)) });
  } catch (error) {
    console.error("Get taxonomies error:", error);
    return NextResponse.json({ taxonomies: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const taxonomy = await Taxonomy.create(body);

    revalidatePath("/");
    revalidatePath("/universities");
    revalidatePath("/contact");

    return NextResponse.json({ taxonomy }, { status: 201 });
  } catch (error: any) {
    console.error("Create taxonomy error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "A taxonomy with this type and value already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create taxonomy" }, { status: 500 });
  }
}
