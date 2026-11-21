"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ScorecardConfigInput } from "@/lib/scholarships/types";

const SCORING_FIELDS: { key: keyof ScorecardConfigInput["scoring"]; label: string }[] = [
  { key: "cgpaFloor", label: "CGPA that scores 0" },
  { key: "cgpaCeiling", label: "CGPA that scores 100" },
  { key: "ieltsFloor", label: "IELTS equivalent that scores 0" },
  { key: "ieltsCeiling", label: "IELTS equivalent that scores 100" },
  { key: "greFloor", label: "GRE (Q+V) that scores 0" },
  { key: "greCeiling", label: "GRE (Q+V) that scores 100" },
  { key: "gatFloor", label: "GAT % that scores 0" },
  { key: "gatCeiling", label: "GAT % that scores 100" },
  { key: "experienceYearsForFull", label: "Years of experience for a full score" },
  { key: "pointsPerAward", label: "Points per award, patent, or grant" },
  { key: "publicationQ1", label: "Points per Q1/Q2 paper" },
  { key: "publicationOther", label: "Points per other indexed paper" },
  { key: "publicationConference", label: "Points per conference paper" },
  { key: "moiIelts", label: "IELTS equivalent for an MOI certificate" },
  { key: "ratingScale", label: "Auditor rating scale" },
  { key: "hostAcceptanceMinimum", label: "Supervisor score when host acceptance is required" },
];

