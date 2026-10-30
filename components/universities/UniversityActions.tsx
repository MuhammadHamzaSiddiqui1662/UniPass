"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SAVED_KEY = "savedUniversities";
const COMPARE_KEY = "compareList";

export default function UniversityActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as string[];
      setSaved(stored.includes(id));
    } catch {
      setSaved(false);
    }
  }, [id]);

  const toggleSave = () => {
    const stored = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as string[];
    const next = saved ? stored.filter((item) => item !== id) : [...stored, id];
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    setSaved(!saved);
  };

  const compare = () => {
    const stored = JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]") as string[];
    const next = stored.includes(id) ? stored : [...stored, id].slice(0, 3);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
    router.push("/compare");
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        className="inline-flex h-11 min-w-[100px] items-center justify-center rounded-input border-[1.5px] border-border-strong bg-white px-4 text-[15px] font-bold text-ink transition-colors hover:border-navy"
      >
        {saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        onClick={compare}
        className="inline-flex h-11 min-w-[108px] items-center justify-center rounded-input border-[1.5px] border-border-strong bg-white px-4 text-[15px] font-bold text-ink transition-colors hover:border-navy"
      >
        Compare
      </button>
    </div>
  );
}
