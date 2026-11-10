import { NextRequest, NextResponse } from "next/server";
import { searchSite } from "@/lib/search/site";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get("q") || "";
  if (!query.trim()) {
    return NextResponse.json({ groups: [] });
  }
  try {
    const result = await searchSite(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Site search failed:", error);
    return NextResponse.json({ groups: [] });
  }
}
