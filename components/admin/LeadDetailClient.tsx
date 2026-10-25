"use client";

import { useState, FormEvent } from "react";
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
}: {
  lead: Lead;
  users: User[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [notes, setNotes] = useState(lead.notes);
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

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error("Failed to save notes");

      alert("Notes saved");
    } catch (error) {
      alert("Failed to save notes");
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
      {/* Status Pipeline */}
      <div className="bg-white rounded-card border border-border p-6">
        <h2 className="font-display text-xl mb-4">Status Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {LEAD_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              disabled={saving || lead.status === status.value}
              className={`px-4 py-2 rounded-input font-bold transition-colors ${
                lead.status === status.value
                  ? "bg-navy text-white"
                  : "bg-surface-tint text-ink hover:bg-navy/10"
              } disabled:opacity-50`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment */}
      <div className="bg-white rounded-card border border-border p-6">
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
      </div>

      {/* Notes */}
      <div className="bg-white rounded-card border border-border p-6">
        <h2 className="font-display text-xl mb-4">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          className="input-field mb-4"
          placeholder="Add notes about this lead..."
        />
        <button
          onClick={handleSaveNotes}
          disabled={saving}
          className="btn-primary"
        >
          Save Notes
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-card border border-border p-6">
        <h2 className="font-display text-xl mb-4">Activity Timeline</h2>
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
          {lead.activity.length === 0 && (
            <p className="text-body text-sm">No activity yet</p>
          )}
          {lead.activity.map((item, i) => (
            <div
              key={i}
              className="border-l-2 border-navy pl-4 py-2"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">{item.action}</span>
                <span className="text-xs text-body">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
              {item.note && (
                <p className="text-sm text-body">{item.note}</p>
              )}
              <p className="text-xs text-body mt-1">by {item.user.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delete */}
      {canDelete && (
        <div className="bg-white rounded-card border border-red-200 p-6">
          <h2 className="font-display text-xl mb-4 text-red-600">
            Danger Zone
          </h2>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-input hover:bg-red-700 disabled:opacity-50"
          >
            Delete Lead
          </button>
        </div>
      )}
    </div>
  );
}
