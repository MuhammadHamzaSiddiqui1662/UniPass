"use client";

import { useRouter } from "next/navigation";
import Asset from "@/components/home/Asset";
import type { ListingQuery } from "@/lib/universities/catalog";

export default function SortSelect({
  sort,
  query,
}: {
  sort?: string;
  query: ListingQuery;
}) {
  const router = useRouter();

  const onChange = (value: string) => {
    const params = new URLSearchParams();
    const keep = ["q", "city", "field", "type", "level", "country", "scholarship", "cleared"] as const;
    keep.forEach((key) => {
      const value = query[key];
      if (!value) return;
      params.set(key, Array.isArray(value) ? value.join(",") : value);
    });
    if (value) params.set("sort", value);
    const search = params.toString();
    router.push(search ? `/universities?${search}` : "/universities");
  };

  return (
    <div className="relative w-full sm:w-[264px]">
      <select
        aria-label="Sort universities"
        value={sort || "tuition-low"}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-input border-[1.5px] border-primary-200 bg-white pl-4 pr-10 text-[16px] text-primary-900 outline-none focus:border-primary"
      >
        <option value="tuition-low">Sort: Tuition, low to high</option>
        <option value="tuition-high">Sort: Tuition, high to low</option>
        <option value="name">Sort: Name A–Z</option>
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <Asset src="/universities/filter-bar__imgVector2.svg" width={12} height={7} />
      </span>
    </div>
  );
}
