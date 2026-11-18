"use client";

import Link from "next/link";

type PageHref = string | { pathname?: string; query: Record<string, string | number | undefined> };

export default function AdminPagination({
  page,
  totalPages,
  hrefFor,
  onPage,
}: {
  page: number;
  totalPages: number;
  hrefFor?: (page: number) => PageHref;
  onPage?: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const className = "rounded-input border border-slate-200 px-4 py-2 text-sm hover:bg-primary-50";

  const control = (target: number, label: string) => {
    if (onPage) {
      return (
        <button type="button" className={className} onClick={() => onPage(target)}>
          {label}
        </button>
      );
    }

    return (
      <Link href={hrefFor ? hrefFor(target) : { query: { page: target } }} className={className}>
        {label}
      </Link>
    );
  };

  return (
    <div className="flex justify-center gap-2 border-t border-slate-200 px-6 py-4">
      {page > 1 ? control(page - 1, "Previous") : null}
      <span className="px-4 py-2 text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? control(page + 1, "Next") : null}
    </div>
  );
}
