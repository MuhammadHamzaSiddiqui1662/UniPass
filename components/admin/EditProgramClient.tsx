"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils/format";

export default function EditProgramClient({ programId }: { programId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/programs/${programId}`).then(res => res.json()),
      fetch("/api/admin/universities").then(res => res.json())
    ])
      .then(([programData, universitiesData]) => {
        setProgram(programData.program);
        setUniversities(universitiesData.universities || []);
        setTitle(programData.program.name);
        setSlug(programData.program.slug);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load program");
        router.push("/admin/programs");
      });
  }, [programId, router]);

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
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update program");
      }

      router.push("/admin/programs");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update program");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.push("/admin/programs");
      router.refresh();
    } catch (error) {
      alert("Failed to delete program");
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
            <Link href="/admin/programs" className="text-navy hover:underline">← Back to Programs</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Edit Program</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Program Name *</label>
                <input
                  type="text"
                  name="name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">University *</label>
                <select name="university" required className="input-field" defaultValue={program.university}>
                  <option value="">Select university</option>
                  {universities.map(uni => (
                    <option key={uni._id} value={uni._id}>{uni.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Level *</label>
                  <select name="level" required className="input-field" defaultValue={program.level}>
                    <option value="">Select level</option>
                    <option value="Bachelor's">Bachelor's</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="Associate">Associate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Language *</label>
                  <select name="language" required className="input-field" defaultValue={program.language}>
                    <option value="English">English</option>
                    <option value="Turkish">Turkish</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Field</label>
                <input type="text" name="field" className="input-field" defaultValue={program.field} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Duration</label>
                  <input type="text" name="duration" className="input-field" defaultValue={program.duration} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tuition</label>
                  <input type="text" name="tuition" className="input-field" defaultValue={program.tuition} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Description *</label>
                <textarea name="description" required rows={4} className="input-field" defaultValue={program.description} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Requirements</label>
                <textarea name="requirements" rows={4} className="input-field" defaultValue={program.requirements} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">SEO & Publishing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Status *</label>
                <select name="status" required className="input-field" defaultValue={program.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Meta Title</label>
                <input type="text" name="metaTitle" className="input-field" defaultValue={program.metaTitle} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Meta Description</label>
                <textarea name="metaDescription" rows={2} className="input-field" defaultValue={program.metaDescription} />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/programs" className="btn-outline">Cancel</Link>
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
