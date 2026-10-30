"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "savedUniversities";

export default function BookmarkButton({ id, name }: { id: string; name: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
      setSaved(stored.includes(id));
    } catch {
      setSaved(false);
    }
  }, [id]);

  const toggle = () => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    const next = saved ? stored.filter((item) => item !== id) : [...stored, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(!saved);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} bookmark` : `Save ${name}`}
      className="absolute right-[17px] top-[17px] z-10 grid h-[34px] w-[34px] place-items-center rounded-[8px] bg-white"
    >
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden>
        <path
          d="M1.2 1.2h9.6v13.1L6 11.1 1.2 14.3V1.2z"
          stroke="#17307A"
          strokeWidth="1.4"
          fill={saved ? "#17307A" : "none"}
        />
      </svg>
    </button>
  );
}