export default function ScorecardRulesClient({ initialConfig }: { initialConfig: ScorecardConfigInput }) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const weightTotals = useMemo(
    () => [0, 1, 2].map((level) => config.criteria.reduce((sum, row) => sum + Number(row.weights[level] || 0), 0)),
    [config.criteria]
  );

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
      setMessage("Rules saved. The public calculator uses them now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="rounded-card border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-display text-xl">Stringency levels</h2>
        <div className="space-y-4">
          {config.levels.map((level, index) => (
            <div key={level.level} className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm font-bold">
                Name
                <input className="input-field mt-1" value={level.name} onChange={(event) => update((next) => { next.levels[index].name = event.target.value; })} />
              </label>
              <label className="block text-sm font-bold">
                Typical programs
                <input className="input-field mt-1" value={level.typicalPrograms} onChange={(event) => update((next) => { next.levels[index].typicalPrograms = event.target.value; })} />
              </label>
              <label className="block text-sm font-bold md:col-span-2">
                Meaning
                <textarea className="input-field mt-1 h-auto py-3" rows={2} value={level.meaning} onChange={(event) => update((next) => { next.levels[index].meaning = event.target.value; })} />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-slate-200 bg-white p-6">
        <h2 className="font-display text-xl">Criterion weights</h2>
        <p className="mt-1 text-sm text-slate-600">Each column must total 100. Totals now: {weightTotals.map((total, index) => `L${index + 1} ${total}`).join(" · ")}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-3">Criterion</th>
                <th className="py-2 pr-3">Level 1</th>
                <th className="py-2 pr-3">Level 2</th>
                <th className="py-2 pr-3">Level 3</th>
                <th className="py-2">How to improve</th>
              </tr>
            </thead>
            <tbody>
              {config.criteria.map((row, index) => (
                <tr key={row.key} className="border-t border-slate-200">
                  <td className="py-2 pr-3 font-bold">{row.label}</td>
                  {[0, 1, 2].map((level) => (
                    <td key={level} className="py-2 pr-3">
                      <input
                        type="number"
                        step="0.1"
                        className="input-field !h-10 w-24"
                        value={row.weights[level]}
                        onChange={(event) => update((next) => { next.criteria[index].weights[level as 0 | 1 | 2] = Number(event.target.value); })}
                      />
                    </td>
                  ))}
                  <td className="py-2">
                    <input className="input-field !h-10" value={row.howToImprove} onChange={(event) => update((next) => { next.criteria[index].howToImprove = event.target.value; })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-card border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-display text-xl">Mandatory gates</h2>
        <div className="space-y-4">
          {config.gates.map((gate, index) => (
            <div key={gate.key} className="grid gap-3 border-t border-slate-200 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[1.4fr_repeat(3,0.6fr)]">
              <label className="block text-sm font-bold">
                Gate
                <input className="input-field mt-1" value={gate.label} onChange={(event) => update((next) => { next.gates[index].label = event.target.value; })} />
              </label>
              {[0, 1, 2].map((level) => (
                <label key={level} className="block text-sm font-bold">
                  Level {level + 1} minimum
                  <input type="number" step="0.1" className="input-field mt-1" value={gate.minimums[level]} onChange={(event) => update((next) => { next.gates[index].minimums[level as 0 | 1 | 2] = Number(event.target.value); })} />
                </label>
              ))}
            </div>
          ))}
          <label className="block text-sm font-bold">
            MPhil publication-gate relief (multiplies gate 3 only)
            <input type="number" step="0.05" min="0" max="1" className="input-field mt-1 max-w-xs" value={config.mphilPublicationRelief} onChange={(event) => update((next) => { next.mphilPublicationRelief = Number(event.target.value); })} />
          </label>
        </div>
      </section>

      <section className="rounded-card border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-display text-xl">Result bands</h2>
        <div className="space-y-4">
          {config.bands.map((band, index) => (
            <div key={band.key} className="grid gap-3 border-t border-slate-200 pt-4 first:border-t-0 first:pt-0 md:grid-cols-3">
              <label className="block text-sm font-bold">
                Label
                <input className="input-field mt-1" value={band.label} onChange={(event) => update((next) => { next.bands[index].label = event.target.value; })} />
              </label>
              {band.thresholds ? [0, 1, 2].map((level) => (
                <label key={level} className="block text-sm font-bold">
                  Level {level + 1} minimum score
                  <input type="number" className="input-field mt-1" value={band.thresholds?.[level]} onChange={(event) => update((next) => { if (next.bands[index].thresholds) next.bands[index].thresholds[level as 0 | 1 | 2] = Number(event.target.value); })} />
                </label>
              )) : (
                <p className="text-sm text-slate-600 md:col-span-2 md:self-end">{band.key === "gate" ? "Used when any gate fails." : "Used when the score is below Borderline."}</p>
              )}
              <label className="block text-sm font-bold md:col-span-3">
                Recommended action
                <input className="input-field mt-1" value={band.action} onChange={(event) => update((next) => { next.bands[index].action = event.target.value; })} />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-display text-xl">Probability model</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(["pmax", "midpoint", "steepness"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <p className="text-sm font-bold">{key === "pmax" ? "Ceiling (Pmax)" : key === "midpoint" ? "Midpoint score" : "Steepness k"}</p>
              {[0, 1, 2].map((level) => (
                <label key={level} className="block text-xs font-bold text-slate-600">
                  Level {level + 1}
                  <input type="number" step="0.01" className="input-field mt-1" value={config.probability[key][level]} onChange={(event) => update((next) => { next.probability[key][level as 0 | 1 | 2] = Number(event.target.value); })} />
                </label>
              ))}
            </div>
          ))}
          {([
            ["gateFailMultiplier", "Multiplier when a gate fails"],
            ["cap", "Maximum country probability"],
            ["highAt", "High rating from"],
            ["moderateAt", "Moderate rating from"],
            ["lowAt", "Low rating from"],
          ] as const).map(([key, label]) => (
            <label key={key} className="block text-sm font-bold">
              {label}
              <input type="number" step="0.01" className="input-field mt-1" value={config.probability[key]} onChange={(event) => update((next) => { next.probability[key] = Number(event.target.value); })} />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-display text-xl">Scoring floors and points</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SCORING_FIELDS.map((field) => (
            <label key={field.key} className="block text-sm font-bold">
              {field.label}
              <input type="number" step="0.1" className="input-field mt-1" value={config.scoring[field.key]} onChange={(event) => update((next) => { next.scoring[field.key] = Number(event.target.value); })} />
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save rules"}</button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}
