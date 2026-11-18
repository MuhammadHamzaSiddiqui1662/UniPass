"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CompareColumnSearch from "@/components/universities/CompareColumnSearch";
import {
  COMPARE_EMPTY,
  toCompareUniversity,
  visibleCompareRows,
  type CompareUniversity,
} from "@/lib/universities/compare";
import {
  COMPARE_SLOT_COUNT,
  readCompareSlots,
  setCompareSlot,
  writeCompareSlots,
  type CompareSlots,
} from "@/lib/universities/saved";

export default function ComparePage() {
  const [slots, setSlots] = useState<CompareSlots>(Array.from({ length: COMPARE_SLOT_COUNT }, () => null));
  const [universities, setUniversities] = useState<Record<string, CompareUniversity>>({});
  const [ready, setReady] = useState(false);
  const [printedOn, setPrintedOn] = useState("");

  useEffect(() => {
    setPrintedOn(
      new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    );
  }, []);

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

  const selected = slots.map((slot) => (slot ? universities[slot] : undefined));
  const rows = visibleCompareRows(selected);
  const canPrint = ready && selected.some(Boolean);

  function printReport() {
    const names = selected.flatMap((university) => (university ? [university.name] : []));
    const previous = document.title;
    document.title = names.length ? `UniPass comparison - ${names.join(", ")}` : "UniPass comparison";
    const restore = () => {
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  }

  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>
      <main className="pt-32 print:pt-0">
        <section className="bg-slate-50 py-16 print:bg-white print:py-0">
          <div className="container-1200 print:max-w-none print:px-0">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 print:mb-4">
              <div>
                <h1 className="text-h1-detail mb-6 print:mb-1 print:text-[28px] print:leading-tight">
                  Compare Universities
                </h1>
                <p className="max-w-3xl text-lg text-slate-600 print:hidden">
                  Compare up to 3 universities. Search each column by name, city, field, scholarship, or keyword.
                </p>
                <p className="hidden text-sm text-slate-600 print:block">
                  {printedOn ? `University comparison · ${printedOn}` : "University comparison"}
                </p>
              </div>
              <button
                type="button"
                onClick={printReport}
                disabled={!canPrint}
                title={canPrint ? "Open the print dialog and choose Save as PDF" : "Add a university before saving a PDF"}
                className="btn-outline px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
              >
                Save as PDF
              </button>
            </div>

            <div className="compare-report overflow-x-auto rounded-card border border-slate-200 bg-white print:overflow-visible print:rounded-none">
              <table className="min-w-full print:w-full print:table-fixed print:text-xs">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="sticky left-0 z-10 w-[168px] bg-primary-50 px-6 py-4 text-left text-sm font-bold print:static print:w-[18%] print:px-3 print:py-2 print:text-xs">
                      Feature
                    </th>
                    {slots.map((slot, index) => {
                      const university = slot ? universities[slot] : undefined;
                      const excludedIds = slots.filter(
                        (id, slotIndex): id is string => slotIndex !== index && Boolean(id),
                      );
                      return (
                        <th
                          key={index}
                          className={`min-w-[260px] px-4 py-4 text-left align-top font-normal print:min-w-0 print:px-3 print:py-2 ${
                            slot ? "" : "print:hidden"
                          }`}
                        >
                          <div className="print:hidden">
                            <CompareColumnSearch
                              label={`University ${index + 1}`}
                              excludedIds={excludedIds}
                              onSelect={(selectedUniversity) => updateSlot(index, selectedUniversity)}
                            />
                          </div>
                          {university ? (
                            <div className="mt-3 print:mt-0">
                              <div className="font-bold text-primary-900">{university.name}</div>
                              <button
                                type="button"
                                onClick={() => updateSlot(index, null)}
                                className="mt-1 text-xs font-bold text-error hover:underline print:hidden"
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
                                className="mt-1 text-xs font-bold text-error hover:underline print:hidden"
                              >
                                Clear
                              </button>
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-slate-600 print:hidden">Add a university</p>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-white px-6 py-4 text-left text-sm font-bold print:static print:px-3 print:py-2 print:text-xs"
                      >
                        {row.label}
                      </th>
                      {slots.map((slot, index) => {
                        const university = slot ? universities[slot] : undefined;
                        const text = university ? row.value(university) : COMPARE_EMPTY;
                        const href = university && text !== COMPARE_EMPTY ? row.href?.(university) : undefined;
                        return (
                          <td
                            key={index}
                            className={`whitespace-pre-line px-6 py-4 text-sm text-primary-900 print:px-3 print:py-2 print:text-xs ${
                              slot ? "" : "print:hidden"
                            }`}
                          >
                            {href ? (
                              <a href={href} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">
                                {text}
                              </a>
                            ) : (
                              text
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="print:hidden">
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
                            <span className="text-sm text-primary-900">{COMPARE_EMPTY}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 hidden text-xs text-slate-600 print:block">
              {printedOn ? `Prepared ${printedOn} on UniPass. ` : "Prepared on UniPass. "}
              Figures are the published university record and can change.
            </p>

            <Link href="/universities" className="mt-6 inline-block text-[15px] font-bold text-primary hover:underline print:hidden">
              Browse all universities
            </Link>
          </div>
        </section>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
