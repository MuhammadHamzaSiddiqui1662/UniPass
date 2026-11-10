"use client";

import { useState } from "react";
import type { DetailFact } from "@/lib/universities/details";

export default function KeyFacts({ facts }: { facts: DetailFact[] }) {
  const [open, setOpen] = useState(false);
  const primary = facts.filter((fact) => fact.primary);
  const secondary = facts.filter((fact) => !fact.primary);
  const rows = open ? [...pairFacts(primary), ...pairFacts(secondary)] : pairFacts(primary);

  return (
    <>
      <dl className="mt-4">
        {rows.map((row, index) => (
          <div
            key={row.map((fact) => fact.label).join("-")}
            className={
              index === rows.length - 1
                ? "pt-4 first:pt-2"
                : "border-b border-slate-200 py-4 first:pt-2"
            }
          >
            <div className={row.length === 2 ? "grid grid-cols-2 gap-4" : undefined}>
              {row.map((fact, factIndex) => (
                <div
                  key={fact.label}
                  className={factIndex === 1 ? "border-l border-slate-200 pl-4" : undefined}
                >
                  <dt className="text-[13px] font-bold text-slate-600">{fact.label}</dt>
                  <dd className="mt-1 text-[15px] text-primary-900">
                    {fact.href ? (
                      <a
                        href={fact.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all hover:underline"
                      >
                        {fact.value}
                      </a>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </dl>
      {secondary.length > 0 && (
        <button
          type="button"
          className="mt-4 text-[15px] font-bold text-primary hover:underline"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
}

function pairFacts(facts: DetailFact[]) {
  const rows: DetailFact[][] = [];
  for (let index = 0; index < facts.length; index += 1) {
    const current = facts[index];
    const next = facts[index + 1];
    if (current.compact && next?.compact) {
      rows.push([current, next]);
      index += 1;
    } else {
      rows.push([current]);
    }
  }
  return rows;
}
