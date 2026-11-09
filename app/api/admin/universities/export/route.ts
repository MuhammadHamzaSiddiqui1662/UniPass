import { NextResponse } from "next/server";
import { connectDB, University } from "@/lib/db";
import { serializeCsv } from "@/lib/universities/import/csv";
import { universityToCsvRow } from "@/lib/universities/import/exportRow";
import { ensureAdmin } from "@/lib/universities/import/guard";

export async function GET() {
  const denied = await ensureAdmin();
  if (denied) return denied;
  await connectDB();
  const universities = await University.find().sort({ name: 1 }).lean();
  const csv = serializeCsv(universities.map((university) => universityToCsvRow(university)));
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"unipass-universities.csv\"",
    },
  });
}
