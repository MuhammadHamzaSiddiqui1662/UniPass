"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditUserClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load user");
        router.push("/admin/users");
      });
  }, [userId, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      active: formData.get("active") === "on",
    };

    // Only include password if it was provided
    const password = formData.get("password") as string;
    if (password) {
      data.password = password;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      alert("Failed to delete user");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/users" className="text-navy hover:underline">
              ← Back to Users
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Edit User</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-border p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field"
                  defaultValue={user.name}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field"
                  defaultValue={user.email}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  className="input-field"
                  placeholder="Enter new password to change"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Role *</label>
                <select name="role" required className="input-field" defaultValue={user.role}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-body mt-1">
                  Staff can only manage leads. Admin has full access.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" defaultChecked={user.active} />
                  <span className="text-sm font-bold">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/users" className="btn-outline">
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-input hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
