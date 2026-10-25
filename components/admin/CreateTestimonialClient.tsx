"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTestimonialClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

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
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create testimonial");
      }

      router.push("/admin/testimonials");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create testimonial");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg">
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/testimonials" className="text-navy hover:underline">← Back to Testimonials</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Create Testimonial</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">Student Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Student Name *</label>
                <input type="text" name="studentName" required className="input-field" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">University *</label>
                  <input type="text" name="university" required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Program</label>
                  <input type="text" name="program" className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Country</label>
                <input type="text" name="country" className="input-field" defaultValue="Pakistan" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Testimonial *</label>
                <textarea name="testimonial" required rows={5} className="input-field" />
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
                {uploading && <p className="text-sm text-body mt-1">Uploading...</p>}
                {photoUrl && (
                  <div className="mt-2">
                    <img src={photoUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-border p-6">
            <h2 className="font-display text-xl mb-4">Publishing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Order</label>
                <input type="number" name="order" className="input-field" defaultValue={0} />
                <p className="text-xs text-body mt-1">Lower numbers appear first</p>
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

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Create Testimonial"}
            </button>
            <Link href="/admin/testimonials" className="btn-outline">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
