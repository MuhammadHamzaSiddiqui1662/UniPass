import { NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/universities/import/guard";
import { sampleCsvText } from "@/lib/universities/import/csv";

export async function GET() {
  const denied = await ensureAdmin();
  if (denied) return denied;
  return new NextResponse(sampleCsvText(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"unipass-universities-sample.csv\"",
    },
  });
}
