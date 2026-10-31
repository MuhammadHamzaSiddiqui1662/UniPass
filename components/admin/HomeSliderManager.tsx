"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type SliderUniversity = {
  id: string;
  name: string;
  city: string;
  featuredOnHome: boolean;
  homeOrder: number;
};

export default function HomeSliderManager({ universities }: { universities: SliderUniversity[] }) {
  const router = useRouter();
  const [items, setItems] = useState(() =>
    [...universities].sort((a, b) => {
      if (a.featuredOnHome !== b.featuredOnHome) return a.featuredOnHome ? -1 : 1;
      if (a.featuredOnHome) return a.homeOrder - b.homeOrder;
      return a.name.localeCompare(b.name);
    }),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const featured = items.filter((item) => item.featuredOnHome);

  const move = (id: string, direction: -1 | 1) => {
    setItems((current) => {
      const next = [...current];
      const visible = next.filter((item) => item.featuredOnHome);
      const from = visible.findIndex((item) => item.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= visible.length) return current;
      const fromIndex = next.findIndex((item) => item.id === visible[from].id);
      const toIndex = next.findIndex((item) => item.id === visible[to].id);
      const [row] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, row);
      return next;
    });
  };

  const toggle = (id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, featuredOnHome: !item.featuredOnHome } : item)),
    );
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
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
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the home slider");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-8 rounded-card border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-primary-900">Home slider</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose which published universities appear on the home page, and the order they slide in.
          </p>
        </div>
        <button type="button" className="btn-primary h-11 px-5 text-[15px]" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save slider"}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm font-bold text-primary">{message}</p> : null}
      <ol className="mt-4 divide-y divide-slate-200">
        {items.map((item) => {
          const position = featured.findIndex((row) => row.id === item.id);
          return (
            <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
              <label className="inline-flex min-w-[220px] flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.featuredOnHome}
                  onChange={() => toggle(item.id)}
                  aria-label={`Show ${item.name} on the home slider`}
                />
                <span>
                  <span className="block font-bold text-primary-900">{item.name}</span>
                  <span className="text-sm text-slate-600">{item.city}</span>
                </span>
              </label>
              {item.featuredOnHome ? (
                <span className="text-sm font-bold text-secondary-800">Slide {position + 1}</span>
              ) : null}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  className="rounded-input border border-primary-200 px-3 py-1 text-sm font-bold text-primary disabled:opacity-40"
                  disabled={!item.featuredOnHome || position === 0}
                  onClick={() => move(item.id, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rounded-input border border-primary-200 px-3 py-1 text-sm font-bold text-primary disabled:opacity-40"
                  disabled={!item.featuredOnHome || position === featured.length - 1}
                  onClick={() => move(item.id, 1)}
                >
                  Down
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
