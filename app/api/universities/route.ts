import { NextRequest, NextResponse } from "next/server";
import { connectDB, University } from "@/lib/db";
import { loadUniversities } from "@/lib/search/site";
import { toCompareUniversity, type CompareUniversity } from "@/lib/universities/compare";
import { searchUniversities } from "@/lib/universities/search";

const SEARCH_LIMIT = 8;

function isObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (query) {
      const catalog = await loadUniversities();
      const universities = searchUniversities(catalog, query)
        .items.slice(0, SEARCH_LIMIT)
        .map((university) => toCompareUniversity(university))
        .filter((university): university is CompareUniversity => Boolean(university));
      return NextResponse.json({ universities });
    }

    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ universities: [] });
    }

    const ids = idsParam.split(",").map((id) => id.trim()).filter(isObjectId);
    if (!ids.length) {
      return NextResponse.json({ universities: [] });
    }

    await connectDB();
    const universities = await University.find({
      _id: { $in: ids },
      status: "published",
    }).lean();

    return NextResponse.json({ universities: JSON.parse(JSON.stringify(universities)) });
  } catch (error) {
    console.error("Get universities error:", error);
    return NextResponse.json({ universities: [] });
  }
}
