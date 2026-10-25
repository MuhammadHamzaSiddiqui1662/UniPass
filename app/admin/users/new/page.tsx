"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      active: formData.get("active") === "on",
    };

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create user");
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-display mb-6">Add User</h1>

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
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="input-field"
                />
                <p className="text-xs text-body mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Role *</label>
                <select name="role" required className="input-field">
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-body mt-1">
                  Staff can only manage leads. Admin has full access.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" defaultChecked />
                  <span className="text-sm font-bold">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Create User"}
            </button>
            <Link href="/admin/users" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
