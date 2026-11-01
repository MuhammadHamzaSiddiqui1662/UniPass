import { NextRequest, NextResponse } from "next/server";
import { connectDB, University } from "@/lib/db";
import { ensureAdmin } from "@/lib/universities/import/guard";
import { ImportError } from "@/lib/universities/import/limits";
import { previewImport } from "@/lib/universities/import/preview";
import { readImportForm } from "@/lib/universities/import/request";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const denied = await ensureAdmin();
  if (denied) return denied;
  try {
    const { table, zip } = await readImportForm(await request.formData());
    await connectDB();
    const existing = await University.find().select("name slug").lean();
    const rows = previewImport(
      table,
      zip,
      existing.map((university) => ({
        id: String(university._id),
        name: university.name,
        slug: university.slug,
      })),
    ).map(({ values: _values, ...row }) => row);
    return NextResponse.json({
      delimiter: table.delimiter,
      zipFiles: zip.names.length,
      rows,
    });
  } catch (error) {
    if (error instanceof ImportError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Import preview error:", error);
    return NextResponse.json({ error: "Could not read that import." }, { status: 500 });
  }
}
