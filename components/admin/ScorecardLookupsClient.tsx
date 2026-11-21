"use client";

import { FormEvent, useState, type ReactNode } from "react";
import type { ScorecardConfigInput } from "@/lib/scholarships/types";

type ListKey = "degreeStatuses" | "institutions" | "supervisors" | "referees" | "refusals";

export default function ScorecardLookupsClient({ initialConfig }: { initialConfig: ScorecardConfigInput }) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update(mutator: (next: ScorecardConfigInput) => void) {
    setConfig((current) => {
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/scholarship-calculator/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save");
      setMessage("Lookups saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <ListCard title="Grading scales" hint="Percentage scales use the percentage table instead of the factor.">
        {config.gpaScales.map((row, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[1fr_140px_140px_auto]">
            <input className="input-field !h-10" value={row.label} onChange={(event) => update((next) => { next.gpaScales[index].label = event.target.value; })} />
            <input type="number" step="0.01" className="input-field !h-10" value={row.factor} onChange={(event) => update((next) => { next.gpaScales[index].factor = Number(event.target.value); })} />
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={Boolean(row.percentage)} onChange={(event) => update((next) => { next.gpaScales[index].percentage = event.target.checked; })} />
              Percentage
            </label>
            <button type="button" className="text-sm font-bold text-error" onClick={() => update((next) => { next.gpaScales.splice(index, 1); })}>Remove</button>
          </div>
        ))}
        <button type="button" className="text-sm font-bold text-primary" onClick={() => update((next) => { next.gpaScales.push({ label: "New scale", factor: 1 }); })}>Add scale</button>
      </ListCard>

      <StepTable title="Percentage to 4.0" rows={config.percentageTable} onChange={(rows) => update((next) => { next.percentageTable = rows; })} />
      <StepTable title="TOEFL iBT to IELTS" rows={config.toeflTable} onChange={(rows) => update((next) => { next.toeflTable = rows; })} />
      <StepTable title="PTE Academic to IELTS" rows={config.pteTable} onChange={(rows) => update((next) => { next.pteTable = rows; })} />
      <StepTable title="Duolingo to IELTS" rows={config.duolingoTable} onChange={(rows) => update((next) => { next.duolingoTable = rows; })} />

      {([
        ["degreeStatuses", "Highest degree", "score"],
        ["institutions", "Institution standing", "score"],
        ["supervisors", "Supervisor status", "score"],
        ["referees", "Referees", "score"],
        ["refusals", "Visa refusals", "score"],
      ] as const).map(([key, title]) => (
        <ScoreList
          key={key}
          title={title}
          rows={config[key as ListKey]}
          valueKey="score"
          onChange={(rows) => update((next) => { next[key as ListKey] = rows; })}
        />
      ))}

      <FactorList title="Field relevance" rows={config.relevance} valueKey="factor" onChange={(rows) => update((next) => { next.relevance = rows; })} />
      <FactorList title="Unexplained gap" rows={config.gaps} valueKey="factor" onChange={(rows) => update((next) => { next.gaps = rows; })} />
      <FactorList title="Discipline publication multiplier" rows={config.disciplines} valueKey="multiplier" onChange={(rows) => update((next) => { next.disciplines = rows; })} />

      <KindList title="English tests" rows={config.englishTests} kinds={["ielts", "toefl", "pte", "duolingo", "moi", "none"]} onChange={(rows) => update((next) => { next.englishTests = rows; })} />
      <KindList title="Standardised tests" rows={config.standardisedTests} kinds={["gre", "gat", "none"]} onChange={(rows) => update((next) => { next.standardisedTests = rows; })} />

      <ListCard title="Target degrees" hint="MPhil applies the publication-gate relief.">
        {config.targetDegrees.map((row, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
            <input className="input-field !h-10" value={row.label} onChange={(event) => update((next) => { next.targetDegrees[index].label = event.target.value; })} />
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={row.mphil} onChange={(event) => update((next) => { next.targetDegrees[index].mphil = event.target.checked; })} />
              MPhil relief
            </label>
            <button type="button" className="text-sm font-bold text-error" onClick={() => update((next) => { next.targetDegrees.splice(index, 1); })}>Remove</button>
          </div>
        ))}
        <button type="button" className="text-sm font-bold text-primary" onClick={() => update((next) => { next.targetDegrees.push({ label: "New degree", mphil: false }); })}>Add degree</button>
      </ListCard>

      <ListCard title="Document checklist">
        {config.documents.map((row, index) => (
          <div key={row.key} className="grid gap-2 md:grid-cols-[1fr_auto]">
            <input className="input-field !h-10" value={row.label} onChange={(event) => update((next) => { next.documents[index].label = event.target.value; })} />
            <button type="button" className="text-sm font-bold text-error" onClick={() => update((next) => { next.documents.splice(index, 1); })}>Remove</button>
          </div>
        ))}
        <button type="button" className="text-sm font-bold text-primary" onClick={() => update((next) => { next.documents.push({ key: `document-${next.documents.length + 1}`, label: "New document" }); })}>Add document</button>
      </ListCard>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save lookups"}</button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}

function ListCard({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-card border border-slate-200 bg-white p-6">
      <h2 className="font-display text-xl">{title}</h2>
      {hint ? <p className="text-sm text-slate-600">{hint}</p> : null}
      {children}
    </section>
  );
}

function StepTable({ title, rows, onChange }: { title: string; rows: { min: number; value: number }[]; onChange: (rows: { min: number; value: number }[]) => void }) {
  return (
    <ListCard title={title} hint="Minimum score in the first column, converted value in the second. Keep rows in ascending order.">
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[160px_160px_auto]">
          <input type="number" step="0.1" className="input-field !h-10" value={row.min} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, min: Number(event.target.value) } : item))} />
          <input type="number" step="0.1" className="input-field !h-10" value={row.value} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, value: Number(event.target.value) } : item))} />
          <button type="button" className="text-sm font-bold text-error" onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
        </div>
      ))}
      <button type="button" className="text-sm font-bold text-primary" onClick={() => onChange([...rows, { min: 0, value: 0 }])}>Add row</button>
    </ListCard>
  );
}

