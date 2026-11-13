"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  currentHeroContent,
  slideHeading,
  type AdminHeroSlide,
  type HeroButton,
  type HeroSlideContent,
} from "@/lib/home/hero-content";

type EditorState = HeroSlideContent & { id?: string };

const emptySlide = (): EditorState => ({
  backgroundImage: "",
  imageAlt: "",
  title: "",
  description: "",
  buttons: [],
  showTrustPoints: false,
  status: "published",
});

export default function HeroSlidesManager({ initialSlides }: { initialSlides: AdminHeroSlide[] }) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editor) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setEditor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [editor, saving]);

  const openCreate = () => {
    setError("");
    setMessage("");
    setEditor(emptySlide());
  };

  const openEdit = (slide: AdminHeroSlide) => {
    setError("");
    setMessage("");
    setEditor({
      id: slide.id,
      backgroundImage: slide.backgroundImage,
      imageAlt: slide.imageAlt,
      title: slide.title,
      description: slide.description,
      buttons: slide.buttons.map((button) => ({ ...button })),
      showTrustPoints: slide.showTrustPoints,
      status: slide.status,
    });
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length || saving) return;
    const previous = slides;
    const next = slides.slice();
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    setSlides(next);
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/hero-slides/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((slide) => slide.id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not reorder slides");
      setMessage("Slide order saved.");
      router.refresh();
    } catch (reorderError) {
      setSlides(previous);
      setError(reorderError instanceof Error ? reorderError.message : "Could not reorder slides");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slide: AdminHeroSlide) => {
    if (saving) return;
    const label = slideHeading(slide);
    if (!window.confirm(`Delete “${label}”?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/hero-slides/${slide.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete that slide");
      setSlides((current) => current.filter((item) => item.id !== slide.id));
      setEditor((current) => (current?.id === slide.id ? null : current));
      setMessage("Slide deleted.");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete that slide");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!editor || saving) return;
    const buttons = editor.buttons.filter((button) => button.label.trim() || button.href.trim());
    if (!editor.backgroundImage.trim()) {
      setError("A background image is required.");
      return;
    }
    if (buttons.some((button) => !button.label.trim() || !button.href.trim())) {
      setError("Each button needs both a label and a link.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    const payload: HeroSlideContent = {
      backgroundImage: editor.backgroundImage.trim(),
      imageAlt: editor.imageAlt.trim(),
      title: editor.title.trim(),
      description: editor.description.trim(),
      buttons: buttons.map((button) => ({
        label: button.label.trim(),
        href: button.href.trim(),
        style: button.style,
      })),
      showTrustPoints: editor.showTrustPoints,
      status: editor.status,
    };

    try {
      const response = await fetch(editor.id ? `/api/admin/hero-slides/${editor.id}` : "/api/admin/hero-slides", {
        method: editor.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save that slide");
      const saved = data.slide as AdminHeroSlide;
      setSlides((current) => {
        const without = current.filter((item) => item.id !== saved.id);
        return [...without, saved].sort((a, b) => a.order - b.order);
      });
      setEditor(null);
      setMessage(editor.id ? "Slide updated." : "Slide added.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save that slide");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl text-primary-900">Hero slider</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The landing-page hero is a slider. Every slide needs a background image. The title,
            description, and buttons are optional, so a slide can be a photo on its own. Published
            slides replace the original hero. If none are published, that original hero stays up.
          </p>
        </div>
        <button type="button" className="btn-primary h-11 px-5 text-[15px]" onClick={openCreate}>
          Add slide
        </button>
      </div>

      {message ? <p className="mt-4 text-sm font-bold text-primary">{message}</p> : null}
      {!editor && error ? <p className="mt-4 text-sm font-bold text-error">{error}</p> : null}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="rounded-card border border-slate-200 bg-white">
          {slides.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-bold text-primary-900">No slides yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Visitors still see the original hero. Add a slide, or keep that hero and start editing it.
              </p>
              <button
                type="button"
                className="btn-outline mt-5 h-11 py-0 px-5 text-[15px]"
                onClick={() => setEditor({ ...currentHeroContent, buttons: currentHeroContent.buttons.map((button) => ({ ...button })) })}
              >
                Start from the current hero
              </button>
            </div>
          ) : (
            <ol className="divide-y divide-slate-200">
              {slides.map((slide, index) => (
                <li key={slide.id} className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
                  <img
                    src={slide.backgroundImage}
                    alt=""
                    className="h-16 w-28 shrink-0 rounded-lg bg-primary-900 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-primary-900">{slideHeading(slide)}</p>
                      <span
                        className={`chip ${
                          slide.status === "published"
                            ? "bg-success-tint text-primary-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {slide.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {slide.buttons.length === 0
                        ? "No buttons"
                        : `${slide.buttons.length} button${slide.buttons.length === 1 ? "" : "s"}`}
                      {slide.showTrustPoints ? " · Trust points" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-outline h-9 py-0 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => move(index, -1)}
                      disabled={saving || index === 0}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="btn-outline h-9 py-0 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => move(index, 1)}
                      disabled={saving || index === slides.length - 1}
                    >
                      Down
                    </button>
                    <button type="button" className="btn-outline h-9 py-0 px-3 text-sm" onClick={() => openEdit(slide)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="h-9 px-3 text-sm font-bold text-error disabled:opacity-40"
                      onClick={() => remove(slide)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="rounded-card border border-slate-200 bg-white p-6">
          <h2 className="font-display text-xl text-primary-900">What a slide can include</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Background image, required. A wide photo around 1440×716 works best.</li>
            <li>Title, description, and up to two buttons, all optional.</li>
            <li>Leave the words off for a full-bleed image.</li>
            <li>Drafts stay off the landing page.</li>
          </ul>
        </aside>
      </div>

      {editor ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-primary-900/40 px-4 py-8 sm:px-6"
          onMouseDown={() => {
            if (!saving) setEditor(null);
          }}
        >
          <SlideEditor
            editor={editor}
            saving={saving}
            error={error}
            onChange={setEditor}
            onCancel={() => setEditor(null)}
            onSave={save}
          />
        </div>
      ) : null}
    </main>
  );
}

function SlideEditor({
  editor,
  saving,
  error,
  onChange,
  onCancel,
  onSave,
}: {
  editor: EditorState;
  saving: boolean;
  error: string;
  onChange: (editor: EditorState) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const setButton = (index: number, patch: Partial<HeroButton>) => {
    onChange({
      ...editor,
      buttons: editor.buttons.map((button, buttonIndex) => (buttonIndex === index ? { ...button, ...patch } : button)),
    });
  };

  return (
    <form
      role="dialog"
      aria-modal="true"
      aria-labelledby="hero-slide-editor-title"
      className="mx-auto w-full max-w-5xl rounded-card border border-slate-200 bg-white p-6 shadow-form-card"
      onMouseDown={(event) => event.stopPropagation()}
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="hero-slide-editor-title" className="font-display text-xl text-primary-900">
          {editor.id ? "Edit slide" : "New slide"}
        </h2>
        <button type="button" className="text-sm font-bold text-slate-600 hover:text-primary-900" onClick={onCancel} disabled={saving}>
          Close
        </button>
      </div>
      {error ? <p className="mt-4 text-sm font-bold text-error">{error}</p> : null}
      <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
        <div className="contents lg:block lg:space-y-6">
          <ImageUploader
            label="Background image"
            hint="Required. JPEG, PNG, or WebP. Wide campus or city photos work best."
            kind="hero"
            slug="slide"
            showAlt
            images={editor.backgroundImage ? [{ url: editor.backgroundImage, alt: editor.imageAlt }] : []}
            onChange={(images) =>
              onChange({
                ...editor,
                backgroundImage: images[0]?.url || "",
                imageAlt: images[0]?.alt || "",
              })
            }
          />
          <ButtonFields editor={editor} onChange={onChange} setButton={setButton} className="hidden lg:block" />
        </div>

        <div className="space-y-4">
        <label className="block text-sm font-bold">
          Title
          <span className="ml-2 font-normal text-slate-600">Optional</span>
          <textarea
            value={editor.title}
            onChange={(event) => onChange({ ...editor, title: event.target.value })}
            rows={3}
            maxLength={180}
            className="input-field mt-1 h-auto py-3"
            placeholder={"Your degree in Türkiye\nstarts here"}
          />
          <span className="mt-1 block text-xs font-normal text-slate-600">Press Enter for a second line.</span>
        </label>

        <label className="block text-sm font-bold">
          Description
          <span className="ml-2 font-normal text-slate-600">Optional</span>
          <textarea
            value={editor.description}
            onChange={(event) => onChange({ ...editor, description: event.target.value })}
            rows={4}
            maxLength={500}
            className="input-field mt-1 h-auto py-3"
          />
        </label>

        <ButtonFields editor={editor} onChange={onChange} setButton={setButton} className="lg:hidden" />

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={editor.showTrustPoints}
            onChange={(event) => onChange({ ...editor, showTrustPoints: event.target.checked })}
          />
          <span>
            <span className="font-bold text-primary-900">Show trust points</span>
            <span className="mt-1 block text-slate-600">
              Free first consultation, Scholarships explained, and Support from application to arrival.
            </span>
          </span>
        </label>

        <label className="block text-sm font-bold">
          Status
          <select
            value={editor.status}
            onChange={(event) =>
              onChange({ ...editor, status: event.target.value === "draft" ? "draft" : "published" })
            }
            className="input-field mt-1"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary h-11 px-5 text-[15px]" disabled={saving}>
            {saving ? "Saving..." : editor.id ? "Save slide" : "Add slide"}
          </button>
          <button type="button" className="btn-outline h-11 py-0 px-5 text-[15px]" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        </div>
        </div>
      </div>
    </form>
  );
}

function ButtonFields({
  editor,
  onChange,
  setButton,
  className,
}: {
  editor: EditorState;
  onChange: (editor: EditorState) => void;
  setButton: (index: number, patch: Partial<HeroButton>) => void;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="text-sm font-bold">
        Buttons
        <span className="ml-2 font-normal text-slate-600">Optional, up to two</span>
      </legend>
      <div className="mt-3 space-y-3">
        {editor.buttons.map((button, index) => (
          <div key={index} className="rounded-input border border-slate-200 p-3">
            <label className="block text-xs font-bold text-slate-600">
              Label
              <input
                value={button.label}
                onChange={(event) => setButton(index, { label: event.target.value })}
                maxLength={40}
                className="input-field mt-1"
              />
            </label>
            <label className="mt-3 block text-xs font-bold text-slate-600">
              Link
              <input
                value={button.href}
                onChange={(event) => setButton(index, { href: event.target.value })}
                className="input-field mt-1"
                placeholder="/universities"
              />
            </label>
            <label className="mt-3 block text-xs font-bold text-slate-600">
              Style
              <select
                value={button.style}
                onChange={(event) => setButton(index, { style: event.target.value === "outline" ? "outline" : "solid" })}
                className="input-field mt-1"
              >
                <option value="solid">White</option>
                <option value="outline">Outline</option>
              </select>
            </label>
            <button
              type="button"
              className="mt-3 text-sm font-bold text-error"
              onClick={() =>
                onChange({ ...editor, buttons: editor.buttons.filter((_, buttonIndex) => buttonIndex !== index) })
              }
            >
              Remove button
            </button>
          </div>
        ))}
        {editor.buttons.length < 2 ? (
          <button
            type="button"
            className="btn-outline h-10 py-0 px-4 text-sm"
            onClick={() =>
              onChange({
                ...editor,
                buttons: [
                  ...editor.buttons,
                  { label: "", href: "", style: editor.buttons.length === 0 ? "solid" : "outline" },
                ],
              })
            }
          >
            Add button
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}
