"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STATUSES } from "@/lib/utils/constants";

interface Lead {
  _id: string;
  fullName: string;
  whatsappNumber: string;
  city: string;
  levelOfStudy: string;
  bestTimeToReach?: string;
  source: string;
  sourcePage: string;
  university?: { name: string };
  status: string;
  assignedTo?: { _id: string; name: string };
  notes: string;
  document?: {
    fileName: string;
    size: number;
    uploadedAt: string;
    uploadedBy?: { name: string };
  } | null;
  activity: { action: string; note?: string; user: { name: string }; timestamp: string }[];
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
}

export default function LeadDetailClient({
  lead: initialLead,
  users,
  canDelete,
  canAssign,
  canExport,
  canDownload,
}: {
  lead: Lead;
  users: User[];
  canDelete: boolean;
  canAssign: boolean;
  canExport: boolean;
  canDownload: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lead, setLead] = useState(initialLead);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          addActivity: {
            action: `Status changed to ${newStatus}`,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const updated = await response.json();
      setLead(updated.lead);
      router.refresh();
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (userId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: userId || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign");

      const updated = await response.json();
      setLead(updated.lead);
      router.refresh();
    } catch (error) {
      alert("Failed to assign lead");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPdf = async (e: FormEvent) => {
    e.preventDefault();
    if (!pdfFile) return;
    if (pdfFile.type && pdfFile.type !== "application/pdf") {
      alert("Only PDF files can be uploaded.");
      return;
    }
    if (pdfFile.size > 15 * 1024 * 1024) {
      alert("PDF must be 15 MB or smaller.");
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.set("file", pdfFile);
      const response = await fetch(`/api/admin/leads/${lead._id}/document`, {
        method: "POST",
        body,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.lead) {
        throw new Error(data?.error || "Failed to upload PDF");
      }

      setLead(data.lead);
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload PDF");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addActivity: {
            action: "Note added",
            note: newNote,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to add note");

      const updated = await response.json();
      setLead(updated.lead);
      setNewNote("");
      router.refresh();
    } catch (error) {
      alert("Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.push("/admin/leads");
      router.refresh();
    } catch (error) {
      alert("Failed to delete lead");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {canExport && (
        <a href={`/admin/leads/${lead._id}/export`} className="btn-outline inline-block text-sm px-4 py-2">
          Export this lead
        </a>
      )}

      {/* Status Pipeline */}
      <div className="bg-white rounded-card border border-slate-200 p-6">
        <h2 className="font-display text-xl mb-4">Status Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {LEAD_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              disabled={saving || lead.status === status.value}
              className={`px-4 py-2 rounded-input font-bold transition-colors ${
                lead.status === status.value
                  ? "bg-primary text-white"
                  : "bg-primary-50 text-primary-900 hover:bg-primary/10"
              } disabled:opacity-50`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {canAssign && (
        <div className="bg-white rounded-card border border-slate-200 p-6">
          <h2 className="font-display text-xl mb-4">Assign To</h2>
          <select
            value={lead.assignedTo?._id || ""}
            onChange={(e) => handleAssign(e.target.value)}
            disabled={saving}
            className="input-field max-w-xs"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-2">Leads can be assigned to active staff.</p>
        </div>
      )}

      <div className="bg-white rounded-card border border-slate-200 p-6">
        <h2 className="font-display text-xl mb-2">Notes</h2>
        <p className="text-sm text-slate-600 mb-4">
          You can only upload one PDF per client. That file should contain all of the client&apos;s required
          documents. If anything is missing, add a note describing it so the PDF can be updated later. Every
          note and every PDF change stays in the history.
        </p>

        <div className="mb-6 rounded-input border border-slate-200 p-4">
          {lead.document ? (
            <div className="mb-3">
              <p className="font-bold text-sm">{lead.document.fileName}</p>
              <p className="text-xs text-slate-600">
                {formatFileSize(lead.document.size)}
                {" · "}
                Uploaded {new Date(lead.document.uploadedAt).toLocaleString()}
                {lead.document.uploadedBy?.name ? ` by ${lead.document.uploadedBy.name}` : ""}
              </p>
              {canDownload ? (
                <a
                  href={`/api/admin/leads/${lead._id}/document`}
                  className="btn-outline inline-block text-sm px-4 py-2 mt-3"
                >
                  Download PDF
                </a>
              ) : (
                <p className="text-xs text-slate-600 mt-2">
                  This file is on record. You can replace it, but only a supervisor or admin can download it.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600 mb-3">No PDF uploaded yet.</p>
          )}

          <form onSubmit={handleUploadPdf} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              disabled={saving}
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="text-sm text-slate-600"
            />
            <button
              type="submit"
              disabled={saving || !pdfFile}
              className="btn-primary whitespace-nowrap"
            >
              {lead.document ? "Replace PDF" : "Upload PDF"}
            </button>
          </form>
        </div>

        <form onSubmit={handleAddNote} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={saving || !newNote.trim()}
              className="btn-primary whitespace-nowrap"
            >
              Add Note
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {lead.activity.length === 0 && !lead.notes?.trim() && (
            <p className="text-slate-600 text-sm">No activity yet</p>
          )}
          {lead.notes?.trim() && (
            <div className="border-l-2 border-slate-300 pl-4 py-2">
              <span className="font-bold text-sm">Earlier note</span>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
          {lead.activity.map((item, i) => (
            <div
              key={i}
              className="border-l-2 border-primary pl-4 py-2"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">{item.action}</span>
                <span className="text-xs text-slate-600">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
              {item.note && (
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.note}</p>
              )}
              <p className="text-xs text-slate-600 mt-1">by {item.user?.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delete */}
      {canDelete && (
        <div className="bg-white rounded-card border border-error/40 p-6">
          <h2 className="font-display text-xl mb-4 text-error">
            Danger Zone
          </h2>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 bg-error text-white rounded-input hover:bg-error/90 disabled:opacity-50"
          >
            Delete Lead
          </button>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
