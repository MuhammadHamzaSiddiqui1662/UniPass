"use client";

import { useEffect, useState } from "react";
import { readIdList, SAVED_UNIVERSITIES_KEY, toggleId } from "@/lib/universities/saved";

export default function BookmarkButton({ id, name }: { id: string; name: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readIdList(SAVED_UNIVERSITIES_KEY).includes(id));
  }, [id]);

  const toggle = () => {
    setSaved(toggleId(SAVED_UNIVERSITIES_KEY, id));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} bookmark` : `Save ${name}`}
      className="absolute right-[17px] top-[17px] z-10 grid h-[34px] w-[34px] place-items-center rounded-[8px] bg-white"
    >
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden className="text-primary">
        <path
          d="M1.2 1.2h9.6v13.1L6 11.1 1.2 14.3V1.2z"
          stroke="currentColor"
          strokeWidth="1.4"
          fill={saved ? "currentColor" : "none"}
        />
      </svg>
    </button>
  );
}
