"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewFAQPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      question: formData.get("question"),
      answer: formData.get("answer"),
      order: parseInt(formData.get("order") as string) || 0,
      status: formData.get("status"),
    };

    try {
      const response = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create FAQ");

      router.push("/admin/faqs");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create FAQ");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/faqs" className="text-primary hover:underline">
              ← Back to FAQs
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Add FAQ</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Question *</label>
                <input type="text" name="question" required className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Answer *</label>
                <textarea name="answer" required rows={5} className="input-field" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Order</label>
                  <input type="number" name="order" defaultValue={0} className="input-field" />
                  <p className="text-xs text-slate-600 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Status *</label>
                  <select name="status" required className="input-field">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Create FAQ"}
            </button>
            <Link href="/admin/faqs" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
