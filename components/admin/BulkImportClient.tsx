"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import AdminPagination from "@/components/admin/AdminPagination";
import { clientPage } from "@/lib/admin/pagination";
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
  const [previewPage, setPreviewPage] = useState(1);

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
  const previewWindow = clientPage(prepared, previewPage);

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

  function chooseCsv(file: File | null) {
    if (file && !looksLikeCsv(file)) {
      setError("Choose a CSV file.");
      return;
    }
    setError("");
    setCsv(file);
    setRows(null);
    setSummary(null);
    setPreviewPage(1);
  }

  function chooseZip(file: File | null) {
    if (file && !looksLikeZip(file)) {
      setError("Choose a ZIP file.");
      return;
    }
    setError("");
    setZip(file);
    setRows(null);
    setSummary(null);
    setPreviewPage(1);
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
      setPreviewPage(1);
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
  const locked = busy !== null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/universities" className="text-sm text-primary hover:underline">
          ← Back to universities
        </Link>
      </div>

      <h1 className="font-display text-2xl text-primary-900">Bulk import</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Add or update universities from a CSV. Attach a ZIP when image cells name files in the archive. Up to 1,000 rows,
        and a ZIP of up to 100 MB. If a large upload is rejected, put public image URLs in the CSV instead.
      </p>

      <section className="mt-6 rounded-card border border-slate-200 bg-white p-6">
        <h2 className="font-display text-xl text-primary-900">Start from a template</h2>
        <p className="mt-1 text-sm text-slate-600">
          Download the sample, read the column guide, or export the universities already in UniPass and edit that file.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-outline h-10 px-4 py-0 text-sm" onClick={() => download("/api/admin/universities/import/sample", "unipass-universities-sample.csv")}>
            Sample CSV
          </button>
          <button type="button" className="btn-outline h-10 px-4 py-0 text-sm" onClick={() => download("/api/admin/universities/import/guide", "unipass-university-import-guide.md")}>
            Template guide
          </button>
          <button type="button" className="btn-outline h-10 px-4 py-0 text-sm" onClick={() => download("/api/admin/universities/export", "unipass-universities.csv")}>
            Export current universities
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-slate-200 bg-white p-6">
        <h2 className="font-display text-xl text-primary-900">Files</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <FileDrop
            label="CSV file"
            hint="One spreadsheet of universities."
            accept=".csv,text/csv"
            file={csv}
            emptyTitle="Drag a CSV here, or click to browse"
            emptyDetail="CSV file"
            disabled={locked}
            onFile={chooseCsv}
          />
          <FileDrop
            label="ZIP of images"
            hint="Optional. Use this when the CSV names image files instead of URLs."
            accept=".zip,application/zip"
            file={zip}
            emptyTitle="Drag a ZIP here, or click to browse"
            emptyDetail="Optional · 100 MB max"
            disabled={locked}
            onFile={chooseZip}
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <OptionCard
            checked={updateExisting}
            disabled={locked}
            title="Update existing"
            description="Universities that match an existing slug are updated. Leave this off to leave those records unchanged."
            onChange={setUpdateExisting}
          />
          <OptionCard
            checked={skipErrors}
            disabled={locked}
            title="Skip rows with errors"
            description="Problem rows are left out and the rest are imported. Leave this off to stop the whole import when any row has an error."
            onChange={setSkipErrors}
          />
        </div>

        <button
          type="button"
          className="btn-primary mt-6 h-11 px-5 py-0 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          disabled={locked || !csv}
          onClick={() => void preview()}
        >
          {busy === "preview" ? "Reading…" : "Preview import"}
        </button>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
      </section>

      {prepared.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-card border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-primary-900">Preview</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {importable} {importable === 1 ? "row" : "rows"} will be imported
                  {zip ? ` · ${zipFiles} files in the ZIP` : ""}
                </p>
              </div>
              <button
                type="button"
                className="btn-primary h-11 px-5 py-0 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                disabled={locked || blocked || importable === 0}
                onClick={() => void runImport()}
              >
                {busy === "import" ? "Importing…" : `Import ${importable} ${importable === 1 ? "row" : "rows"}`}
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Result label="New" value={counts.New} />
              <Result label="Updates" value={counts.Update} />
              <Result label="Warnings" value={counts.Warning} />
              <Result label="Errors" value={counts.Error} />
            </dl>
            {blocked && (
              <p className="mt-3 text-sm text-error">Turn on “Skip rows with errors”, or fix the CSV before importing.</p>
            )}
            {!blocked && importable === 0 && (
              <p className="mt-3 text-sm text-slate-600">No rows will be imported with these options.</p>
            )}
            {progress && (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-label="Import progress">
                  <div className="h-full bg-primary" style={{ width: `${Math.round((progress.completed / progress.total) * 100)}%` }} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Importing {progress.completed} of {progress.total}
                  {progress.name ? ` — ${progress.name}` : ""}
                </p>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-primary-50">
                <tr className="text-left text-xs font-bold uppercase text-slate-600">
                  <th className="px-6 py-3">Row</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Images</th>
                  <th className="px-6 py-3">Messages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {previewWindow.items.map((row) => (
                  <tr key={row.rowNumber} className="align-top hover:bg-primary-50/50">
                    <td className="px-6 py-4 text-slate-600">{row.rowNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`chip font-bold ${TONE[row.status]}`}>{row.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary-900">{row.name || "—"}</div>
                      {row.slug && <div className="text-xs text-slate-600">{row.slug}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{imageSummary(row.images)}</td>
                    <td className="max-w-md px-6 py-4 text-slate-600">
                      {row.messages.length === 0 ? (
                        "Ready"
                      ) : (
                        <ul className="space-y-1">
                          {row.messages.map((message, index) => (
                            <li key={`${row.rowNumber}-${index}`}>{message}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={previewWindow.page}
            totalPages={previewWindow.totalPages}
            onPage={setPreviewPage}
          />
        </section>
      )}

      {summary && (
        <section className="mt-6 rounded-card border border-slate-200 bg-white p-6">
          <h2 className="font-display text-xl text-primary-900">Import result</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Result label="Created" value={summary.created} />
            <Result label="Updated" value={summary.updated} />
            <Result label="Skipped" value={summary.skipped} />
            <Result label="Image failures" value={summary.imageFailures} />
          </dl>
          <button type="button" className="btn-outline mt-5 h-10 px-4 py-0 text-sm" onClick={downloadReport}>
            Download error report
          </button>
        </section>
      )}
    </main>
  );
}

function FileDrop({
  label,
  hint,
  accept,
  file,
  emptyTitle,
  emptyDetail,
  disabled,
  onFile,
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  emptyTitle: string;
  emptyDetail: string;
  disabled: boolean;
  onFile: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function take(list: FileList | null) {
    if (disabled) return;
    const next = list?.[0] || null;
    if (inputRef.current) inputRef.current.value = "";
    onFile(next);
  }

  return (
    <div>
      <p className="text-sm font-bold text-primary-900">{label}</p>
      <p className="mt-1 text-xs text-slate-600">{hint}</p>
      {file ? (
        <div className="mt-2 rounded-input border border-slate-200 bg-slate-50 p-3">
          <p className="break-all text-sm font-bold text-primary-900">{file.name}</p>
          <p className="mt-1 text-xs text-slate-600">{formatFileSize(file.size)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-outline h-9 px-3 py-0 text-sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button type="button" className="btn-outline h-9 px-3 py-0 text-sm" disabled={disabled} onClick={() => onFile(null)}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            take(event.dataTransfer.files);
          }}
          className={`mt-2 flex w-full flex-col items-center justify-center rounded-input border border-dashed px-4 py-8 text-center disabled:opacity-60 ${
            dragOver ? "border-primary bg-primary/5" : "border-slate-200 bg-white"
          }`}
        >
          <span className="text-sm font-bold text-primary-900">{emptyTitle}</span>
          <span className="mt-1 text-xs text-slate-600">{emptyDetail}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => take(event.target.files)}
      />
    </div>
  );
}

function OptionCard({
  checked,
  disabled,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  title: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-input border p-4 ${
        checked ? "border-primary bg-primary/5" : "border-slate-200 bg-white"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-bold text-primary-900">{title}</span>
        <span className="mt-1 block text-xs font-normal text-slate-600">{description}</span>
      </span>
    </label>
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
  return (
    <ul className="space-y-1">
      {images.map((image, index) => (
        <li key={`${image.field}-${index}`}>
          <span className="font-bold text-primary-900">{image.field}</span>
          {" · "}
          {image.detail}
        </li>
      ))}
    </ul>
  );
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function looksLikeCsv(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/vnd.ms-excel";
}

function looksLikeZip(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed";
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
