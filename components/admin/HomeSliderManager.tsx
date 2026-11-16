"use client";

import { useState } from "react";

export type SliderUniversity = {
  id: string;
  name: string;
  city: string;
  featuredOnHome: boolean;
  homeOrder: number;
};

type HomeSliderManagerProps = {
  featured: SliderUniversity[];
  available: SliderUniversity[];
  saving: boolean;
  message: string;
  error: string;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onAdd: (id: string) => void;
  onSave: () => void;
};

export default function HomeSliderManager({
  featured,
  available,
  saving,
  message,
  error,
  onMove,
  onRemove,
  onAdd,
  onSave,
}: HomeSliderManagerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const matches = available.filter((item) => {
    if (!normalizedQuery) return true;
    return `${item.name} ${item.city}`.toLowerCase().includes(normalizedQuery);
  });

  const addUniversity = (id: string) => {
    if (!id) return;
    onAdd(id);
    setQuery("");
  };

  return (
    <section className="rounded-card border border-slate-200 bg-white lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left lg:hidden"
        aria-expanded={open}
        aria-controls="home-slider-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="font-display text-base text-primary-900">Home slider · {featured.length}</span>
        <span className="text-sm font-bold text-primary">{open ? "Hide" : "Edit"}</span>
      </button>

      <div id="home-slider-panel" className={open ? "border-t border-slate-200 p-4 lg:border-t-0 lg:p-5" : "hidden lg:block lg:p-5"}>
        <div className="hidden lg:block">
          <h2 className="font-display text-xl text-primary-900">Home slider</h2>
          <p className="mt-1 text-sm text-slate-600">
            Published universities on the home page, in the order they appear.
          </p>
        </div>

        {featured.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No universities are on the home slider. The home page will show the first three published universities.
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-slate-200">
            {featured.map((item, index) => (
              <li key={item.id} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary-900" title={item.name}>
                      {index + 1}. {item.name}
                    </p>
                    <p className="truncate text-xs text-slate-600">{item.city}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-sm font-bold text-slate-600 hover:text-error disabled:opacity-40"
                    onClick={() => onRemove(item.id)}
                    disabled={saving}
                    aria-label={`Remove ${item.name} from the home slider`}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded-input border border-primary-200 px-3 py-1 text-sm font-bold text-primary disabled:opacity-40"
                    disabled={saving || index === 0}
                    onClick={() => onMove(item.id, -1)}
                    aria-label={`Move ${item.name} earlier`}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="rounded-input border border-primary-200 px-3 py-1 text-sm font-bold text-primary disabled:opacity-40"
                    disabled={saving || index === featured.length - 1}
                    onClick={() => onMove(item.id, 1)}
                    aria-label={`Move ${item.name} later`}
                  >
                    Down
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-4 space-y-2">
          {available.length === 0 ? (
            <p className="text-sm text-slate-600">
              {featured.length === 0
                ? "Publish a university before adding it to the slider."
                : "Every published university is already on the slider."}
            </p>
          ) : (
            <>
              <label htmlFor="home-slider-filter" className="block text-sm font-bold text-primary-900">
                Add a university
              </label>
              <input
                id="home-slider-filter"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by name or city"
                className="input-field"
                autoComplete="off"
                disabled={saving}
              />
              <select
                className="input-field"
                value=""
                disabled={saving || matches.length === 0}
                aria-label="Add a published university to the home slider"
                onChange={(event) => addUniversity(event.target.value)}
              >
                <option value="">{matches.length === 0 ? "No matches" : "Choose a university"}</option>
                {matches.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.city ? ` — ${item.city}` : ""}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {message ? <p className="mt-3 text-sm font-bold text-primary">{message}</p> : null}
        {error ? <p className="mt-3 text-sm font-bold text-error">{error}</p> : null}

        <button
          type="button"
          className="btn-primary mt-4 h-11 w-full px-5 text-[15px] disabled:opacity-50"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save slider"}
        </button>
      </div>
    </section>
  );
}
