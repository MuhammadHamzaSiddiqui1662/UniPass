"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";

export type GlobalSearchHit = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export type GlobalSearchGroup = {
  key: string;
  label: string;
  hits: GlobalSearchHit[];
};

export function SearchIconButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-primary-900 transition-colors hover:bg-slate-50 ${className}`}
      aria-label="Search"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="11" cy="11" r="7" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const listId = useId().replace(/:/g, "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GlobalSearchGroup[]>([]);
  const [phase, setPhase] = useState<"idle" | "loading" | "ready">("idle");
  const [active, setActive] = useState(0);

  const hits = useMemo(() => groups.flatMap((group) => group.hits), [groups]);
  const selected = hits.length ? Math.min(active, hits.length - 1) : 0;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previous;
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !hits[selected]) return;
    document.getElementById(`${listId}-${hits[selected].id}`)?.scrollIntoView({ block: "nearest" });
  }, [open, hits, selected, listId]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setGroups([]);
      setPhase("idle");
      setActive(0);
      return;
    }
    setGroups([]);
    setPhase("loading");
    setActive(0);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await response.json()) as { groups?: GlobalSearchGroup[] };
        setGroups(Array.isArray(data.groups) ? data.groups : []);
        setPhase("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setGroups([]);
        setPhase("ready");
      }
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  if (!open || typeof document === "undefined") return null;

  function openHit(hit: GlobalSearchHit) {
    onClose();
    router.push(hit.href);
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!hits.length) return;
      setActive((index) => (Math.min(index, hits.length - 1) + 1) % hits.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!hits.length) return;
      setActive((index) => (Math.min(index, hits.length - 1) - 1 + hits.length) % hits.length);
    } else if (event.key === "Enter" && hits[selected]) {
      event.preventDefault();
      openHit(hits[selected]);
    }
  }

  let cursor = 0;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-primary-900/40 px-4 pt-[12vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="mx-auto w-full max-w-[640px] overflow-hidden rounded-panel border border-slate-200 bg-white shadow-form-card"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4">
          <svg className="h-5 w-5 shrink-0 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="11" cy="11" r="7" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search universities, guides, programs..."
            className="h-14 w-full bg-transparent text-[16px] text-primary-900 outline-none placeholder:text-slate-600"
            aria-controls={listId}
            aria-activedescendant={hits[selected] ? `${listId}-${hits[selected].id}` : undefined}
            autoComplete="off"
          />
          <button type="button" onClick={onClose} className="shrink-0 text-[13px] font-bold text-slate-600 hover:text-primary-900">
            Close
          </button>
        </div>

        <div id={listId} className="max-h-[min(420px,50vh)] overflow-y-auto px-2 py-2">
          {!query.trim() ? (
            <p className="px-3 py-6 text-[15px] text-slate-600">
              Search universities, guides, programs, and scholarships.
            </p>
          ) : phase === "loading" && groups.length === 0 ? (
            <p className="px-3 py-6 text-[15px] text-slate-600">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-6 text-[15px] text-slate-600">Nothing matched that search.</p>
          ) : (
            groups.map((group) => (
              <section key={group.key} className="mb-2">
                <h2 className="px-3 pb-1 pt-2 text-[13px] font-bold text-slate-600">{group.label}</h2>
                <ul>
                  {group.hits.map((hit) => {
                    const index = cursor;
                    cursor += 1;
                    const isSelected = index === selected;
                    return (
                      <li key={hit.id}>
                        <Link
                          id={`${listId}-${hit.id}`}
                          href={hit.href}
                          onClick={onClose}
                          onMouseEnter={() => setActive(index)}
                          className={`block rounded-input px-3 py-2 ${isSelected ? "bg-primary-50" : "hover:bg-slate-50"}`}
                          aria-selected={isSelected}
                        >
                          <span className="block text-[16px] font-bold text-primary-900">{hit.title}</span>
                          {hit.subtitle ? <span className="mt-0.5 block text-[13px] text-slate-600">{hit.subtitle}</span> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
