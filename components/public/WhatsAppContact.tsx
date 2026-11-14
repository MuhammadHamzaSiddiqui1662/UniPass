"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { whatsappDisplayNumber, whatsappHref } from "@/lib/site/contact";
import { useSiteContact } from "@/components/public/SiteContactProvider";

/** Laptops open WhatsApp Web. Phones and tablets open the app. */
const DESKTOP_POINTER = "(hover: hover) and (pointer: fine)";
const CARD_WIDTH = 280;
const GAP = 8;
const MARGIN = 12;
const SHADOW = 16;

const copyButtonClass =
  "inline-flex h-10 items-center justify-center rounded-input bg-whatsapp px-4 text-[14px] font-bold text-white transition-colors hover:bg-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2";

type CardPosition = { top: number; left: number; width: number };

function cardWidth() {
  return Math.min(CARD_WIDTH, window.innerWidth - MARGIN * 2);
}

function placeCard(trigger: HTMLElement, card: HTMLElement | null): CardPosition {
  const width = cardWidth();
  const height = card?.offsetHeight ?? 188;
  const rect = trigger.getBoundingClientRect();
  let left = rect.left;
  const maxLeft = window.innerWidth - width - MARGIN;
  if (left > maxLeft) left = Math.max(MARGIN, rect.right - width);
  if (left < MARGIN) left = MARGIN;

  const belowTop = rect.bottom + GAP;
  const aboveTop = rect.top - GAP - height;
  const fitsBelow = belowTop + height + SHADOW <= window.innerHeight - MARGIN;
  let top = fitsBelow ? belowTop : aboveTop;
  if (top < MARGIN) top = MARGIN;
  return { top, left, width };
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Selection fallback covers browsers that block the async clipboard.
    }
  }
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function useCopiedFlag() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function markCopied() {
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return { copied, markCopied, clearCopied: () => setCopied(false) };
}

interface WhatsAppContactProps {
  className?: string;
  children: ReactNode;
  /** Runs only when the click opens WhatsApp, such as closing a phone menu. */
  onNavigate?: () => void;
}

export default function WhatsAppContact({ className, children, onNavigate }: WhatsAppContactProps) {
  const { whatsappNumber } = useSiteContact();
  const display = whatsappDisplayNumber(whatsappNumber);
  const href = whatsappHref(whatsappNumber);
  const dialogId = useId();
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [position, setPosition] = useState<CardPosition | null>(null);
  const { copied, markCopied, clearCopied } = useCopiedFlag();

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_POINTER);
    const update = () => {
      setDesktop(media.matches);
      if (!media.matches) setOpen(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const next = placeCard(trigger, cardRef.current);
    setPosition((current) =>
      current && current.top === next.top && current.left === next.left && current.width === next.width
        ? current
        : next
    );
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const focusTarget = cardRef.current?.querySelector<HTMLElement>("button, a") ?? cardRef.current;
    focusTarget?.focus({ preventScroll: true });

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger?.focus({ preventScroll: true });
        return;
      }
      if (event.key === "PageDown" || event.key === "PageUp" || event.key === "Home" || event.key === "End") {
        setOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (cardRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    function closeOnScrollGesture() {
      setOpen(false);
    }

    function onResize() {
      const node = triggerRef.current;
      if (!node) return;
      setPosition(placeCard(node, cardRef.current));
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("wheel", closeOnScrollGesture, { passive: true });
    window.addEventListener("touchmove", closeOnScrollGesture, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("wheel", closeOnScrollGesture);
      window.removeEventListener("touchmove", closeOnScrollGesture);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0 ||
      !window.matchMedia(DESKTOP_POINTER).matches
    ) {
      onNavigate?.();
      return;
    }
    event.preventDefault();
    if (open) {
      setOpen(false);
      return;
    }
    clearCopied();
    const trigger = triggerRef.current;
    if (trigger) setPosition(placeCard(trigger, null));
    setOpen(true);
  }

  async function onCopy() {
    if (!display) return;
    await copyText(display);
    markCopied();
  }

  const card =
    open && position
      ? createPortal(
          <div
            ref={cardRef}
            id={dialogId}
            role="dialog"
            aria-label="WhatsApp number"
            tabIndex={-1}
            style={{ top: position.top, left: position.left, width: position.width }}
            className="fixed z-[70] rounded-panel border border-slate-200 bg-white p-4 shadow-form-card outline-none"
          >
            {display ? (
              <>
                <p className="text-[13px] font-bold text-slate-600">WhatsApp</p>
                <p className="mt-1 select-all font-display text-[22px] leading-7 text-primary-900">{display}</p>
                <p className="mt-2 text-[14px] leading-5 text-slate-600">
                  Save this number and message us from your phone.
                </p>
                <button type="button" onClick={onCopy} className={`${copyButtonClass} mt-3 w-full`}>
                  {copied ? "Copied" : "Copy number"}
                </button>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center text-[14px] font-bold text-primary hover:underline"
                >
                  Open WhatsApp Web
                </a>
                <p className="sr-only" aria-live="polite">
                  {copied ? "Number copied" : ""}
                </p>
              </>
            ) : (
              <p className="text-[14px] leading-5 text-slate-600">This number is not available yet.</p>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <a
        ref={triggerRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-expanded={desktop ? open : undefined}
        aria-haspopup={desktop ? "dialog" : undefined}
        aria-controls={open ? dialogId : undefined}
        onClick={onClick}
      >
        {children}
      </a>
      {card}
    </>
  );
}

export function WhatsAppNumberCopy() {
  const { whatsappNumber } = useSiteContact();
  const display = whatsappDisplayNumber(whatsappNumber);
  const { copied, markCopied } = useCopiedFlag();

  if (!display) {
    return <p className="text-slate-600">This number is not available yet.</p>;
  }

  const number = display;

  async function onCopy() {
    await copyText(number);
    markCopied();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="select-all text-whatsapp">{display}</span>
      <button type="button" onClick={onCopy} className={`${copyButtonClass} min-w-[7.5rem]`}>
        {copied ? "Copied" : "Copy number"}
      </button>
      <p className="sr-only" aria-live="polite">
        {copied ? "Number copied" : ""}
      </p>
    </div>
  );
}