function ScoreList({ title, rows, valueKey, onChange }: { title: string; rows: { label: string; score: number }[]; valueKey: "score"; onChange: (rows: { label: string; score: number }[]) => void }) {
  return (
    <ListCard title={title}>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
          <input className="input-field !h-10" value={row.label} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
          <input type="number" step="1" className="input-field !h-10" value={row[valueKey]} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, score: Number(event.target.value) } : item))} />
          <button type="button" className="text-sm font-bold text-error" onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
        </div>
      ))}
      <button type="button" className="text-sm font-bold text-primary" onClick={() => onChange([...rows, { label: "New option", score: 0 }])}>Add option</button>
    </ListCard>
  );
}

function FactorList<T extends { label: string }>({ title, rows, valueKey, onChange }: { title: string; rows: T[]; valueKey: "factor" | "multiplier"; onChange: (rows: T[]) => void }) {
  return (
    <ListCard title={title}>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
          <input className="input-field !h-10" value={row.label} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
          <input type="number" step="0.01" className="input-field !h-10" value={Number(row[valueKey as keyof T])} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, [valueKey]: Number(event.target.value) } : item))} />
          <button type="button" className="text-sm font-bold text-error" onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
        </div>
      ))}
      <button type="button" className="text-sm font-bold text-primary" onClick={() => onChange([...rows, { label: "New option", [valueKey]: 1 } as T])}>Add option</button>
    </ListCard>
  );
}

function KindList({ title, rows, kinds, onChange }: { title: string; rows: { label: string; kind: string }[]; kinds: string[]; onChange: (rows: { label: string; kind: string }[]) => void }) {
  return (
    <ListCard title={title}>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
          <input className="input-field !h-10" value={row.label} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
          <select className="input-field !h-10" value={row.kind} onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, kind: event.target.value } : item))}>
            {kinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
          </select>
          <button type="button" className="text-sm font-bold text-error" onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
        </div>
      ))}
      <button type="button" className="text-sm font-bold text-primary" onClick={() => onChange([...rows, { label: "New test", kind: kinds[0] }])}>Add option</button>
    </ListCard>
  );
}
