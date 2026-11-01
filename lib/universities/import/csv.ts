import Papa from "papaparse";
import { IMPORT_COLUMNS, headerKey, sampleCsv, type ImportKey } from "@/lib/universities/import/columns";
import { ImportError, MAX_CSV_BYTES, MAX_IMPORT_ROWS } from "@/lib/universities/import/limits";

export type CsvTable = {
  delimiter: "," | ";" | "\t";
  present: Set<ImportKey>;
  rows: { rowNumber: number; cells: Partial<Record<ImportKey, string>> }[];
};

export function decodeCsv(buffer: Buffer) {
  if (buffer.length > MAX_CSV_BYTES) {
    throw new ImportError("CSV is larger than 5 MB.");
  }
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le").replace(/^\uFEFF/, "");
  }
  const text = buffer.toString("utf8");
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function detectDelimiter(text: string): "," | ";" | "\t" {
  const sample = text.split(/\r?\n/).slice(0, 8).join("\n");
  let commas = 0;
  let semis = 0;
  let tabs = 0;
  let quoted = false;
  for (const char of sample) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (char === ",") commas += 1;
    else if (char === ";") semis += 1;
    else if (char === "\t") tabs += 1;
  }
  if (semis > commas && semis >= tabs) return ";";
  if (tabs > commas && tabs > semis) return "\t";
  return ",";
}

export function parseCsv(text: string): CsvTable {
  const delimiter = detectDelimiter(text);
  const parsed = Papa.parse<string[]>(text, {
    delimiter,
    skipEmptyLines: "greedy",
  });
  const records = parsed.data.filter((row) => row.some((cell) => String(cell || "").trim()));
  if (!records.length) throw new ImportError("The CSV has no rows.");
  const [headerRow, ...body] = records;
  const present = new Set<ImportKey>();
  const indexes: { index: number; key: ImportKey }[] = [];
  headerRow.forEach((header, index) => {
    const key = headerKey(header || "");
    if (!key || present.has(key)) return;
    present.add(key);
    indexes.push({ index, key });
  });
  if (!present.has("name")) throw new ImportError("The CSV needs a name column.");
  if (body.length > MAX_IMPORT_ROWS) {
    throw new ImportError(`A CSV can contain at most ${MAX_IMPORT_ROWS} universities.`);
  }
  const rows = body.map((record, index) => {
    const cells: Partial<Record<ImportKey, string>> = {};
    for (const column of indexes) {
      cells[column.key] = String(record[column.index] ?? "").trim();
    }
    return { rowNumber: index + 2, cells };
  });
  return { delimiter, present, rows };
}

export function serializeCsv(rows: Record<string, string>[], headers = IMPORT_COLUMNS.map((column) => column.header)) {
  const csv = Papa.unparse({
    fields: headers,
    data: rows.map((row) => headers.map((header) => row[header] ?? "")),
  });
  return `\uFEFF${csv}`;
}

export function sampleCsvText() {
  const sample = sampleCsv();
  return serializeCsv(
    sample.rows.map((row) => {
      const record: Record<string, string> = {};
      for (const column of IMPORT_COLUMNS) record[column.header] = row[column.key];
      return record;
    }),
    sample.headers,
  );
}
