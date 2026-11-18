"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";

export type SliderUniversity = {
  id: string;
  name: string;
  city: string;
  featuredOnHome: boolean;
  homeOrder: number;
};

function AddUniversityCombobox({
  available,
  saving,
  onAdd,
}: {
  available: SliderUniversity[];
  saving: boolean;
  onAdd: (id: string) => void;
}) {
  const listId = useId().replace(/:/g, "");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [box, setBox] = useState<{
    left: number;
    width: number;
    maxHeight: number;
    top?: number;
    bottom?: number;
  } | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const matches = available.filter((item) => {
    if (!normalizedQuery) return true;
    return `${item.name} ${item.city}`.toLowerCase().includes(normalizedQuery);
  });
  const selected = matches.length ? Math.min(active, matches.length - 1) : 0;
  const selectedId = matches[selected]?.id;

  useEffect(() => {
    setActive(0);
  }, [normalizedQuery]);

  useEffect(() => {
    if (!listOpen) return;
    function place() {
      const input = inputRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect();
      const gap = 4;
      const preferred = 288;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openAbove = spaceBelow < preferred && spaceAbove > spaceBelow;
      const maxHeight = Math.min(preferred, Math.max(0, openAbove ? spaceAbove : spaceBelow));
      setBox({
        left: rect.left,
        width: rect.width,
        maxHeight,
        ...(openAbove
          ? { bottom: window.innerHeight - rect.top + gap }
          : { top: rect.bottom + gap }),
      });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [listOpen, matches.length]);

  useEffect(() => {
    if (!listOpen) return;
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (inputRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setListOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [listOpen]);

  useEffect(() => {
    if (!listOpen || !selectedId) return;
    document.getElementById(`${listId}-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [listOpen, selectedId, listId]);

  function choose(id: string) {
    onAdd(id);
    setQuery("");
    setListOpen(false);
    setActive(0);
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!listOpen) {
        setListOpen(true);
        setActive(0);
        return;
      }
      if (!matches.length) return;
      setActive((index) => (Math.min(index, matches.length - 1) + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!listOpen) {
        setListOpen(true);
        setActive(0);
        return;
      }
      if (!matches.length) return;
      setActive((index) => (Math.min(index, matches.length - 1) - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      if (listOpen && matches[selected]) {
        event.preventDefault();
        choose(matches[selected].id);
      }
    } else if (event.key === "Escape") {
      setListOpen(false);
    }
  }

  const list =
    listOpen && box && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={{
              top: box.top,
              bottom: box.bottom,
              left: box.left,
              width: box.width,
              maxHeight: box.maxHeight,
            }}
            className="fixed z-[70] overflow-y-auto rounded-panel border border-slate-200 bg-white py-1 shadow-form-card"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-3 text-[14px] text-slate-600">Nothing matched that search.</li>
            ) : (
              matches.map((item, index) => {
                const isSelected = index === selected;
                return (
                  <li key={item.id} role="presentation">
                    <button
                      id={`${listId}-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActive(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(item.id)}
                      className={`block w-full px-3 py-2 text-left ${isSelected ? "bg-primary-50" : "hover:bg-slate-50"}`}
                    >
                      <span className="block truncate text-[15px] font-bold text-primary-900">{item.name}</span>
                      {item.city ? (
                        <span className="mt-0.5 block truncate text-[13px] text-slate-600">{item.city}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>,
          document.body,
        )
      : null;

  return (
    <>
      <label htmlFor="home-slider-filter" className="block text-sm font-bold text-primary-900">
        Add a university
      </label>
      <input
        ref={inputRef}
        id="home-slider-filter"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setListOpen(true);
        }}
        onFocus={() => setListOpen(true)}
        onClick={() => setListOpen(true)}
        onKeyDown={onInputKeyDown}
        placeholder="Filter by name or city"
        role="combobox"
        aria-expanded={listOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={listOpen && selectedId ? `${listId}-${selectedId}` : undefined}
        className="input-field"
        autoComplete="off"
        disabled={saving}
      />
      {list}
    </>
  );
}

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
            <AddUniversityCombobox available={available} saving={saving} onAdd={onAdd} />
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
