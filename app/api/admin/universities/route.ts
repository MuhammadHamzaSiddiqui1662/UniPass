import { NextRequest, NextResponse } from "next/server";
import { connectDB, University } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";

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
