import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { connectDB, University } from "@/lib/db";
import { executeImport } from "@/lib/universities/import/execute";
import { ensureAdmin } from "@/lib/universities/import/guard";
import { ImportError } from "@/lib/universities/import/limits";
import { previewImport } from "@/lib/universities/import/preview";
import { readImportForm, readOptions } from "@/lib/universities/import/request";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const denied = await ensureAdmin();
  if (denied) return denied;
  try {
    const form = await request.formData();
    const { table, zip } = await readImportForm(form);
    const options = readOptions(form);
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
    );
    if (!options.skipErrors && rows.some((row) => row.errors.length)) {
      return NextResponse.json(
        { error: "Some rows have errors. Turn on “Skip rows with errors”, or fix the CSV." },
        { status: 400 },
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (value: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
        try {
          const result = await executeImport(rows, table.present, zip, options, (event) => {
            send({ type: "progress", ...event });
          });
          const paths = new Set<string>(["/", "/universities"]);
          for (const slug of result.slugs) paths.add(`/universities/${slug}`);
          for (const path of paths) revalidatePath(path);
          send({ type: "result", ...result });
          controller.close();
        } catch (error) {
          console.error("Import stream error:", error);
          send({ type: "error", error: "Import failed before it could finish." });
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
  } catch (error) {
    if (error instanceof ImportError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed." }, { status: 500 });
  }
}
