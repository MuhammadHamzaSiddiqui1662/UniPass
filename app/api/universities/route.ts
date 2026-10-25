import { NextRequest, NextResponse } from "next/server";
import { connectDB, University } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ universities: [] });
    }

    const ids = idsParam.split(",");
    const universities = await University.find({
      _id: { $in: ids },
      status: "published",
    }).lean();

    return NextResponse.json({ universities: JSON.parse(JSON.stringify(universities)) });
  } catch (error) {
    console.error("Get universities by IDs error:", error);
    return NextResponse.json({ universities: [] });
  }
}
