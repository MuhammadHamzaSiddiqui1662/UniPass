"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTaxonomyClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get("type"),
      value: formData.get("value"),
      label: formData.get("label"),
      order: parseInt(formData.get("order") as string) || 0,
      active: formData.get("active") === "on",
    };

    try {
      const response = await fetch("/api/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create taxonomy");
      }

      router.push("/admin/taxonomies");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create taxonomy");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/taxonomies" className="text-primary hover:underline">← Back to Taxonomies</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Create Taxonomy</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Type *</label>
                <select name="type" required className="input-field">
                  <option value="">Select type</option>
                  <option value="pakistani_city">Pakistani City</option>
                  <option value="turkish_city">Turkish City</option>
                  <option value="study_field">Study Field</option>
                  <option value="study_level">Study Level</option>
                  <option value="best_time">Best Time to Reach</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Value * (used in code)</label>
                <input type="text" name="value" required className="input-field" placeholder="e.g. karachi" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Label * (shown to users)</label>
                <input type="text" name="label" required className="input-field" placeholder="e.g. Karachi" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Order</label>
                <input type="number" name="order" className="input-field" defaultValue={0} />
                <p className="text-xs text-slate-600 mt-1">Lower numbers appear first</p>
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
              {saving ? "Creating..." : "Create Taxonomy"}
            </button>
            <Link href="/admin/taxonomies" className="btn-outline">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
