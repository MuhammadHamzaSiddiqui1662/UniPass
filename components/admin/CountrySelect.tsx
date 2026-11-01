"use client";

import { useMemo, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/data/countries";

export default function CountrySelect({
  code,
  name,
}: {
  code?: string;
  name?: string;
}) {
  const initial =
    COUNTRIES.find((country) => country.code === (code || "TR").toUpperCase()) ??
    (name ? COUNTRIES.find((country) => country.name === name) : undefined) ??
    DEFAULT_COUNTRY;
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? COUNTRIES.filter(
          (country) =>
            country.name.toLowerCase().includes(needle) || country.code.toLowerCase().includes(needle),
        )
      : COUNTRIES;
    return list.slice(0, 12);
  }, [query]);

  return (
    <div className="relative">
      <input type="hidden" name="country" value={selected.name} />
      <input type="hidden" name="countryCode" value={selected.code} />
      <span className="mb-1 block text-sm font-bold">Country</span>
      <button
        type="button"
        className="input-field flex items-center gap-3 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <img src={`/flags/${selected.code}.svg`} alt="" width={24} height={16} className="h-4 w-6 rounded-[2px] object-cover" />
        <span>
          {selected.name} <span className="text-slate-600">({selected.code})</span>
        </span>
      </button>
      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-input border border-primary-200 bg-white p-2 shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "Enter" && matches[0]) {
                event.preventDefault();
                setSelected(matches[0]);
                setOpen(false);
                setQuery("");
              }
            }}
            placeholder="Search by country or code"
            aria-label="Search countries"
            className="input-field mb-2"
          />
          <ul role="listbox" aria-label="Countries" className="max-h-64 overflow-y-auto">
            {matches.map((country) => (
              <li key={country.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={country.code === selected.code}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
                  onClick={() => {
                    setSelected(country);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <img src={`/flags/${country.code}.svg`} alt="" width={24} height={16} className="h-4 w-6 rounded-[2px] object-cover" />
                  <span className="font-bold text-primary-900">{country.name}</span>
                  <span className="text-slate-600">{country.code}</span>
                </button>
              </li>
            ))}
            {matches.length === 0 ? <li className="px-2 py-2 text-sm text-slate-600">No countries match.</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
