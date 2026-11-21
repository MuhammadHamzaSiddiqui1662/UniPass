"use client";

import { useState, type ReactNode } from "react";
import type { CountryOutlookInput } from "@/lib/scholarships/types";

type CountryRecord = CountryOutlookInput & { _id: string };

const EMPTY: CountryOutlookInput = {
  order: 100,
  country: "",
  summary: "",
  tier1Share: 0.34,
  tier2Share: 0.33,
  tier3Share: 0.33,
  accessFactor: 1,
  status: "published",
};

export default function ScorecardCountriesClient({ initialCountries }: { initialCountries: CountryRecord[] }) {
  const [countries, setCountries] = useState(initialCountries);
  const [draft, setDraft] = useState<CountryOutlookInput>({ ...EMPTY, order: initialCountries.length + 1 });
  const [message, setMessage] = useState("");

  async function createCountry() {
    setMessage("");
    const response = await fetch("/api/admin/scholarship-calculator/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not add the country");
      return;
    }
    setCountries((current) => [...current, data.country].sort((a, b) => a.order - b.order));
    setDraft({ ...EMPTY, order: draft.order + 1 });
    setMessage("Country added.");
  }

  async function saveCountry(country: CountryRecord) {
    setMessage("");
    const response = await fetch(`/api/admin/scholarship-calculator/countries/${country._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(countryPayload(country)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save the country");
      return;
    }
    setCountries((current) => current.map((item) => (item._id === country._id ? data.country : item)));
    setMessage("Country saved.");
  }

  async function removeCountry(id: string) {
    if (!window.confirm("Delete this country?")) return;
    const response = await fetch(`/api/admin/scholarship-calculator/countries/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Could not delete the country");
      return;
    }
    setCountries((current) => current.filter((item) => item._id !== id));
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <details className="rounded-card border border-slate-200 bg-white p-6" open>
        <summary className="cursor-pointer font-display text-xl">Add a country</summary>
        <div className="mt-4">
          <CountryFields value={draft} onChange={setDraft} />
          <button type="button" className="btn-primary mt-4" onClick={createCountry}>Add country</button>
        </div>
      </details>
      {countries.map((country) => {
        const shareTotal = Number(country.tier1Share) + Number(country.tier2Share) + Number(country.tier3Share);
        return (
          <details key={country._id} className="rounded-card border border-slate-200 bg-white p-6">
            <summary className="cursor-pointer font-bold text-primary-900">
              {country.country} <span className="font-normal text-slate-600">· shares {shareTotal.toFixed(2)} · {country.status}</span>
            </summary>
            <div className="mt-4">
              <CountryFields value={country} onChange={(next) => setCountries((current) => current.map((item) => item._id === country._id ? { ...item, ...next } : item))} />
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="btn-primary" onClick={() => saveCountry(country)}>Save</button>
                <button type="button" className="btn-outline" onClick={() => saveCountry({ ...country, status: country.status === "published" ? "draft" : "published" })}>
                  {country.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button type="button" className="btn-danger" onClick={() => removeCountry(country._id)}>Delete</button>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function countryPayload(country: CountryRecord): CountryOutlookInput {
  return {
    order: Number(country.order),
    country: country.country,
    summary: country.summary || "",
    tier1Share: Number(country.tier1Share),
    tier2Share: Number(country.tier2Share),
    tier3Share: Number(country.tier3Share),
    accessFactor: Number(country.accessFactor),
    status: country.status,
  };
}

function CountryFields({ value, onChange }: { value: CountryOutlookInput; onChange: (next: CountryOutlookInput) => void }) {
  function set<K extends keyof CountryOutlookInput>(key: K, next: CountryOutlookInput[K]) {
    onChange({ ...value, [key]: next });
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Order"><input type="number" className="input-field" value={value.order} onChange={(event) => set("order", Number(event.target.value))} /></Field>
      <Field label="Status">
        <select className="input-field" value={value.status} onChange={(event) => set("status", event.target.value as CountryOutlookInput["status"])}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </Field>
      <Field label="Country"><input className="input-field" value={value.country} onChange={(event) => set("country", event.target.value)} /></Field>
      <Field label="Pakistan access factor"><input type="number" step="0.05" className="input-field" value={value.accessFactor} onChange={(event) => set("accessFactor", Number(event.target.value))} /></Field>
      <Field label="Accessible share"><input type="number" step="0.01" className="input-field" value={value.tier1Share} onChange={(event) => set("tier1Share", Number(event.target.value))} /></Field>
      <Field label="Competitive share"><input type="number" step="0.01" className="input-field" value={value.tier2Share} onChange={(event) => set("tier2Share", Number(event.target.value))} /></Field>
      <Field label="Elite share"><input type="number" step="0.01" className="input-field" value={value.tier3Share} onChange={(event) => set("tier3Share", Number(event.target.value))} /></Field>
      <Field label="Main funding routes">
        <textarea className="input-field h-auto py-3" rows={2} value={value.summary} onChange={(event) => set("summary", event.target.value)} />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <div className="mt-1 font-normal">{children}</div>
    </label>
  );
}
