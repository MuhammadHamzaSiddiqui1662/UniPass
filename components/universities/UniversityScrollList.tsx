"use client";

import { useEffect, useRef, useState } from "react";
import UniversityCard from "@/components/universities/UniversityCard";
import type { CatalogUniversity } from "@/lib/universities/catalog";

const PAGE_SIZE = 9;

export default function UniversityScrollList({
  universities,
  initialCount,
}: {
  universities: CatalogUniversity[];
  initialCount: number;
}) {
  const [visible, setVisible] = useState(() =>
    Math.min(universities.length, Math.max(PAGE_SIZE, initialCount)),
  );
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = visible < universities.length;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setVisible((count) => Math.min(universities.length, count + PAGE_SIZE));
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, universities.length, visible]);

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {universities.slice(0, visible).map((university) => (
          <UniversityCard key={university.slug} university={university} />
        ))}
      </div>
      {hasMore ? (
        <div
          ref={sentinel}
          className="mt-10 text-center text-[14px] leading-[18px] text-slate-600"
          role="status"
          aria-live="polite"
        >
          Loading more universities…
        </div>
      ) : (
        <p className="mt-10 text-center text-[14px] leading-[18px] text-slate-600">
          That is every verified university we currently support. More are added regularly.
        </p>
      )}
    </>
  );
}
