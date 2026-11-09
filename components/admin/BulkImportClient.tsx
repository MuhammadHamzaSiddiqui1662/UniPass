"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { rowMessages, rowStatus, willImport } from "@/lib/universities/import/preview";

type ApiRow = {
  rowNumber: number;
  name: string;
  slug: string;
  errors: string[];
  warnings: string[];
  match: { id: string; name: string; slug: string } | null;
  images: { field: string; value: string; state: string; detail: string }[];
};

type ReportRow = { rowNumber: number; name: string; slug: string; status: string; messages: string };

type Summary = {
  created: number;
  updated: number;
  skipped: number;
  imageFailures: number;
  report: ReportRow[];
};

const TONE: Record<string, string> = {
  New: "bg-success-tint text-primary-900",
  Update: "bg-info-tint text-primary-900",
  Warning: "bg-warning-tint text-primary-900",
  Error: "bg-error-tint text-primary-900",
};

export default function BulkImportClient() {
  const [csv, setCsv] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [skipErrors, setSkipErrors] = useState(true);
  const [rows, setRows] = useState<ApiRow[] | null>(null);
  const [zipFiles, setZipFiles] = useState(0);
  const [busy, setBusy] = useState<"preview" | "import" | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<{ completed: number; total: number; name: string } | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const prepared = useMemo(() => {
    if (!rows) return [];
    return rows.map((row) => ({
      ...row,
      status: rowStatus(row, updateExisting),
      messages: rowMessages(row, updateExisting),
    }));
  }, [rows, updateExisting]);

  const counts = prepared.reduce(
    (total, row) => {
      total[row.status] += 1;
      return total;
    },
    { New: 0, Update: 0, Error: 0, Warning: 0 },
  );
  const importable = prepared.filter((row) => willImport(row, updateExisting)).length;

  async function download(url: string, filename: string) {
    setError("");
    const response = await fetch(url);
    if (!response.ok) {
      setError("That download needs an admin session.");
      return;
    }
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function formData() {
    const body = new FormData();
    if (csv) body.set("csv", csv);
    if (zip) body.set("zip", zip);
    body.set("updateExisting", String(updateExisting));
    body.set("skipErrors", String(skipErrors));
    return body;
  }

  async function preview() {
    if (!csv) {
      setError("Choose a CSV file.");
      return;
    }
    setBusy("preview");
    setError("");
    setSummary(null);
    try {
      const response = await fetch("/api/admin/universities/import/preview", { method: "POST", body: formData() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not preview that file.");
      setRows(data.rows);
      setZipFiles(data.zipFiles || 0);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "Could not preview that file.");
    } finally {
      setBusy(null);
    }
  }

  async function runImport() {
    if (!csv) return;
    setBusy("import");
    setError("");
    setProgress({ completed: 0, total: Math.max(importable, 1), name: "" });
    try {
      const response = await fetch("/api/admin/universities/import", { method: "POST", body: formData() });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Import failed.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { type: string; error?: string; completed?: number; total?: number; name?: string } & Partial<Summary>;
          if (event.type === "progress") {
            setProgress({ completed: event.completed || 0, total: event.total || 1, name: event.name || "" });
          } else if (event.type === "error") {
            throw new Error(event.error || "Import failed.");
          } else if (event.type === "result") {
            setSummary({
              created: event.created || 0,
              updated: event.updated || 0,
              skipped: event.skipped || 0,
              imageFailures: event.imageFailures || 0,
              report: event.report || [],
            });
          }
        }
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Import failed.");
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  function downloadReport() {
    const lines = [["row", "name", "slug", "status", "messages"].join(",")];
    for (const row of summary?.report || []) {
      lines.push([row.rowNumber, row.name, row.slug, row.status, row.messages].map(csvCell).join(","));
    }
    if ((summary?.report.length || 0) === 0) lines.push(["", "", "", "", "No problems"].map(csvCell).join(","));
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "unipass-import-errors.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const blocked = !skipErrors && counts.Error > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/admin/universities" className="text-primary hover:underline">
              ← Universities
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl text-primary-900">Bulk import</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Add or update universities from a CSV. Attach a ZIP when image cells name files. Up to 1,000 rows and a 100 MB ZIP.
          Hosts such as Vercel may refuse a body smaller than that; use image URLs if an upload is rejected.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-outline h-11 px-4" onClick={() => download("/api/admin/universities/import/sample", "unipass-universities-sample.csv")}>
            Download sample CSV
          </button>
          <button type="button" className="btn-outline h-11 px-4" onClick={() => download("/api/admin/universities/import/guide", "unipass-university-import-guide.md")}>
            Download template guide
          </button>
          <button type="button" className="btn-outline h-11 px-4" onClick={() => download("/api/admin/universities/export", "unipass-universities.csv")}>
            Export current universities as CSV
          </button>
        </div>

        <section className="mt-8 rounded-card border border-slate-200 bg-white p-6">
          <h2 className="font-display text-xl text-primary-900">Upload</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-bold">
              CSV file
              <input
                type="file"
                accept=".csv,text/csv"
                className="input-field mt-1"
                onChange={(event) => {
                  setCsv(event.target.files?.[0] || null);
                  setRows(null);
                  setSummary(null);
                }}
              />
            </label>
            <label className="block text-sm font-bold">
              ZIP of images (optional)
              <input
                type="file"
                accept=".zip,application/zip"
                className="input-field mt-1"
                onChange={(event) => {
                  setZip(event.target.files?.[0] || null);
                  setRows(null);
                  setSummary(null);
                }}
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={updateExisting} onChange={(event) => setUpdateExisting(event.target.checked)} />
              Update existing
            </label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={skipErrors} onChange={(event) => setSkipErrors(event.target.checked)} />
              Skip rows with errors
            </label>
          </div>
          <button type="button" className="btn-primary mt-5" disabled={busy !== null} onClick={() => void preview()}>
            {busy === "preview" ? "Reading…" : "Preview import"}
          </button>
          {error && <p className="mt-3 text-sm text-error">{error}</p>}
        </section>

        {prepared.length > 0 && (
          <section className="mt-8 rounded-card border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-primary-900">Preview</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {counts.New} new · {counts.Update} updates · {counts.Warning} warnings · {counts.Error} errors
                  {zip ? ` · ${zipFiles} files in the ZIP` : ""}
                </p>
              </div>
              <button type="button" className="btn-primary" disabled={busy !== null || blocked || importable === 0} onClick={() => void runImport()}>
                {busy === "import" ? "Importing…" : `Import ${importable} ${importable === 1 ? "row" : "rows"}`}
              </button>
            </div>
            {blocked && (
              <p className="mt-3 text-sm text-error">Turn on “Skip rows with errors”, or fix the CSV before importing.</p>
            )}
            {progress && (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-primary" style={{ width: `${Math.round((progress.completed / progress.total) * 100)}%` }} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Importing {progress.completed} of {progress.total}
                  {progress.name ? ` — ${progress.name}` : ""}
                </p>
              </div>
            )}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase text-slate-600">
                    <th className="py-2 pr-4">Row</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Images</th>
                    <th className="py-2">Messages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {prepared.map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="py-3 pr-4">{row.rowNumber}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${TONE[row.status]}`}>{row.status}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-bold text-primary-900">{row.name || "—"}</div>
                        <div className="text-xs text-slate-600">{row.slug}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{imageSummary(row.images)}</td>
                      <td className="py-3 text-slate-600">{row.messages.join(" ") || "Ready"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {summary && (
          <section className="mt-8 rounded-card border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl text-primary-900">Import result</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Result label="Created" value={summary.created} />
              <Result label="Updated" value={summary.updated} />
              <Result label="Skipped" value={summary.skipped} />
              <Result label="Image failures" value={summary.imageFailures} />
            </dl>
            <button type="button" className="btn-outline mt-5 h-11 px-4" onClick={downloadReport}>
              Download error report CSV
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function Result({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-input bg-slate-50 px-4 py-3">
      <dt className="text-xs font-bold uppercase text-slate-600">{label}</dt>
      <dd className="mt-1 font-display text-2xl text-primary-900">{value}</dd>
    </div>
  );
}

function imageSummary(images: ApiRow["images"]) {
  if (!images.length) return "—";
  return images.map((image) => `${image.field}: ${image.detail}`).join(" · ");
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
