import { NextResponse } from "next/server";
import { templateGuide } from "@/lib/universities/import/columns";
import { ensureAdmin } from "@/lib/universities/import/guard";

export async function GET() {
  const denied = await ensureAdmin();
  if (denied) return denied;
  return new NextResponse(templateGuide(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"unipass-university-import-guide.md\"",
    },
  });
}
