"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils/format";

export default function CreateProgramClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);

  useState(() => {
    fetch("/api/admin/universities")
      .then(res => res.json())
      .then(data => setUniversities(data.universities || []))
      .catch(console.error);
  });

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
      name: formData.get("name"),
      slug: formData.get("slug"),
      university: formData.get("university"),
      level: formData.get("level"),
      field: formData.get("field"),
      language: formData.get("language"),
      duration: formData.get("duration"),
      tuition: formData.get("tuition"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      status: formData.get("status"),
      metaTitle: formData.get("metaTitle"),
      metaDescription: formData.get("metaDescription"),
    };

    try {
      const response = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create program");
      }

      router.push("/admin/programs");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create program");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/programs" className="text-primary hover:underline">← Back to Programs</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Create Program</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Program Name *</label>
                <input
                  type="text"
                  name="name"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g. Computer Engineering"
                />
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
                <p className="text-xs text-slate-600 mt-1">URL: /programs/{slug || "slug"}</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">University *</label>
                <select name="university" required className="input-field">
                  <option value="">Select university</option>
                  {universities.map(uni => (
                    <option key={uni._id} value={uni._id}>{uni.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Level *</label>
                  <select name="level" required className="input-field">
                    <option value="">Select level</option>
                    <option value="Bachelor's">Bachelor's</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="Associate">Associate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Language *</label>
                  <select name="language" required className="input-field">
                    <option value="English">English</option>
                    <option value="Turkish">Turkish</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Field</label>
                <input type="text" name="field" className="input-field" placeholder="e.g. Engineering" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Duration</label>
                  <input type="text" name="duration" className="input-field" placeholder="e.g. 4 years" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tuition</label>
                  <input type="text" name="tuition" className="input-field" placeholder="e.g. $5,000/year" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Description *</label>
                <textarea name="description" required rows={4} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Requirements</label>
                <textarea name="requirements" rows={4} className="input-field" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">SEO & Publishing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Status *</label>
                <select name="status" required className="input-field">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
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
              {saving ? "Creating..." : "Create Program"}
            </button>
            <Link href="/admin/programs" className="btn-outline">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
