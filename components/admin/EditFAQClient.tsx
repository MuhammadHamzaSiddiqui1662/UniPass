"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditFAQClient({ faqId }: { faqId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [faq, setFaq] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/faqs/${faqId}`)
      .then(res => res.json())
      .then(data => {
        setFaq(data.faq);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load FAQ");
        router.push("/admin/faqs");
      });
  }, [faqId, router]);

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
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update FAQ");

      router.push("/admin/faqs");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update FAQ");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.push("/admin/faqs");
      router.refresh();
    } catch (error) {
      alert("Failed to delete FAQ");
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
            <Link href="/admin/faqs" className="text-navy hover:underline">
              ← Back to FAQs
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Edit FAQ</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-border p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Question *</label>
                <input
                  type="text"
                  name="question"
                  required
                  className="input-field"
                  defaultValue={faq.question}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Answer *</label>
                <textarea
                  name="answer"
                  required
                  rows={5}
                  className="input-field"
                  defaultValue={faq.answer}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Order</label>
                  <input
                    type="number"
                    name="order"
                    className="input-field"
                    defaultValue={faq.order}
                  />
                  <p className="text-xs text-body mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Status *</label>
                  <select name="status" required className="input-field" defaultValue={faq.status}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/faqs" className="btn-outline">
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
