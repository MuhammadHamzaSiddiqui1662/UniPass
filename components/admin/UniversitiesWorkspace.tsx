"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeSliderManager, { type SliderUniversity } from "@/components/admin/HomeSliderManager";

export type AdminUniversity = {
  id: string;
  name: string;
  slug: string;
  city: string;
  type: string;
  status: string;
  featuredOnHome: boolean;
  homeOrder: number;
};

function initialSliderItems(universities: AdminUniversity[]): SliderUniversity[] {
  return universities
    .filter((university) => university.status === "published")
    .map((university) => ({
      id: university.id,
      name: university.name,
      city: university.city,
      featuredOnHome: university.featuredOnHome,
      homeOrder: university.homeOrder,
    }))
    .sort((a, b) => {
      if (a.featuredOnHome !== b.featuredOnHome) return a.featuredOnHome ? -1 : 1;
      if (a.featuredOnHome) return a.homeOrder - b.homeOrder || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
}

function arrange(featured: SliderUniversity[], hidden: SliderUniversity[]) {
  return [
    ...featured,
    ...[...hidden].sort((a, b) => a.name.localeCompare(b.name)),
  ];
}

function withFeatured(items: SliderUniversity[], id: string, featuredOnHome: boolean) {
  const next = items.map((item) => (item.id === id ? { ...item, featuredOnHome } : item));
  const featured = next.filter((item) => item.featuredOnHome && item.id !== id);
  const target = next.find((item) => item.id === id);
  const ordered = featuredOnHome && target ? [...featured, target] : featured;
  return arrange(ordered, next.filter((item) => !item.featuredOnHome));
}

function moveFeatured(items: SliderUniversity[], id: string, direction: -1 | 1) {
  const featured = items.filter((item) => item.featuredOnHome);
  const from = featured.findIndex((item) => item.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= featured.length) return items;
  const next = [...featured];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return arrange(next, items.filter((item) => !item.featuredOnHome));
}

export default function UniversitiesWorkspace({ universities }: { universities: AdminUniversity[] }) {
  const router = useRouter();
  const [items, setItems] = useState(() => initialSliderItems(universities));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const featured = items.filter((item) => item.featuredOnHome);
  const available = items.filter((item) => !item.featuredOnHome);
  const slideNumber = new Map(featured.map((item, index) => [item.id, index + 1]));

  const edit = (recipe: (current: SliderUniversity[]) => SliderUniversity[]) => {
    setMessage("");
    setError("");
    setItems(recipe);
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    const chosen = items.filter((item) => item.featuredOnHome);
    const payload = items.map((item) => ({
      id: item.id,
      featuredOnHome: item.featuredOnHome,
      homeOrder: item.featuredOnHome ? chosen.findIndex((row) => row.id === item.id) + 1 : 0,
    }));
    try {
      const response = await fetch("/api/admin/universities/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      if (!response.ok) throw new Error("Could not save the home slider");
      setMessage("Home slider saved.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the home slider");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-display">Universities ({universities.length})</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/universities/import" className="btn-outline">
            Bulk import
          </Link>
          <Link href="/admin/universities/new" className="btn-primary">
            Add University
          </Link>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <HomeSliderManager
          featured={featured}
          available={available}
          saving={saving}
          message={message}
          error={error}
          onMove={(id, direction) => edit((current) => moveFeatured(current, id, direction))}
          onRemove={(id) => edit((current) => withFeatured(current, id, false))}
          onAdd={(id) => edit((current) => withFeatured(current, id, true))}
          onSave={save}
        />

        <div className="min-w-0 overflow-hidden rounded-card border border-slate-200 bg-white lg:col-start-1 lg:row-start-1">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-600">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-600">City</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-600">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-600">Home</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {universities.map((university) => {
                  const slide = slideNumber.get(university.id);
                  const published = university.status === "published";
                  return (
                    <tr key={university.id} className="hover:bg-primary-50/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-primary-900">{university.name}</div>
                        <div className="text-xs text-slate-600">{university.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary-900">{university.city}</td>
                      <td className="px-6 py-4 text-sm text-primary-900">{university.type}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`chip ${
                            published ? "bg-success-tint text-primary-800" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {university.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {published ? (
                          <button
                            type="button"
                            className={
                              slide
                                ? "chip chip-tint cursor-pointer border-0"
                                : "text-sm font-bold text-primary hover:underline disabled:opacity-40"
                            }
                            aria-pressed={Boolean(slide)}
                            aria-label={
                              slide
                                ? `Remove ${university.name} from the home slider`
                                : `Add ${university.name} to the home slider`
                            }
                            disabled={saving}
                            onClick={() => edit((current) => withFeatured(current, university.id, !slide))}
                          >
                            {slide ? `Slide ${slide}` : "Add"}
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/universities/${university.id}/edit`}
                          className="mr-4 text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/universities/${university.slug}`}
                          target="_blank"
                          className="text-slate-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {universities.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-600">No universities yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
