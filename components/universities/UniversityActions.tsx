"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  COMPARE_LIST_KEY,
  readIdList,
  SAVED_UNIVERSITIES_KEY,
  toggleId,
  writeIdList,
} from "@/lib/universities/saved";

export default function UniversityActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readIdList(SAVED_UNIVERSITIES_KEY).includes(id));
  }, [id]);

  const toggleSave = () => {
    setSaved(toggleId(SAVED_UNIVERSITIES_KEY, id));
  };

  const compare = () => {
    const stored = readIdList(COMPARE_LIST_KEY);
    const next = stored.includes(id) ? stored : [...stored, id].slice(0, 3);
    writeIdList(COMPARE_LIST_KEY, next);
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
