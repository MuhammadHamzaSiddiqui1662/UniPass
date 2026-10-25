"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LeadsListClient({ leads: initialLeads }: { leads: any[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(new Set(initialLeads.map(lead => lead._id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selected.size === 0) {
      alert("Please select at least one lead");
      return;
    }

    if (!confirm(`Change status of ${selected.size} lead(s) to "${status}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch("/api/admin/leads/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: Array.from(selected),
          status,
        }),
      });

      if (!response.ok) throw new Error("Bulk update failed");

      setSelected(new Set());
      router.refresh();
    } catch (error) {
      alert("Failed to update leads");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-navy text-white p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="font-bold">{selected.size} lead(s) selected</p>
            <div className="flex gap-3">
              <select
                className="px-4 py-2 bg-white text-ink rounded-input"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusChange(e.target.value);
                    e.target.value = "";
                  }
                }}
                disabled={updating}
              >
                <option value="">Change status to...</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="applied">Applied</option>
                <option value="enrolled">Enrolled</option>
                <option value="lost">Lost</option>
              </select>
              <button
                onClick={() => setSelected(new Set())}
                className="px-4 py-2 bg-white/20 rounded-input hover:bg-white/30"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-card border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-tint">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === initialLeads.length && initialLeads.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">WhatsApp</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">City</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialLeads.map((lead: any) => (
              <tr key={lead._id} className="hover:bg-surface-tint/50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(lead._id)}
                    onChange={() => handleSelect(lead._id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/leads/${lead._id}`} className="font-bold text-navy hover:underline">
                    {lead.fullName}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm">{lead.whatsappNumber}</td>
                <td className="px-6 py-4 text-sm">{lead.city}</td>
                <td className="px-6 py-4 text-sm">{lead.levelOfStudy}</td>
                <td className="px-6 py-4">
                  <span className={`chip ${lead.status === 'new' ? 'chip-warning' : lead.status === 'enrolled' ? 'chip-success' : 'chip-tint'}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-body">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {initialLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-body">No leads found</p>
          </div>
        )}
      </div>
    </>
  );
}
