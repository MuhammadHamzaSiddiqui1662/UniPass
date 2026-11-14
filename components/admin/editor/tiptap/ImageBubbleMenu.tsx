"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu, type BubbleMenuProps } from "@tiptap/react/menus";

export default function ImageBubbleMenu({
  editor,
  hidden = false,
  onReplace,
}: {
  editor: Editor;
  hidden?: boolean;
  onReplace: () => void;
}) {
  const [showCaption, setShowCaption] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const selectionPos = editor.state.selection.from;
  const appendToBody = useCallback(() => document.body, []);
  const menuOptions = useMemo(() => ({ placement: "top" as const, offset: 8, strategy: "fixed" as const }), []);
  const shouldShow = useCallback<NonNullable<BubbleMenuProps["shouldShow"]>>(
    ({ editor: current }) => !hidden && current.isEditable && current.isActive("image"),
    [hidden],
  );

  useEffect(() => {
    setShowCaption(false);
    setShowLink(false);
  }, [selectionPos]);

  const attrs = editor.getAttributes("image") as {
    align?: string;
    caption?: string | null;
    href?: string | null;
  };
  const align = attrs.align === "center" || attrs.align === "right" ? attrs.align : "left";
  const caption = typeof attrs.caption === "string" ? attrs.caption : "";
  const href = typeof attrs.href === "string" ? attrs.href : "";

  const setAlign = (next: "left" | "center" | "right") => {
    editor.chain().focus().updateAttributes("image", { align: next }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      appendTo={appendToBody}
      shouldShow={shouldShow}
      options={menuOptions}
      className="guide-rte-image-menu"
    >
      <div className="guide-rte-image-menu-row">
        <MenuButton label="Replace image" onClick={onReplace}>
          <SwapIcon />
        </MenuButton>
        <MenuButton label="Align left" active={align === "left"} onClick={() => setAlign("left")}>
          <AlignLeftIcon />
        </MenuButton>
        <MenuButton label="Align center" active={align === "center"} onClick={() => setAlign("center")}>
          <AlignCenterIcon />
        </MenuButton>
        <MenuButton label="Align right" active={align === "right"} onClick={() => setAlign("right")}>
          <AlignRightIcon />
        </MenuButton>
        <MenuButton
          label="Caption"
          active={Boolean(caption) || showCaption}
          onClick={() => {
            setShowLink(false);
            setShowCaption((open) => !open);
          }}
        >
          <CaptionIcon />
        </MenuButton>
        <MenuButton label="Remove image" onClick={() => editor.chain().focus().deleteSelection().run()}>
          <TrashIcon />
        </MenuButton>
        <MenuButton
          label="Image link"
          active={Boolean(href) || showLink}
          onClick={() => {
            setShowCaption(false);
            setShowLink((open) => !open);
          }}
        >
          <LinkIcon />
        </MenuButton>
      </div>
      {showCaption ? (
        <input
          className="guide-rte-image-menu-input"
          value={caption}
          placeholder="Caption"
          aria-label="Caption"
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          onChange={(event) => {
            const next = event.target.value;
            editor.chain().focus().updateAttributes("image", { caption: next || null }).run();
          }}
        />
      ) : null}
      {showLink ? (
        <input
          className="guide-rte-image-menu-input"
          dir="ltr"
          value={href}
          placeholder="https://"
          aria-label="Image link"
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          onChange={(event) => {
            const next = event.target.value.trim();
            editor.chain().focus().updateAttributes("image", { href: next || null }).run();
          }}
        />
      ) : null}
    </BubbleMenu>
  );
}

function MenuButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={active ? "is-active" : undefined}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function AlignLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M4 6h16M4 12h10M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M4 6h16M7 12h10M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M4 6h16M10 12h10M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M4 7h16M9 7V5h6v2M8 7l1 13h6l1-13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CaptionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <rect x="4" y="4" width="16" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M7 20h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M7 7h11l-3-3M17 17H6l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
