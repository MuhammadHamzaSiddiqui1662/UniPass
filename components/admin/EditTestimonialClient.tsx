"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditTestimonialClient({ testimonialId }: { testimonialId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testimonial, setTestimonial] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    fetch(`/api/admin/testimonials/${testimonialId}`)
      .then(res => res.json())
      .then(data => {
        setTestimonial(data.testimonial);
        setPhotoUrl(data.testimonial.photo || "");
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load testimonial");
        router.push("/admin/testimonials");
      });
  }, [testimonialId, router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setPhotoUrl(data.url);
    } catch (error) {
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      studentName: formData.get("studentName"),
      university: formData.get("university"),
      program: formData.get("program"),
      country: formData.get("country"),
      testimonial: formData.get("testimonial"),
      photo: photoUrl,
      order: parseInt(formData.get("order") as string) || 0,
      status: formData.get("status"),
    };

    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update testimonial");
      }

      router.push("/admin/testimonials");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update testimonial");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.push("/admin/testimonials");
      router.refresh();
    } catch (error) {
      alert("Failed to delete testimonial");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/testimonials" className="text-primary hover:underline">← Back to Testimonials</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Edit Testimonial</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Student Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Student Name *</label>
                <input type="text" name="studentName" required className="input-field" defaultValue={testimonial.studentName} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">University *</label>
                  <input type="text" name="university" required className="input-field" defaultValue={testimonial.university} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Program</label>
                  <input type="text" name="program" className="input-field" defaultValue={testimonial.program} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Country</label>
                <input type="text" name="country" className="input-field" defaultValue={testimonial.country} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Testimonial *</label>
                <textarea name="testimonial" required rows={5} className="input-field" defaultValue={testimonial.testimonial} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="input-field"
                />
                {uploading && <p className="text-sm text-slate-600 mt-1">Uploading...</p>}
                {photoUrl && (
                  <div className="mt-2">
                    <img src={photoUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Publishing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Order</label>
                <input type="number" name="order" className="input-field" defaultValue={testimonial.order} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Status *</label>
                <select name="status" required className="input-field" defaultValue={testimonial.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/testimonials" className="btn-outline">Cancel</Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto px-4 py-2 bg-error text-white rounded-input hover:bg-error/90 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
