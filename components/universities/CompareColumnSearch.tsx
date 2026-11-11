"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { cityLabel, FILTER_TYPES } from "@/lib/universities/catalog";
import { toCompareUniversity, type CompareUniversity } from "@/lib/universities/compare";

function typeLabel(type: string) {
  return FILTER_TYPES.find((item) => item.value === type)?.label || type;
}

export default function CompareColumnSearch({
  label,
  excludedIds,
  onSelect,
}: {
  label: string;
  excludedIds: string[];
  onSelect: (university: CompareUniversity) => void;
}) {
  const listId = useId().replace(/:/g, "");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CompareUniversity[]>([]);
  const [phase, setPhase] = useState<"idle" | "loading" | "ready">("idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [box, setBox] = useState<{ top: number; left: number; width: number } | null>(null);

  const visible = hits.filter((hit) => !excludedIds.includes(hit._id));
  const selected = visible.length ? Math.min(active, visible.length - 1) : 0;
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setHits([]);
      setPhase("idle");
      setOpen(false);
      setActive(0);
      return;
    }

    setOpen(true);
    setHits([]);
    setPhase("loading");
    setActive(0);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/universities?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { universities?: unknown[] };
        const next = Array.isArray(data.universities)
          ? data.universities.flatMap((item) => {
              const university = toCompareUniversity(item as CompareUniversity);
              return university ? [university] : [];
            })
          : [];
        setHits(next);
        setPhase("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setHits([]);
        setPhase("ready");
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  useEffect(() => {
    if (!open) return;
    function place() {
      const input = inputRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect();
      setBox({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 220) });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, visible.length, phase]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (inputRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const selectedId = visible[selected]?._id;

  useEffect(() => {
    if (!open || !selectedId) return;
    document.getElementById(`${listId}-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [open, selectedId, listId]);

  function choose(university: CompareUniversity) {
    onSelect(university);
    setQuery("");
    setHits([]);
    setPhase("idle");
    setOpen(false);
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!visible.length) return;
      setOpen(true);
      setActive((index) => (Math.min(index, visible.length - 1) + 1) % visible.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!visible.length) return;
      setOpen(true);
      setActive((index) => (Math.min(index, visible.length - 1) - 1 + visible.length) % visible.length);
    } else if (event.key === "Enter" && open && visible[selected]) {
      event.preventDefault();
      choose(visible[selected]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const list =
    open && box && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={{ top: box.top, left: box.left, width: box.width }}
            className="fixed z-[70] max-h-72 overflow-y-auto rounded-panel border border-slate-200 bg-white py-1 shadow-form-card"
          >
            {phase === "loading" && visible.length === 0 ? (
              <li className="px-3 py-3 text-[14px] text-slate-600">Searching…</li>
            ) : visible.length === 0 ? (
              <li className="px-3 py-3 text-[14px] text-slate-600">
                {hits.length ? "Already in another column." : "Nothing matched that search."}
              </li>
            ) : (
              visible.map((university, index) => {
                const isSelected = index === selected;
                return (
                  <li key={university._id} role="presentation">
                    <button
                      id={`${listId}-${university._id}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActive(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(university)}
                      className={`block w-full px-3 py-2 text-left ${isSelected ? "bg-primary-50" : "hover:bg-slate-50"}`}
                    >
                      <span className="block text-[15px] font-bold text-primary-900">{university.name}</span>
                      <span className="mt-0.5 block text-[13px] text-slate-600">
                        {[cityLabel(university.city), typeLabel(university.type)].filter(Boolean).join(" · ")}
                      </span>
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
    <div>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-bold text-slate-600">{label}</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="Name, city, field, scholarship, or keyword"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && visible[selected] ? `${listId}-${visible[selected]._id}` : undefined}
          autoComplete="off"
          className="h-11 w-full rounded-input border-[1.5px] border-primary-200 bg-white px-3 text-[16px] text-primary-900 outline-none placeholder:text-slate-600 focus:border-primary"
        />
      </label>
      {list}
    </div>
  );
}
