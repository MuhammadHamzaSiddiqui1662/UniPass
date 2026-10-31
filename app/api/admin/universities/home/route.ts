import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB, University } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];

    await Promise.all(
      items.map((item: { id?: string; featuredOnHome?: boolean; homeOrder?: number }) => {
        if (!item.id) return Promise.resolve();
        return University.updateOne(
          { _id: item.id },
          {
            featuredOnHome: Boolean(item.featuredOnHome),
            homeOrder: Number(item.homeOrder) || 0,
          },
        );
      }),
    );

    revalidatePath("/");
    revalidatePath("/universities");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update home slider error:", error);
    return NextResponse.json({ error: "Failed to update the home slider" }, { status: 500 });
  }
}
