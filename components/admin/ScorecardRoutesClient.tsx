"use client";

import { useState, type ReactNode } from "react";
import type { FundingRouteInput } from "@/lib/scholarships/types";

type RouteRecord = FundingRouteInput & { _id: string };

const EMPTY: FundingRouteInput = {
  order: 100,
  name: "",
  country: "",
  hosts: "",
  degreeLevel: "PhD",
  stringency: 2,
  coverage: "",
  minCgpa: 3,
  minEnglish: 6.5,
  minPublicationPoints: 0,
  maxAge: null,
  hostAcceptance: "Varies",
  notes: "",
  officialUrl: "",
  status: "published",
};

export default function ScorecardRoutesClient({ initialRoutes }: { initialRoutes: RouteRecord[] }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [draft, setDraft] = useState<FundingRouteInput>({ ...EMPTY, order: initialRoutes.length + 1 });
  const [message, setMessage] = useState("");

  async function createRoute() {
    setMessage("");
    const response = await fetch("/api/admin/scholarship-calculator/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not add the route");
      return;
    }
    setRoutes((current) => [...current, data.route].sort((a, b) => a.order - b.order));
    setDraft({ ...EMPTY, order: draft.order + 1 });
    setMessage("Route added.");
  }

  async function saveRoute(route: RouteRecord) {
    setMessage("");
    const response = await fetch(`/api/admin/scholarship-calculator/routes/${route._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(routePayload(route)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save the route");
      return;
    }
    setRoutes((current) => current.map((item) => (item._id === route._id ? data.route : item)));
    setMessage("Route saved.");
  }

  async function removeRoute(id: string) {
    if (!window.confirm("Delete this funding route?")) return;
    const response = await fetch(`/api/admin/scholarship-calculator/routes/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Could not delete the route");
      return;
    }
    setRoutes((current) => current.filter((item) => item._id !== id));
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <details className="rounded-card border border-slate-200 bg-white p-6" open>
        <summary className="cursor-pointer font-display text-xl">Add a route</summary>
        <div className="mt-4">
          <RouteFields value={draft} onChange={setDraft} />
          <button type="button" className="btn-primary mt-4" onClick={createRoute}>Add route</button>
        </div>
      </details>
      {routes.map((route) => (
        <details key={route._id} className="rounded-card border border-slate-200 bg-white p-6">
          <summary className="cursor-pointer font-bold text-primary-900">
            {route.order}. {route.name} <span className="font-normal text-slate-600">· {route.country} · {route.status}</span>
          </summary>
          <div className="mt-4">
            <RouteFields value={route} onChange={(next) => setRoutes((current) => current.map((item) => item._id === route._id ? { ...item, ...next } : item))} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => saveRoute(route)}>Save</button>
              <button type="button" className="btn-outline" onClick={() => saveRoute({ ...route, status: route.status === "published" ? "draft" : "published" })}>
                {route.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="btn-danger" onClick={() => removeRoute(route._id)}>Delete</button>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function routePayload(route: RouteRecord): FundingRouteInput {
  return {
    order: Number(route.order),
    name: route.name,
    country: route.country,
    hosts: route.hosts || "",
    degreeLevel: route.degreeLevel,
    stringency: Number(route.stringency),
    coverage: route.coverage || "",
    minCgpa: Number(route.minCgpa),
    minEnglish: Number(route.minEnglish),
    minPublicationPoints: Number(route.minPublicationPoints),
    maxAge: route.maxAge === null || route.maxAge === undefined || Number.isNaN(Number(route.maxAge)) ? null : Number(route.maxAge),
    hostAcceptance: route.hostAcceptance,
    notes: route.notes || "",
    officialUrl: route.officialUrl || "",
    status: route.status,
  };
}

function RouteFields({ value, onChange }: { value: FundingRouteInput; onChange: (next: FundingRouteInput) => void }) {
  function set<K extends keyof FundingRouteInput>(key: K, next: FundingRouteInput[K]) {
    onChange({ ...value, [key]: next });
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Order"><input type="number" className="input-field" value={value.order} onChange={(event) => set("order", Number(event.target.value))} /></Field>
      <Field label="Status">
        <select className="input-field" value={value.status} onChange={(event) => set("status", event.target.value as FundingRouteInput["status"])}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </Field>
      <Field label="Name"><input className="input-field" value={value.name} onChange={(event) => set("name", event.target.value)} /></Field>
      <Field label="Country"><input className="input-field" value={value.country} onChange={(event) => set("country", event.target.value)} /></Field>
      <Field label="Host universities"><input className="input-field" value={value.hosts} onChange={(event) => set("hosts", event.target.value)} /></Field>
      <Field label="Degree level text"><input className="input-field" value={value.degreeLevel} onChange={(event) => set("degreeLevel", event.target.value)} /></Field>
      <Field label="Stringency (1-3)"><input type="number" min={1} max={3} className="input-field" value={value.stringency} onChange={(event) => set("stringency", Number(event.target.value))} /></Field>
      <Field label="Host acceptance">
        <select className="input-field" value={value.hostAcceptance} onChange={(event) => set("hostAcceptance", event.target.value)}>
          <option>Yes</option>
          <option>No</option>
          <option>Varies</option>
        </select>
      </Field>
      <Field label="Minimum CGPA (4.0)"><input type="number" step="0.1" className="input-field" value={value.minCgpa} onChange={(event) => set("minCgpa", Number(event.target.value))} /></Field>
      <Field label="Minimum English (IELTS)"><input type="number" step="0.1" className="input-field" value={value.minEnglish} onChange={(event) => set("minEnglish", Number(event.target.value))} /></Field>
      <Field label="Minimum publication points"><input type="number" className="input-field" value={value.minPublicationPoints} onChange={(event) => set("minPublicationPoints", Number(event.target.value))} /></Field>
      <Field label="Maximum age (blank = none)">
        <input type="number" className="input-field" value={value.maxAge ?? ""} onChange={(event) => set("maxAge", event.target.value === "" ? null : Number(event.target.value))} />
      </Field>
      <Field label="Coverage"><input className="input-field" value={value.coverage} onChange={(event) => set("coverage", event.target.value)} /></Field>
      <Field label="Official source"><input className="input-field" value={value.officialUrl} onChange={(event) => set("officialUrl", event.target.value)} /></Field>
      <Field label="Notes">
        <textarea className="input-field h-auto py-3" rows={3} value={value.notes} onChange={(event) => set("notes", event.target.value)} />
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
