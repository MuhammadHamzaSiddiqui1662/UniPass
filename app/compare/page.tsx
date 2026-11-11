"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CompareColumnSearch from "@/components/universities/CompareColumnSearch";
import { cityLabel, FILTER_TYPES } from "@/lib/universities/catalog";
import { toCompareUniversity, type CompareUniversity } from "@/lib/universities/compare";
import {
  COMPARE_SLOT_COUNT,
  readCompareSlots,
  setCompareSlot,
  writeCompareSlots,
  type CompareSlots,
} from "@/lib/universities/saved";

function typeLabel(type: string) {
  return FILTER_TYPES.find((item) => item.value === type)?.label || type;
}

function tuitionText(university: CompareUniversity) {
  if (university.tuitionFrom == null) return "—";
  const from = `$${university.tuitionFrom.toLocaleString()}`;
  if (university.tuitionTo == null) return from;
  return `${from} - $${university.tuitionTo.toLocaleString()}`;
}

function listText(values: string[]) {
  return values.length ? values.join(", ") : "—";
}

const ROWS: { label: string; value: (university: CompareUniversity) => string }[] = [
  { label: "Type", value: (university) => typeLabel(university.type) || "—" },
  { label: "City", value: (university) => cityLabel(university.city) || "—" },
  { label: "Tuition (USD/year)", value: tuitionText },
  { label: "Fields Offered", value: (university) => listText(university.fields) },
  { label: "Levels", value: (university) => listText(university.levels) },
  { label: "Merit Scholarship", value: (university) => (university.hasMeritScholarship ? "Yes" : "No") },
];

export default function ComparePage() {
  const [slots, setSlots] = useState<CompareSlots>(Array.from({ length: COMPARE_SLOT_COUNT }, () => null));
  const [universities, setUniversities] = useState<Record<string, CompareUniversity>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readCompareSlots();
    setSlots(stored);
    const ids = stored.filter((id): id is string => Boolean(id));
    if (!ids.length) {
      setReady(true);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/universities?ids=${ids.join(",")}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { universities?: unknown[] }) => {
        const next: Record<string, CompareUniversity> = {};
        for (const item of data.universities || []) {
          const university = toCompareUniversity(item as CompareUniversity);
          if (university) next[university._id] = university;
        }
        setUniversities(next);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") console.error(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setReady(true);
      });

    return () => controller.abort();
  }, []);

  function updateSlot(index: number, university: CompareUniversity | null) {
    const next = setCompareSlot(slots, index, university?._id ?? null);
    writeCompareSlots(next);
    setSlots(next);
    if (university) {
      setUniversities((current) => ({ ...current, [university._id]: university }));
    }
  }

  return (
    <>
      <Header />
      <main className="pt-32">
        <section className="bg-slate-50 py-16">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-6">Compare Universities</h1>
            <p className="mb-8 max-w-3xl text-lg text-slate-600">
              Compare up to 3 universities. Search each column by name, city, field, scholarship, or keyword.
            </p>

            <div className="overflow-x-auto rounded-card border border-slate-200 bg-white">
              <table className="min-w-full">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="sticky left-0 z-10 bg-primary-50 px-6 py-4 text-left text-sm font-bold">
                      Feature
                    </th>
                    {slots.map((slot, index) => {
                      const university = slot ? universities[slot] : undefined;
                      const excludedIds = slots.filter(
                        (id, slotIndex): id is string => slotIndex !== index && Boolean(id),
                      );
                      return (
                        <th key={index} className="min-w-[260px] px-4 py-4 text-left align-top font-normal">
                          <CompareColumnSearch
                            label={`University ${index + 1}`}
                            excludedIds={excludedIds}
                            onSelect={(selected) => updateSlot(index, selected)}
                          />
                          {university ? (
                            <div className="mt-3">
                              <div className="font-bold text-primary-900">{university.name}</div>
                              <button
                                type="button"
                                onClick={() => updateSlot(index, null)}
                                className="mt-1 text-xs font-bold text-error hover:underline"
                              >
                                Clear
                              </button>
                            </div>
                          ) : slot && !ready ? (
                            <p className="mt-3 text-sm text-slate-600">Loading…</p>
                          ) : slot ? (
                            <div className="mt-3">
                              <p className="text-sm text-slate-600">This university is no longer available.</p>
                              <button
                                type="button"
                                onClick={() => updateSlot(index, null)}
                                className="mt-1 text-xs font-bold text-error hover:underline"
                              >
                                Clear
                              </button>
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-slate-600">Add a university</p>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ROWS.map((row) => (
                    <tr key={row.label}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-white px-6 py-4 text-left text-sm font-bold"
                      >
                        {row.label}
                      </th>
                      {slots.map((slot, index) => {
                        const university = slot ? universities[slot] : undefined;
                        return (
                          <td key={index} className="px-6 py-4 text-sm text-primary-900">
                            {university ? row.value(university) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="sticky left-0 z-10 bg-white px-6 py-4 text-left text-sm font-bold">
                      Details
                    </th>
                    {slots.map((slot, index) => {
                      const university = slot ? universities[slot] : undefined;
                      return (
                        <td key={index} className="px-6 py-4">
                          {university ? (
                            <Link href={`/universities/${university.slug}`} className="btn-outline px-4 py-2 text-sm">
                              View Details
                            </Link>
                          ) : (
                            <span className="text-sm text-primary-900">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <Link href="/universities" className="mt-6 inline-block text-[15px] font-bold text-primary hover:underline">
              Browse all universities
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
