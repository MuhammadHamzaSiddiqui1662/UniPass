"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils/format";

export default function NewGuidePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (autoSlug) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      category: formData.get("category"),
      description: formData.get("description"),
      content: formData.get("content"),
      readTime: parseInt(formData.get("readTime") as string) || 5,
      featured: formData.get("featured") === "on",
      order: parseInt(formData.get("order") as string) || 0,
      status: formData.get("status"),
      metaTitle: formData.get("metaTitle"),
      metaDescription: formData.get("metaDescription"),
    };

    try {
      const response = await fetch("/api/admin/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create guide");
      }

      router.push("/admin/guides");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create guide");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg">
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/guides" className="text-navy hover:underline">← Back to Guides</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Add Guide</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Title *</label>
                <input type="text" name="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  required
                  className="input-field"
                />
                <p className="text-xs text-body mt-1">URL: /guides/{slug || "slug"}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Category *</label>
                  <input type="text" name="category" required className="input-field" placeholder="e.g., Application Process" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Read Time (minutes)</label>
                  <input type="number" name="readTime" defaultValue={5} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Description *</label>
                <textarea name="description" required rows={3} className="input-field" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Content (HTML) *</label>
                <textarea name="content" required rows={15} className="input-field font-mono text-sm" placeholder="<p>Your content here...</p>" />
                <p className="text-xs text-body mt-1">HTML content. Use basic tags: p, h2, h3, ul, ol, li, strong, em, a</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">Publishing</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="featured" />
                  <span className="text-sm font-bold">Featured</span>
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Order</label>
                  <input type="number" name="order" defaultValue={0} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Status *</label>
                  <select name="status" required className="input-field">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Meta Title</label>
                <input type="text" name="metaTitle" className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Meta Description</label>
                <textarea name="metaDescription" rows={2} className="input-field" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Create Guide"}
            </button>
            <Link href="/admin/guides" className="btn-outline">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
