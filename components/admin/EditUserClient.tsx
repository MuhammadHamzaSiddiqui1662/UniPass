"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROLE_LABELS, type UserRole } from "@/lib/auth/permissions";

interface EditableUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export default function EditUserClient({
  user,
  roles,
  lockRole,
  lockActive,
  canDelete,
}: {
  user: EditableUser;
  roles: UserRole[];
  lockRole: boolean;
  lockActive: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    if (!lockRole) data.role = formData.get("role");
    if (!lockActive) data.active = formData.get("active") === "on";

    const password = formData.get("password") as string;
    if (password) data.password = password;

    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update user");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to delete");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete user");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/users" className="text-primary hover:underline">
              ← Back to Users
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Edit User</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input type="text" name="name" required className="input-field" defaultValue={user.name} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Email *</label>
                <input type="email" name="email" required className="input-field" defaultValue={user.email} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  className="input-field"
                  placeholder="Enter new password to change"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Role</label>
                {lockRole ? (
                  <p className="text-sm text-primary-900">{ROLE_LABELS[user.role]}</p>
                ) : (
                  <select name="role" required className="input-field" defaultValue={user.role}>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                )}
                {lockRole && (
                  <p className="text-xs text-slate-600 mt-1">The Super Admin role cannot be changed.</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" defaultChecked={user.active} disabled={lockActive} />
                  <span className="text-sm font-bold">Active</span>
                </label>
                {lockActive && (
                  <p className="text-xs text-slate-600 mt-1">This account stays active.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/users" className="btn-outline">
              Cancel
            </Link>
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger ml-auto"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
