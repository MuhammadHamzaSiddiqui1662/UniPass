"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getMarkRange } from "@tiptap/core";
import type { ChainedCommands, Editor } from "@tiptap/react";

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36];
const TEXT_COLORS = ["#1C1930", "#453F78", "#373260", "#475569", "#94A3B8", "#DC2626", "#EA580C", "#D4A72C", "#15803D", "#0891B2", "#2563EB", "#7C3AED", "#DB2777", "#000000"];
const HIGHLIGHT_COLORS = ["#FEF08A", "#FDE68A", "#FED7AA", "#FECACA", "#FBCFE8", "#E9D5FF", "#BFDBFE", "#A5F3FC", "#BBF7D0", "#E2E8F0"];
const TABLE_SIZE = 8;

export default function GuideToolbar({
  editor,
  codeView,
  onToggleCodeView,
  onInsertImage,
  rememberSelection,
  applyWithSelection,
}: {
  editor: Editor;
  codeView: boolean;
  onToggleCodeView: () => void;
  onInsertImage: () => void;
  rememberSelection: () => void;
  applyWithSelection: (run: (chain: ChainedCommands) => void) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkOriginalText, setLinkOriginalText] = useState("");
  const [openInNewWindow, setOpenInNewWindow] = useState(true);
  const [editingLink, setEditingLink] = useState(false);
  const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });
  const formattingOff = codeView;

  useEffect(() => {
    if (!openMenu || openMenu === "link") return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenu]);

  const run = (command: (chain: ChainedCommands) => void) => {
    if (formattingOff) return;
    applyWithSelection(command);
  };

  const textStyle = editor.getAttributes("textStyle") as { fontSize?: string; color?: string };
  const currentSize = String(textStyle.fontSize ?? "").replace("px", "");
  const currentColor = textStyle.color || "#1C1930";
  const currentHighlight = String(editor.getAttributes("highlight").color ?? "");

  const formatLabel = () => {
    for (let level = 1; level <= 6; level += 1) {
      if (editor.isActive("heading", { level })) return `Heading ${level}`;
    }
    if (editor.isActive("blockquote")) return "Quote";
    if (editor.isActive("codeBlock")) return "Code block";
    return "Paragraph";
  };

  const openLinkDialog = () => {
    rememberSelection();
    const { state } = editor;
    const linkType = state.schema.marks.link;
    const markRange = linkType ? getMarkRange(state.selection.$from, linkType) : undefined;
    const from = markRange?.from ?? state.selection.from;
    const to = markRange?.to ?? state.selection.to;
    const text = state.doc.textBetween(from, to, "");
    const attrs = editor.getAttributes("link") as { href?: string | null; target?: string | null };
    setEditingLink(editor.isActive("link"));
    setLinkUrl(typeof attrs.href === "string" ? attrs.href : "");
    setLinkText(text);
    setLinkOriginalText(text);
    setOpenInNewWindow(attrs.target !== "_self" && (attrs.target === "_blank" || !editor.isActive("link")));
    setOpenMenu("link");
  };

  const applyLink = () => {
    const href = linkUrl.trim();
    if (!href) return;
    const text = linkText.trim() || href;
    const attrs = {
      href,
      target: openInNewWindow ? "_blank" : null,
      rel: openInNewWindow ? "noopener noreferrer" : null,
    };
    const linkedText = { type: "text", text, marks: [{ type: "link", attrs }] };
    applyWithSelection((chain) => {
      const collapsed = editor.state.selection.empty && !editingLink;
      const textChanged = text !== linkOriginalText;
      if (collapsed) {
        chain.insertContent(linkedText).run();
        return;
      }
      if (textChanged) {
        chain.extendMarkRange("link").insertContent(linkedText).run();
        return;
      }
      chain.extendMarkRange("link").setMark("link", attrs).run();
    });
    setOpenMenu(null);
  };

  const toggle = (name: string) => setOpenMenu((current) => (current === name ? null : name));

  return (
    <div
      ref={rootRef}
      className="guide-editor-toolbar"
      onMouseDown={(event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest("input, textarea, select, a")) return;
        event.preventDefault();
        rememberSelection();
      }}
    >
      <div className="guide-rte-group">
        <ToolButton title="Undo" disabled={formattingOff || !editor.can().undo()} onClick={() => run((chain) => chain.undo().run())}>
          <UndoIcon />
        </ToolButton>
        <ToolButton title="Redo" disabled={formattingOff || !editor.can().redo()} onClick={() => run((chain) => chain.redo().run())}>
          <RedoIcon />
        </ToolButton>
      </div>

      <div className="guide-rte-group">
        <MenuButton title="Format" label={formatLabel()} disabled={formattingOff} open={openMenu === "format"} onClick={() => toggle("format")} />
        {openMenu === "format" ? (
          <div className="guide-rte-menu">
            <MenuItem label="Paragraph" active={editor.isActive("paragraph")} onClick={() => { run((chain) => chain.setParagraph().run()); setOpenMenu(null); }} />
            {([1, 2, 3, 4] as const).map((level) => (
              <MenuItem
                key={level}
                label={`Heading ${level}`}
                active={editor.isActive("heading", { level })}
                onClick={() => {
                  run((chain) => chain.setNode("heading", { level }).run());
                  setOpenMenu(null);
                }}
              />
            ))}
            <MenuItem label="Quote" active={editor.isActive("blockquote")} onClick={() => { run((chain) => chain.toggleBlockquote().run()); setOpenMenu(null); }} />
            <MenuItem label="Code block" active={editor.isActive("codeBlock")} onClick={() => { run((chain) => chain.toggleCodeBlock().run()); setOpenMenu(null); }} />
          </div>
        ) : null}
      </div>

      <div className="guide-rte-group">
        <MenuButton title="Font size" label={currentSize || "Size"} disabled={formattingOff} open={openMenu === "size"} onClick={() => toggle("size")} />
        {openMenu === "size" ? (
          <div className="guide-rte-menu guide-rte-menu-scroll">
            <MenuItem label="Default" active={!currentSize} onClick={() => { run((chain) => chain.unsetFontSize().run()); setOpenMenu(null); }} />
            {FONT_SIZES.map((size) => (
              <MenuItem
                key={size}
                label={String(size)}
                active={currentSize === String(size)}
                onClick={() => {
                  run((chain) => chain.setFontSize(`${size}px`).run());
                  setOpenMenu(null);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="guide-rte-group">
        <ToolButton title="Text color" disabled={formattingOff} active={openMenu === "color"} onClick={() => toggle("color")}>
          <span className="guide-rte-color-letter" style={{ borderBottomColor: currentColor }}>A</span>
        </ToolButton>
        {openMenu === "color" ? (
          <ColorGrid
            colors={TEXT_COLORS}
            current={currentColor}
            onPick={(color) => {
              run((chain) => chain.setColor(color).run());
              setOpenMenu(null);
            }}
            onClear={() => {
              run((chain) => chain.unsetColor().run());
              setOpenMenu(null);
            }}
          />
        ) : null}
        <ToolButton title="Highlight" disabled={formattingOff} active={openMenu === "highlight" || Boolean(currentHighlight)} onClick={() => toggle("highlight")}>
          <span className="guide-rte-color-letter" style={{ borderBottomColor: currentHighlight || "#FDE68A" }}>H</span>
        </ToolButton>
        {openMenu === "highlight" ? (
          <ColorGrid
            colors={HIGHLIGHT_COLORS}
            current={currentHighlight}
            onPick={(color) => {
              run((chain) => chain.setHighlight({ color }).run());
              setOpenMenu(null);
            }}
            onClear={() => {
              run((chain) => chain.unsetHighlight().run());
              setOpenMenu(null);
            }}
          />
        ) : null}
      </div>

      <div className="guide-rte-group">
        <ToolButton title="Bold" disabled={formattingOff} active={editor.isActive("bold")} onClick={() => run((chain) => chain.toggleBold().run())}><BoldIcon /></ToolButton>
        <ToolButton title="Italic" disabled={formattingOff} active={editor.isActive("italic")} onClick={() => run((chain) => chain.toggleItalic().run())}><ItalicIcon /></ToolButton>
        <ToolButton title="Underline" disabled={formattingOff} active={editor.isActive("underline")} onClick={() => run((chain) => chain.toggleUnderline().run())}><UnderlineIcon /></ToolButton>
        <ToolButton title="Strikethrough" disabled={formattingOff} active={editor.isActive("strike")} onClick={() => run((chain) => chain.toggleStrike().run())}><StrikeIcon /></ToolButton>
        <ToolButton
          title="Clear formatting"
          disabled={formattingOff}
          onClick={() => run((chain) => chain.unsetAllMarks().clearNodes().resetIndent().run())}
        >
          <ClearIcon />
        </ToolButton>
      </div>

      <div className="guide-rte-group">
        <ToolButton
          title="Outdent"
          disabled={formattingOff}
          onClick={() => run((chain) => (editor.isActive("listItem") ? chain.liftListItem("listItem").run() : chain.outdent().run()))}
        >
          <OutdentIcon />
        </ToolButton>
        <ToolButton
          title="Indent"
          disabled={formattingOff}
          onClick={() => run((chain) => (editor.isActive("listItem") ? chain.sinkListItem("listItem").run() : chain.indent().run()))}
        >
          <IndentIcon />
        </ToolButton>
      </div>

      <div className="guide-rte-group">
        <ToolButton title="Align" disabled={formattingOff} active={openMenu === "align"} onClick={() => toggle("align")}><AlignIcon /><Caret /></ToolButton>
        {openMenu === "align" ? (
          <div className="guide-rte-menu">
            {(["left", "center", "right", "justify"] as const).map((align) => (
              <MenuItem
                key={align}
                label={align === "justify" ? "Justify" : align[0].toUpperCase() + align.slice(1)}
                active={editor.isActive({ textAlign: align })}
                onClick={() => {
                  run((chain) => chain.setTextAlign(align).run());
                  setOpenMenu(null);
                }}
              />
            ))}
          </div>
        ) : null}
        <ToolButton title="Lists" disabled={formattingOff} active={openMenu === "list" || editor.isActive("bulletList") || editor.isActive("orderedList")} onClick={() => toggle("list")}>
          <ListIcon /><Caret />
        </ToolButton>
        {openMenu === "list" ? (
          <div className="guide-rte-menu">
            <MenuItem label="Bullet list" active={editor.isActive("bulletList")} onClick={() => { run((chain) => chain.toggleBulletList().run()); setOpenMenu(null); }} />
            <MenuItem label="Numbered list" active={editor.isActive("orderedList")} onClick={() => { run((chain) => chain.toggleOrderedList().run()); setOpenMenu(null); }} />
          </div>
        ) : null}
        <ToolButton title="Table" disabled={formattingOff} active={openMenu === "table" || editor.isActive("table")} onClick={() => { setTableHover({ rows: 0, cols: 0 }); toggle("table"); }}>
          <TableIcon />
        </ToolButton>
        {openMenu === "table" ? (
          <div className="guide-rte-panel">
            <div className="guide-rte-table-grid" onMouseLeave={() => setTableHover({ rows: 0, cols: 0 })}>
              {Array.from({ length: TABLE_SIZE }, (_, row) =>
                Array.from({ length: TABLE_SIZE }, (_, col) => (
                  <button
                    key={`${row}-${col}`}
                    type="button"
                    className={row < tableHover.rows && col < tableHover.cols ? "is-hot" : undefined}
                    onMouseEnter={() => setTableHover({ rows: row + 1, cols: col + 1 })}
                    onClick={() => {
                      run((chain) => chain.insertTable({ rows: row + 1, cols: col + 1, withHeaderRow: true }).run());
                      setOpenMenu(null);
                    }}
                  />
                )),
              )}
            </div>
            <p className="guide-rte-table-label">{tableHover.rows > 0 ? `${tableHover.rows} × ${tableHover.cols}` : "Insert table"}</p>
            {editor.isActive("table") ? (
              <div className="guide-rte-table-actions">
                <button type="button" onClick={() => { run((chain) => chain.addRowAfter().run()); setOpenMenu(null); }}>Add row</button>
                <button type="button" onClick={() => { run((chain) => chain.deleteRow().run()); setOpenMenu(null); }}>Delete row</button>
                <button type="button" onClick={() => { run((chain) => chain.addColumnAfter().run()); setOpenMenu(null); }}>Add column</button>
                <button type="button" onClick={() => { run((chain) => chain.deleteColumn().run()); setOpenMenu(null); }}>Delete column</button>
                <button type="button" onClick={() => { run((chain) => chain.toggleHeaderRow().run()); setOpenMenu(null); }}>Header row</button>
                <button type="button" onClick={() => { run((chain) => chain.deleteTable().run()); setOpenMenu(null); }}>Delete table</button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="guide-rte-group">
        <ToolButton title="Insert link" disabled={formattingOff} active={editor.isActive("link") || openMenu === "link"} onClick={openLinkDialog}>
          <LinkIcon />
        </ToolButton>
        <ToolButton title="Insert image" disabled={formattingOff} onClick={onInsertImage}>
          <ImageIcon />
        </ToolButton>
      </div>

      <div className="guide-rte-group">
        <ToolButton title="HTML source" active={codeView} onClick={onToggleCodeView}>
          <CodeIcon />
        </ToolButton>
      </div>

      {openMenu === "link" ? (
        <div className="guide-rte-dialog" role="dialog" aria-label="Insert link">
          <label htmlFor="guide-rte-link-url">Link URL</label>
          <input
            id="guide-rte-link-url"
            dir="ltr"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
            }}
            placeholder="https://"
          />
          <label htmlFor="guide-rte-link-text">Link text</label>
          <input
            id="guide-rte-link-text"
            value={linkText}
            onChange={(event) => setLinkText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
            }}
          />
          <label className="guide-rte-check">
            <input type="checkbox" checked={openInNewWindow} onChange={(event) => setOpenInNewWindow(event.target.checked)} />
            Open in a new tab
          </label>
          <div className="guide-rte-dialog-actions">
            {editingLink ? (
              <button
                type="button"
                onClick={() => {
                  applyWithSelection((chain) => chain.extendMarkRange("link").unsetLink().run());
                  setOpenMenu(null);
                }}
              >
                Remove
              </button>
            ) : null}
            <button type="button" onClick={() => setOpenMenu(null)}>Cancel</button>
            <button type="button" className="is-primary" onClick={applyLink}>Apply</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToolButton({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`guide-rte-btn${active ? " is-active" : ""}`}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MenuButton({
  title,
  label,
  disabled,
  open,
  onClick,
}: {
  title: string;
  label: string;
  disabled?: boolean;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`guide-rte-select${open ? " is-active" : ""}`} title={title} aria-label={title} aria-expanded={open} disabled={disabled} onClick={onClick}>
      <span>{label}</span>
      <Caret />
    </button>
  );
}

function MenuItem({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={active ? "is-active" : undefined} onClick={onClick}>
      {label}
    </button>
  );
}

function ColorGrid({
  colors,
  current,
  onPick,
  onClear,
}: {
  colors: string[];
  current: string;
  onPick: (color: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="guide-rte-panel">
      <div className="guide-rte-colors">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            aria-label={color}
            className={current.toLowerCase() === color.toLowerCase() ? "is-active" : undefined}
            style={{ background: color }}
            onClick={() => onPick(color)}
          />
        ))}
      </div>
      <button type="button" className="guide-rte-clear" onClick={onClear}>Clear</button>
    </div>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M8 8H5V5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 13a7 7 0 1 0 1.6-5.5L5 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M16 8h3V5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 13a7 7 0 1 1-1.6-5.5L19 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BoldIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M7 5h6.5a3.5 3.5 0 0 1 0 7H7zM7 12h7.5a3.5 3.5 0 0 1 0 7H7z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

function ItalicIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M10 5h8M6 19h8M14 5l-4 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function UnderlineIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M7 5v6a5 5 0 0 0 10 0V5M6 19h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function StrikeIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M5 12h14M8 7.5A3.5 3.5 0 0 1 12 5h1a3 3 0 0 1 0 6M9 16.5A3.5 3.5 0 0 0 12.5 19H14a3 3 0 0 0 0-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function ClearIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 7h16M9 7l1 12h4l1-12M10 4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M5 19l14-14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function IndentIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 6h16M4 18h16M10 12h10M4 12l3 2.2V9.8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function OutdentIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 6h16M4 18h16M10 12h10M7 12L4 9.8v4.4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function AlignIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function ListIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="4.5" cy="6" r="1" fill="currentColor" /><circle cx="4.5" cy="12" r="1" fill="currentColor" /><circle cx="4.5" cy="18" r="1" fill="currentColor" /></svg>;
}

function TableIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 10h16M4 15h16M10 5v14" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

function LinkIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function ImageIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="10" r="1.4" fill="currentColor" /><path d="M7 16l3.2-3.2a1 1 0 0 1 1.4 0L16 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function CodeIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
