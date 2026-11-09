import { decodeCsv, parseCsv, type CsvTable } from "@/lib/universities/import/csv";
import { ImportError, MAX_ZIP_BYTES } from "@/lib/universities/import/limits";
import { emptyZip, readZip, type ZipIndex } from "@/lib/universities/import/zip";

export async function readImportForm(form: FormData): Promise<{ table: CsvTable; zip: ZipIndex }> {
  const csv = form.get("csv");
  if (!(csv instanceof File) || csv.size === 0) throw new ImportError("Choose a CSV file.");
  const table = parseCsv(decodeCsv(Buffer.from(await csv.arrayBuffer())));
  const zipFile = form.get("zip");
  if (!(zipFile instanceof File) || zipFile.size === 0) return { table, zip: emptyZip() };
  if (zipFile.size > MAX_ZIP_BYTES) throw new ImportError("ZIP is larger than 100 MB.");
  const zip = await readZip(Buffer.from(await zipFile.arrayBuffer()));
  return { table, zip };
}

export function readOptions(form: FormData) {
  return {
    updateExisting: form.get("updateExisting") !== "false",
    skipErrors: form.get("skipErrors") !== "false",
  };
}
