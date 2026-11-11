"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addToCompare,
  readCompareSlots,
  readIdList,
  SAVED_UNIVERSITIES_KEY,
  toggleId,
} from "@/lib/universities/saved";

export default function UniversityActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    setSaved(readIdList(SAVED_UNIVERSITIES_KEY).includes(id));
    setInCompare(readCompareSlots().includes(id));
    setFull(false);
  }, [id]);

  const toggleSave = () => {
    setSaved(toggleId(SAVED_UNIVERSITIES_KEY, id));
  };

  const compare = () => {
    const result = addToCompare(id);
    if (result === "full") {
      setFull(true);
      return;
    }
    setInCompare(true);
    setFull(false);
    router.push("/compare");
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          className="inline-flex h-11 min-w-[100px] items-center justify-center rounded-input border-[1.5px] border-primary-200 bg-white px-4 text-[15px] font-bold text-primary-900 transition-colors hover:border-primary"
        >
          {saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={compare}
          aria-pressed={inCompare}
          aria-label={inCompare ? `${name} is in compare` : `Compare ${name}`}
          className="inline-flex h-11 min-w-[124px] items-center justify-center rounded-input border-[1.5px] border-primary-200 bg-white px-4 text-[15px] font-bold text-primary-900 transition-colors hover:border-primary"
        >
          {inCompare ? "In compare" : "Compare"}
        </button>
      </div>
      {full ? (
        <p role="status" className="max-w-xs text-[14px] leading-5 text-slate-600">
          You can compare 3 universities at a time. Replace one on the{" "}
          <Link href="/compare" className="font-bold text-primary hover:underline">
            compare page
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
