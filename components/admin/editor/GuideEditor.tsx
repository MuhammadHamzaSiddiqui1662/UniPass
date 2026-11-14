"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { EditorContent, useEditor, type ChainedCommands, type Editor } from "@tiptap/react";
import { buildEditorExtensions } from "./tiptap/editorExtensions";
import GuideToolbar from "./tiptap/GuideToolbar";
import ImageBubbleMenu from "./tiptap/ImageBubbleMenu";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type GuideEditorHandle = {
  getHtml: () => string;
};

type StoredImage = { url?: string; error?: string };

const plainTextFromHtml = (content: string): string => {
  if (!content || typeof document === "undefined") return "";
  const temp = document.createElement("div");
  temp.innerHTML = content;
  return (temp.textContent || "").replace(/\u00a0/g, " ").trim();
};

const unwrapListItemParagraphs = (html: string): string => {
  if (!html || typeof document === "undefined" || !/<li[\s>]/i.test(html)) return html;
  const container = document.createElement("div");
  container.innerHTML = html;
  container.querySelectorAll("li").forEach((item) => {
    const paragraphs = Array.from(item.children).filter((element) => element.tagName === "P");
    paragraphs.forEach((paragraph, index) => {
      if (index > 0) item.insertBefore(document.createElement("br"), paragraph);
      while (paragraph.firstChild) item.insertBefore(paragraph.firstChild, paragraph);
      paragraph.remove();
    });
  });
  return container.innerHTML;
};

const normalizeEditorHtml = (html: string) => unwrapListItemParagraphs(html);

const imageFile = (list: FileList | null | undefined) => {
  const file = Array.from(list || []).find((item) => item.type.startsWith("image/"));
  return file || null;
};

async function storeGuideImage(file: File, slug: string) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("File too large. Maximum size is 10MB.");
  const body = new FormData();
  body.append("file", file);
  body.append("kind", "guide");
  if (slug) body.append("slug", slug);
  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await response.json()) as StoredImage;
  if (!response.ok || !data.url) throw new Error(data.error || "Upload failed");
  return data.url;
}

async function rehostGuideImage(url: string, slug: string) {
  const response = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, kind: "guide", slug }),
  });
  const data = (await response.json()) as StoredImage;
  if (!response.ok || !data.url) throw new Error(data.error || "Could not use that image URL");
  return data.url;
}

