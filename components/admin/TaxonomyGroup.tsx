"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPagination from "@/components/admin/AdminPagination";
import { clientPage } from "@/lib/admin/pagination";

type TaxonomyItem = {
  _id: string;
  label: string;
  value: string;
  active: boolean;
};

export default function TaxonomyGroup({ title, items }: { title: string; items: TaxonomyItem[] }) {
  const [page, setPage] = useState(1);
  const window = clientPage(items, page);

  return (
    <div className="rounded-card border border-slate-200 bg-white p-6">
      <h2 className="mb-4 font-display text-xl">
        {title}
        {items.length > 0 ? ` (${items.length})` : ""}
      </h2>
      {window.items.length > 0 ? (
        <div className="-mx-6">
          <div className="space-y-2 px-6">
            {window.items.map((tax) => (
              <div key={tax._id} className="flex items-center justify-between border-b border-slate-200 py-2">
                <div>
                  <span className="font-bold">{tax.label}</span>
                  <span className="ml-2 text-sm text-slate-600">({tax.value})</span>
                  {!tax.active && <span className="ml-2 text-xs text-error">Inactive</span>}
                </div>
                <Link href={`/admin/taxonomies/${tax._id}/edit`} className="text-sm text-primary hover:underline">
                  Edit
                </Link>
              </div>
            ))}
          </div>
          <AdminPagination page={window.page} totalPages={window.totalPages} onPage={setPage} />
        </div>
      ) : (
        <p className="text-sm text-slate-600">No items yet</p>
      )}
    </div>
  );
}
