"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initialsFromName } from "@/lib/testimonials/input";

type TestimonialRecord = {
  studentName?: string;
  initials?: string;
  quote?: string;
  origin?: string;
  university?: string;
  verified?: boolean;
  order?: number;
  status?: "draft" | "published";
};

export default function TestimonialForm({ testimonialId }: { testimonialId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(testimonialId);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [initials, setInitials] = useState("");
  const [initialsTouched, setInitialsTouched] = useState(false);
  const [origin, setOrigin] = useState("");
  const [university, setUniversity] = useState("");
  const [quote, setQuote] = useState("");
  const [verified, setVerified] = useState(false);
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<"draft" | "published">("draft");

  useEffect(() => {
    if (!testimonialId) return;
    let cancelled = false;
    fetch(`/api/admin/testimonials/${testimonialId}`)
      .then(async (response) => {
        const data = (await response.json()) as { testimonial?: TestimonialRecord; error?: string };
        if (!response.ok || !data.testimonial) throw new Error(data.error || "Failed to load testimonial");
        return data.testimonial;
      })
      .then((story) => {
        if (cancelled) return;
        setStudentName(story.studentName || "");
        setInitials(story.initials || "");
        setInitialsTouched(true);
        setOrigin(story.origin || "");
        setUniversity(story.university || "");
        setQuote(story.quote || "");
        setVerified(Boolean(story.verified));
        setOrder(story.order || 0);
        setStatus(story.status === "published" ? "published" : "draft");
        setLoading(false);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load testimonial");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [testimonialId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(testimonialId ? `/api/admin/testimonials/${testimonialId}` : "/api/admin/testimonials", {
        method: testimonialId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          initials,
          origin,
          university,
          quote,
          verified,
          order,
          status,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to save testimonial");
      router.push("/admin/testimonials");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save testimonial");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!testimonialId || !confirm("Delete this testimonial?")) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete testimonial");
      router.push("/admin/testimonials");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete testimonial");
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/admin/testimonials" className="text-primary hover:underline">← Back to Testimonials</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-display text-2xl">{isEdit ? "Edit testimonial" : "Add testimonial"}</h1>
        {loading ? <p className="text-slate-600">Loading…</p> : null}
        {!loading ? (
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
            {error ? <p className="rounded-card border border-error/30 bg-error-tint px-4 py-3 text-sm text-error">{error}</p> : null}
            <section className="rounded-card border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl">Student</h2>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
                  <label className="block text-sm font-bold">
                    Name
                    <input
                      value={studentName}
                      onChange={(event) => {
                        const next = event.target.value;
                        setStudentName(next);
                        if (!initialsTouched) setInitials(initialsFromName(next));
                      }}
                      required
                      className="input-field mt-1"
                    />
                  </label>
                  <label className="block text-sm font-bold">
                    Initials
                    <input
                      value={initials}
                      onChange={(event) => {
                        setInitialsTouched(true);
                        setInitials(event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2));
                      }}
                      required
                      maxLength={2}
                      className="input-field mt-1 uppercase"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-bold">
                    From
                    <input value={origin} onChange={(event) => setOrigin(event.target.value)} required className="input-field mt-1" placeholder="Lahore" />
                  </label>
                  <label className="block text-sm font-bold">
                    University
                    <input value={university} onChange={(event) => setUniversity(event.target.value)} required className="input-field mt-1" placeholder="ITU" />
                  </label>
                </div>
                <label className="block text-sm font-bold">
                  Quote
                  <textarea value={quote} onChange={(event) => setQuote(event.target.value)} required rows={5} className="input-field mt-1 h-auto py-3" />
                </label>
              </div>
            </section>

            <section className="rounded-card border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl">Publishing</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} />
                  Student agreed to share this quote
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-bold">
                    Order
                    <input type="number" value={order} onChange={(event) => setOrder(Number(event.target.value))} className="input-field mt-1" />
                    <span className="mt-1 block text-xs font-normal text-slate-600">Lower numbers appear first.</span>
                  </label>
                  <label className="block text-sm font-bold">
                    Status
                    <select value={status} onChange={(event) => setStatus(event.target.value === "published" ? "published" : "draft")} className="input-field mt-1">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? "Saving…" : isEdit ? "Save changes" : "Create testimonial"}
              </button>
              <Link href="/admin/testimonials" className="btn-outline">Cancel</Link>
              {isEdit ? (
                <button type="button" onClick={() => void handleDelete()} disabled={deleting} className="btn-danger ml-auto">
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}
