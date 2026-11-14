"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GuideEditor, { type GuideEditorHandle } from "@/components/admin/editor/GuideEditor";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";
import { GUIDE_CATEGORIES } from "@/lib/guides/catalog";
import { slugify } from "@/lib/utils/format";

const CATEGORIES = GUIDE_CATEGORIES.filter((category) => category !== "All");

type GuideRecord = {
  title?: string;
  slug?: string;
  category?: string;
  description?: string;
  content?: string;
  coverImage?: string;
  readTime?: number;
  featured?: boolean;
  order?: number;
  status?: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
};

export default function GuideForm({ guideId }: { guideId?: string }) {
  const router = useRouter();
  const editorRef = useRef<GuideEditorHandle>(null);
  const isEdit = Boolean(guideId);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [readTime, setReadTime] = useState(5);
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [cover, setCover] = useState<UploadedImage[]>([]);

  useEffect(() => {
    if (!guideId) return;
    let cancelled = false;
    fetch(`/api/admin/guides/${guideId}`)
      .then(async (response) => {
        const data = (await response.json()) as { guide?: GuideRecord; error?: string };
        if (!response.ok || !data.guide) throw new Error(data.error || "Failed to load guide");
        return data.guide;
      })
      .then((guide) => {
        if (cancelled) return;
        setTitle(guide.title || "");
        setSlug(guide.slug || "");
        setCategory(guide.category || CATEGORIES[0]);
        setDescription(guide.description || "");
        setContent(guide.content || "");
        setReadTime(guide.readTime || 5);
        setFeatured(Boolean(guide.featured));
        setOrder(guide.order || 0);
        setStatus(guide.status === "published" ? "published" : "draft");
        setMetaTitle(guide.metaTitle || "");
        setMetaDescription(guide.metaDescription || "");
        setOgImage(guide.ogImage || "");
        setCover(guide.coverImage ? [{ url: guide.coverImage, alt: guide.title || "" }] : []);
        setLoading(false);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load guide");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [guideId]);

  const categories = CATEGORIES.includes(category as (typeof CATEGORIES)[number]) ? CATEGORIES : [category, ...CATEGORIES];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const coverImage = cover[0]?.url || "";
    const payload = {
      title,
      slug,
      category,
      description,
      content: editorRef.current?.getHtml() || content,
      coverImage,
      readTime,
      featured,
      order,
      status,
      metaTitle,
      metaDescription,
      ogImage: ogImage || coverImage,
    };

    try {
      const response = await fetch(guideId ? `/api/admin/guides/${guideId}` : "/api/admin/guides", {
        method: guideId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to save guide");
      router.push("/admin/guides");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save guide");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!guideId || !confirm("Delete this guide?")) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/guides/${guideId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete guide");
      router.push("/admin/guides");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete guide");
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/admin/guides" className="text-primary hover:underline">← Back to Guides</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-display text-2xl">{isEdit ? "Edit Guide" : "Add Guide"}</h1>
        {loading ? <p className="text-slate-600">Loading…</p> : null}
        {!loading ? (
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
            {error ? <p className="rounded-card border border-error/30 bg-error-tint px-4 py-3 text-sm text-error">{error}</p> : null}
            <section className="rounded-card border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl">Basic information</h2>
              <div className="space-y-4">
                <label className="block text-sm font-bold">
                  Title
                  <input
                    value={title}
                    onChange={(event) => {
                      const next = event.target.value;
                      setTitle(next);
                      if (autoSlug) setSlug(slugify(next));
                    }}
                    required
                    className="input-field mt-1"
                  />
                </label>
                <label className="block text-sm font-bold">
                  Slug
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value);
                      setAutoSlug(false);
                    }}
                    required
                    className="input-field mt-1"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-600">URL: /guides/{slug || "slug"}</span>
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-bold">
                    Category
                    <select value={category} onChange={(event) => setCategory(event.target.value)} className="input-field mt-1">
                      {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-bold">
                    Read time (minutes)
                    <input type="number" min={1} max={180} value={readTime} onChange={(event) => setReadTime(Number(event.target.value))} className="input-field mt-1" />
                  </label>
                </div>
                <label className="block text-sm font-bold">
                  Description
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={3} className="input-field mt-1 h-auto py-3" />
                </label>
              </div>
            </section>

            <section className="rounded-card border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl">Cover</h2>
              <ImageUploader
                label="Cover image"
                hint="Shown on the guides page and at the top of the article."
                kind="guide"
                slug={slug || "draft"}
                images={cover}
                onChange={setCover}
                showAlt={false}
              />
            </section>

            <section className="rounded-card border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl">Article</h2>
              <GuideEditor ref={editorRef} initialHtml={content} slug={slug || "draft"} />
            </section>

            <section className="rounded-card border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-display text-xl">Publishing</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
                  Featured
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-bold">
                    Order
                    <input type="number" value={order} onChange={(event) => setOrder(Number(event.target.value))} className="input-field mt-1" />
                  </label>
                  <label className="block text-sm font-bold">
                    Status
                    <select value={status} onChange={(event) => setStatus(event.target.value === "published" ? "published" : "draft")} className="input-field mt-1">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </label>
                </div>
                <label className="block text-sm font-bold">
                  Meta title
                  <input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} className="input-field mt-1" />
                </label>
                <label className="block text-sm font-bold">
                  Meta description
                  <textarea value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} rows={2} className="input-field mt-1 h-auto py-3" />
                </label>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? "Saving…" : isEdit ? "Save changes" : "Create guide"}</button>
              <Link href="/admin/guides" className="btn-outline">Cancel</Link>
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
