"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils/format";

export default function EditGuideClient({ guideId }: { guideId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[300px] p-4 border border-border rounded-input",
      },
    },
  });

  useEffect(() => {
    fetch(`/api/admin/guides/${guideId}`)
      .then(res => res.json())
      .then(data => {
        setGuide(data.guide);
        setTitle(data.guide.title);
        setSlug(data.guide.slug);
        if (editor) {
          editor.commands.setContent(data.guide.content);
        }
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load guide");
        router.push("/admin/guides");
      });
  }, [guideId, router, editor]);

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
      content: editor?.getHTML() || "",
      readTime: parseInt(formData.get("readTime") as string) || 5,
      featured: formData.get("featured") === "on",
      order: parseInt(formData.get("order") as string) || 0,
      status: formData.get("status"),
      metaTitle: formData.get("metaTitle"),
      metaDescription: formData.get("metaDescription"),
    };

    try {
      const response = await fetch(`/api/admin/guides/${guideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update guide");
      }

      router.push("/admin/guides");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update guide");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this guide?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/guides/${guideId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.push("/admin/guides");
      router.refresh();
    } catch (error) {
      alert("Failed to delete guide");
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
            <Link href="/admin/guides" className="text-navy hover:underline">← Back to Guides</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Edit Guide</h1>

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
                  <input type="text" name="category" required className="input-field" defaultValue={guide.category} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Read Time (minutes)</label>
                  <input type="number" name="readTime" className="input-field" defaultValue={guide.readTime} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Description *</label>
                <textarea name="description" required rows={3} className="input-field" defaultValue={guide.description} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Content (Rich Text) *</label>
                <div className="mb-2 flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 text-sm border rounded ${editor?.isActive("bold") ? "bg-navy text-white" : "bg-white"}`}
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 text-sm border rounded ${editor?.isActive("italic") ? "bg-navy text-white" : "bg-white"}`}
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1 text-sm border rounded ${editor?.isActive("heading", { level: 2 }) ? "bg-navy text-white" : "bg-white"}`}
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1 text-sm border rounded ${editor?.isActive("heading", { level: 3 }) ? "bg-navy text-white" : "bg-white"}`}
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 text-sm border rounded ${editor?.isActive("bulletList") ? "bg-navy text-white" : "bg-white"}`}
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={`px-3 py-1 text-sm border rounded ${editor?.isActive("orderedList") ? "bg-navy text-white" : "bg-white"}`}
                  >
                    Numbered List
                  </button>
                </div>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">Publishing</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="featured" defaultChecked={guide.featured} />
                  <span className="text-sm font-bold">Featured</span>
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Order</label>
                  <input type="number" name="order" className="input-field" defaultValue={guide.order} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Status *</label>
                  <select name="status" required className="input-field" defaultValue={guide.status}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Meta Title</label>
                <input type="text" name="metaTitle" className="input-field" defaultValue={guide.metaTitle} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Meta Description</label>
                <textarea name="metaDescription" rows={2} className="input-field" defaultValue={guide.metaDescription} />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/guides" className="btn-outline">Cancel</Link>
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
