"use client";

import { useRef, useState } from "react";

export type UploadedImage = {
  url: string;
  alt: string;
  publicId?: string;
};

type ImageKind = "logo" | "featured" | "gallery" | "photo";

type StoredResponse = {
  url?: string;
  publicId?: string;
  provider?: string;
  error?: string;
};

const ACCEPT: Record<ImageKind, string> = {
  logo: "image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg",
  featured: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
  gallery: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
  photo: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
};

export default function ImageUploader({
  label,
  hint,
  kind,
  slug,
  multiple = false,
  images,
  onChange,
  showAlt = true,
  max = 12,
}: {
  label: string;
  hint?: string;
  kind: ImageKind;
  slug?: string;
  multiple?: boolean;
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  showAlt?: boolean;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);
  const uploadedHere = useRef(new Set<string>());
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [urlDraft, setUrlDraft] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const atCapacity = multiple && images.length >= max;

  async function addFiles(list: FileList | File[] | null, replaceAt?: number) {
    const files = Array.from(list || []);
    if (!files.length || busy) return;
    setError("");
    const queue = multiple && replaceAt === undefined ? files : files.slice(0, 1);
    let next = images.slice();
    for (const file of queue) {
      if (multiple && replaceAt === undefined && next.length >= max) {
        setError(`You can add up to ${max} images.`);
        break;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10MB.");
        continue;
      }
      try {
        setBusy(true);
        setProgress(0);
        const stored = await uploadFile(file, kind, slug, setProgress);
        const image = { url: stored.url, alt: replaceAt !== undefined ? next[replaceAt]?.alt || "" : "", publicId: stored.publicId };
        uploadedHere.current.add(stored.url);
        if (replaceAt !== undefined) {
          const previous = next[replaceAt];
          next[replaceAt] = image;
          void forgetSessionUpload(previous, uploadedHere.current);
          replaceAt = undefined;
        } else if (multiple) {
          next = [...next, image];
        } else {
          const previous = next[0];
          next = [image];
          void forgetSessionUpload(previous, uploadedHere.current);
        }
        onChange(next);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      } finally {
        setBusy(false);
        setProgress(null);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
    if (replaceRef.current) replaceRef.current.value = "";
  }

  async function addUrl() {
    const url = urlDraft.trim();
    if (!url || busy) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, kind, slug }),
      });
      const data = (await response.json()) as StoredResponse;
      if (!response.ok || !data.url) throw new Error(data.error || "Could not use that image URL");
      const image = { url: data.url, alt: "", publicId: data.publicId };
      if (data.provider !== "local" || data.url.startsWith("/uploads/")) uploadedHere.current.add(data.url);
      if (multiple) {
        if (images.length >= max) {
          setError(`You can add up to ${max} images.`);
          return;
        }
        onChange([...images, image]);
      } else {
        void forgetSessionUpload(images[0], uploadedHere.current);
        onChange([{ ...image, alt: images[0]?.alt || "" }]);
      }
      setUrlDraft("");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not use that image URL");
    } finally {
      setBusy(false);
    }
  }

  function remove(index: number) {
    void forgetSessionUpload(images[index], uploadedHere.current);
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  }

  function setAlt(index: number, alt: string) {
    onChange(images.map((image, itemIndex) => (itemIndex === index ? { ...image, alt } : image)));
  }

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || to >= images.length) return;
    const next = images.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-bold">{label}</p>
        {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
      </div>

      {images.length > 0 && (
        <ul className={multiple ? "mb-3 grid gap-3 sm:grid-cols-2" : "mb-3 space-y-3"}>
          {images.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              draggable={multiple}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              className="rounded-input border border-slate-200 bg-slate-50 p-3"
            >
              <div className={`overflow-hidden rounded-lg bg-white ${kind === "logo" ? "mx-auto h-24 w-24" : "h-36 w-full"}`}>
                <img
                  src={image.url}
                  alt={image.alt || ""}
                  className={`h-full w-full ${kind === "logo" ? "object-contain" : "object-cover"}`}
                />
              </div>
              {showAlt && (
                <label className="mt-3 block text-xs font-bold text-slate-600">
                  Alt text
                  <input
                    value={image.alt}
                    onChange={(event) => setAlt(index, event.target.value)}
                    className="input-field mt-1"
                    placeholder={kind === "logo" ? "University logo" : "Campus courtyard in daylight"}
                  />
                </label>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-outline h-9 px-3 text-sm"
                  onClick={() => {
                    replaceIndex.current = index;
                    replaceRef.current?.click();
                  }}
                  disabled={busy}
                >
                  Replace
                </button>
                <button type="button" className="btn-outline h-9 px-3 text-sm" onClick={() => remove(index)} disabled={busy}>
                  Remove
                </button>
                {multiple && (
                  <>
                    <button type="button" className="btn-outline h-9 px-3 text-sm" onClick={() => move(index, index - 1)} disabled={index === 0}>
                      Move up
                    </button>
                    <button
                      type="button"
                      className="btn-outline h-9 px-3 text-sm"
                      onClick={() => move(index, index + 1)}
                      disabled={index === images.length - 1}
                    >
                      Move down
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {(multiple || images.length === 0) && !atCapacity && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            void addFiles(event.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center rounded-input border border-dashed px-4 py-8 text-center ${
            dragOver ? "border-primary bg-primary/5" : "border-slate-200 bg-white"
          }`}
        >
          <span className="text-sm font-bold text-primary-900">Drag an image here, or click to browse</span>
          <span className="mt-1 text-xs text-slate-600">
            {kind === "logo" ? "JPEG, PNG, WebP, or a safe SVG" : "JPEG, PNG, or WebP"} · 10 MB max
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => void addFiles(event.target.files)}
      />
      <input
        ref={replaceRef}
        type="file"
        accept={ACCEPT[kind]}
        className="sr-only"
        onChange={(event) => void addFiles(event.target.files, replaceIndex.current ?? undefined)}
      />

      {progress !== null && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200" aria-label="Upload progress">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          className="input-field"
          placeholder="Or paste an image URL"
          inputMode="url"
          disabled={busy || atCapacity}
        />
        <button type="button" className="btn-outline h-12 shrink-0 px-4" onClick={() => void addUrl()} disabled={busy || atCapacity || !urlDraft.trim()}>
          Add URL
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}

function uploadFile(file: File, kind: ImageKind, slug: string | undefined, onProgress: (value: number) => void) {
  return new Promise<Required<Pick<StoredResponse, "url">> & StoredResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    if (slug) body.append("slug", slug);
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let data: StoredResponse = {};
      try {
        data = JSON.parse(xhr.responseText || "{}") as StoredResponse;
      } catch {
        data = {};
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve({ ...data, url: data.url });
      else reject(new Error(data.error || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(body);
  });
}

function forgetSessionUpload(image: UploadedImage | undefined, uploadedHere: Set<string>) {
  if (!image || !uploadedHere.has(image.url)) return;
  uploadedHere.delete(image.url);
  void fetch("/api/admin/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: image.url, publicId: image.publicId }),
  }).catch(() => undefined);
}