const GuideEditor = forwardRef<GuideEditorHandle, { initialHtml?: string; slug?: string; placeholder?: string }>(
  function GuideEditor({ initialHtml = "", slug = "", placeholder = "Write the guide…" }, ref) {
    const slugRef = useRef(slug);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<{ from: number; to: number } | null>(null);
    const placeholderRef = useRef(placeholder);
    const codeViewRef = useRef(false);
    const codeHtmlRef = useRef(initialHtml);
    const codeSnapshotRef = useRef("");
    const uploadFileRef = useRef<(file: File, at?: number) => Promise<void>>(async () => undefined);
    slugRef.current = slug;
    placeholderRef.current = placeholder;

    const [codeView, setCodeView] = useState(false);
    const [codeHtml, setCodeHtml] = useState(initialHtml);
    const [areaHeight, setAreaHeight] = useState(360);
    const [showImageModal, setShowImageModal] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const imagePosRef = useRef<number | null>(null);

    const extensions = useMemo(() => buildEditorExtensions(() => placeholderRef.current), []);
    const editorProps = useMemo(
      () => ({
        attributes: { spellcheck: "true" },
        handlePaste: (_view: unknown, event: ClipboardEvent) => {
          const file = imageFile(event.clipboardData?.files);
          if (!file) return false;
          event.preventDefault();
          void uploadFileRef.current(file);
          return true;
        },
        handleDrop: (view: { posAtCoords: (coords: { left: number; top: number }) => { pos: number } | null }, event: DragEvent) => {
          const file = imageFile(event.dataTransfer?.files);
          if (!file) return false;
          event.preventDefault();
          const position = view.posAtCoords({ left: event.clientX, top: event.clientY });
          void uploadFileRef.current(file, position?.pos);
          return true;
        },
      }),
      [],
    );

    const editor = useEditor({
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions,
      content: initialHtml,
      editorProps,
    });

    const readHtml = (current: Editor | null) => {
      if (codeViewRef.current) return codeHtmlRef.current;
      if (!current || current.isDestroyed) return initialHtml;
      return normalizeEditorHtml(current.getHTML());
    };

    useImperativeHandle(ref, () => ({
      getHtml: () => readHtml(editor),
    }));

    useEffect(() => {
      if (!editor || editor.isDestroyed) return;
      editor.setEditable(!codeView, false);
    }, [editor, codeView]);

    const rememberSelection = () => {
      if (!editor || editor.isDestroyed) return;
      const { from, to } = editor.state.selection;
      selectionRef.current = { from, to };
    };

    const applyWithSelection = (run: (chain: ChainedCommands) => void) => {
      if (!editor) return;
      const chain = editor.chain().focus();
      if (selectionRef.current) chain.setTextSelection(selectionRef.current);
      run(chain);
    };

    const insertImage = (url: string, alt: string, at?: number | null) => {
      if (!editor) return;
      if (at != null) {
        const pos = at;
        editor.chain().focus().setNodeSelection(pos).updateAttributes("image", { src: url, alt: alt || "Guide image" }).run();
        return;
      }
      applyWithSelection((chain) => {
        chain.setImage({ src: url, alt: alt || "Guide image" }).run();
      });
    };

    uploadFileRef.current = async (file, at) => {
      setUploadError("");
      try {
        const url = await storeGuideImage(file, slugRef.current);
        if (at != null && editor) {
          editor.chain().focus().insertContentAt(at, { type: "image", attrs: { src: url, alt: file.name || "Guide image" } }).run();
          return;
        }
        insertImage(url, file.name || "Guide image");
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed");
      }
    };

    const toggleCodeView = () => {
      if (!editor) return;
      if (codeView) {
        const next = codeHtmlRef.current;
        const edited = next !== codeSnapshotRef.current;
        editor.commands.setContent(edited ? next : codeSnapshotRef.current, { emitUpdate: false });
        codeViewRef.current = false;
        setCodeView(false);
        if (edited) {
          const normalized = normalizeEditorHtml(editor.getHTML());
          codeHtmlRef.current = normalized;
          setCodeHtml(normalized);
        }
        return;
      }
      const html = normalizeEditorHtml(editor.getHTML());
      codeSnapshotRef.current = html;
      codeHtmlRef.current = html;
      setCodeHtml(html);
      codeViewRef.current = true;
      setCodeView(true);
    };

    const onResizeStart = (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startY = event.clientY;
      const startHeight = areaHeight;
      const onMove = (moveEvent: MouseEvent) => {
        setAreaHeight(Math.max(180, startHeight + (moveEvent.clientY - startY)));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    return (
      <div ref={containerRef} className={`guide-editor${codeView ? " is-source" : ""}`} style={{ ["--rte-height" as string]: `${areaHeight}px` }}>
        {editor ? (
          <GuideToolbar
            editor={editor}
            codeView={codeView}
            onToggleCodeView={toggleCodeView}
            rememberSelection={rememberSelection}
            applyWithSelection={applyWithSelection}
            onInsertImage={() => {
              imagePosRef.current = null;
              rememberSelection();
              setShowImageModal(true);
              setUploadError("");
            }}
          />
        ) : (
          <div className="guide-editor-toolbar" />
        )}
        <div className="guide-editor-body">
          <EditorContent editor={editor} />
          {editor ? (
            <ImageBubbleMenu
              editor={editor}
              hidden={showImageModal || codeView}
              onReplace={() => {
                imagePosRef.current = editor.state.selection.from;
                setShowImageModal(true);
                setUploadError("");
              }}
            />
          ) : null}
        </div>
        {codeView ? (
          <textarea
            className="guide-editor-source"
            dir="ltr"
            spellCheck={false}
            aria-label="HTML source"
            value={codeHtml}
            onChange={(event) => {
              codeHtmlRef.current = event.target.value;
              setCodeHtml(event.target.value);
            }}
          />
        ) : null}
        <div className="guide-editor-resize" onMouseDown={onResizeStart} />
        {uploadError ? <p className="guide-editor-error">{uploadError}</p> : null}
        {showImageModal ? (
          <ImageInsertDialog
            slug={slug}
            onClose={() => {
              imagePosRef.current = null;
              setShowImageModal(false);
            }}
            onInsert={(url, alt) => {
              insertImage(url, alt, imagePosRef.current);
              imagePosRef.current = null;
              setShowImageModal(false);
            }}
          />
        ) : null}
      </div>
    );
  },
);

function ImageInsertDialog({
  slug,
  onClose,
  onInsert,
}: {
  slug: string;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  async function useFile(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const stored = await storeGuideImage(file, slug);
      onInsert(stored, alt || file.name || "Guide image");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      setBusy(false);
    }
  }

  async function useUrl() {
    const next = url.trim();
    if (!next || busy) return;
    setBusy(true);
    setError("");
    try {
      const stored = await rehostGuideImage(next, slug);
      onInsert(stored, alt || "Guide image");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not use that image URL");
      setBusy(false);
    }
  }

  return (
    <div className="guide-rte-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="guide-rte-modal"
        role="dialog"
        aria-labelledby="guide-image-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="guide-rte-modal-head">
          <div>
            <h3 id="guide-image-title">Insert image</h3>
            <p>JPEG, PNG, or WebP, up to 10 MB.</p>
          </div>
          <button type="button" className="guide-rte-modal-close" aria-label="Close" onClick={onClose} disabled={busy}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <label htmlFor="guide-image-alt">Alt text</label>
        <input
          id="guide-image-alt"
          className="input-field"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          placeholder="Students outside the campus gate"
          disabled={busy}
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            void useFile(event.dataTransfer.files?.[0]);
          }}
          className={`guide-rte-drop${dragOver ? " is-over" : ""}`}
        >
          <span>{busy ? "Uploading…" : "Drag an image here, or click to browse"}</span>
          <span>The picture is inserted at the cursor.</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={(event) => void useFile(event.target.files?.[0])}
        />

        <div className="guide-rte-or" aria-hidden="true"><span>or</span></div>

        <label htmlFor="guide-image-url">Image URL</label>
        <div className="guide-rte-url-row">
          <input
            id="guide-image-url"
            className="input-field"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://"
            inputMode="url"
            disabled={busy}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void useUrl();
              }
            }}
          />
          <button type="button" className="btn-primary h-12 shrink-0 px-5 py-0 text-[15px]" disabled={busy || !url.trim()} onClick={() => void useUrl()}>
            Add URL
          </button>
        </div>
        {error ? <p className="guide-rte-modal-error">{error}</p> : null}
      </div>
    </div>
  );
}

export default GuideEditor;
