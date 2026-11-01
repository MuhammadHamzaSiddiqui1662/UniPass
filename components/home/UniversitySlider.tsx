"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

function cardsPerView() {
  if (typeof window === "undefined") return 1;
  if (window.matchMedia("(min-width: 1280px)").matches) return 3;
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
}

export default function UniversitySlider({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const scroller = useRef<HTMLDivElement>(null);
  const offsets = useRef<number[]>([0]);
  const snapping = useRef(false);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const node = scroller.current;
    if (!node || slides.length === 0) return { pages: 1, points: [0], perView: 1 };
    const perView = cardsPerView();
    const pages = Math.max(1, Math.ceil(slides.length / perView));
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
    const origin = (node.children[0] as HTMLElement | undefined)?.offsetLeft ?? 0;
    const points = Array.from({ length: pages }, (_, index) => {
      const start = node.children[index * perView] as HTMLElement | undefined;
      const left = start ? start.offsetLeft - origin : maxScroll;
      return Math.min(Math.max(0, left), maxScroll);
    });
    if (points.length) points[points.length - 1] = maxScroll;
    offsets.current = points;
    return { pages, points, perView };
  }, [slides.length]);

  const scrollToPage = useCallback((next: number, behavior: ScrollBehavior = "smooth") => {
    const node = scroller.current;
    if (!node) return;
    const points = offsets.current;
    const clamped = Math.max(0, Math.min(next, points.length - 1));
    node.scrollTo({ left: points[clamped] ?? 0, behavior });
    setPage(clamped);
  }, []);

  const nearestPage = useCallback((scrollLeft: number) => {
    const points = offsets.current;
    let closest = 0;
    let distance = Infinity;
    points.forEach((point, index) => {
      const delta = Math.abs(scrollLeft - point);
      if (delta < distance) {
        distance = delta;
        closest = index;
      }
    });
    return { closest, distance };
  }, []);

  const syncPage = useCallback(() => {
    const node = scroller.current;
    if (!node || snapping.current) return;
    const { closest, distance } = nearestPage(node.scrollLeft);
    setPage(closest);
    if (distance > 4) {
      snapping.current = true;
      node.scrollTo({ left: offsets.current[closest] ?? 0, behavior: "smooth" });
      window.setTimeout(() => {
        snapping.current = false;
      }, 450);
    }
  }, [nearestPage]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const apply = () => {
      const { pages, points } = measure();
      setPageCount(pages);
      setPage((current) => {
        const clamped = Math.min(current, pages - 1);
        node.scrollTo({ left: points[clamped] ?? 0, behavior: "auto" });
        return clamped;
      });
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    const queries = ["(min-width: 1280px)", "(min-width: 768px)"].map((query) => window.matchMedia(query));
    queries.forEach((query) => query.addEventListener("change", apply));
    return () => {
      observer.disconnect();
      queries.forEach((query) => query.removeEventListener("change", apply));
    };
  }, [measure]);

  useEffect(() => {
    if (paused || pageCount < 2) return;
    const timer = window.setInterval(() => {
      scrollToPage((page + 1) % pageCount);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, page, pageCount, scrollToPage]);

  if (slides.length === 0) return null;

  const canPage = pageCount > 1;

  return (
    <div
      className="mt-10"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured universities"
      tabIndex={canPage ? 0 : undefined}
      onKeyDown={(event) => {
        if (!canPage) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollToPage((page + 1) % pageCount);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollToPage((page - 1 + pageCount) % pageCount);
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {canPage ? (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-primary-200 bg-white text-primary hover:border-primary"
            aria-label="Previous universities"
            onClick={() => scrollToPage((page - 1 + pageCount) % pageCount)}
          >
            ‹
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-primary-200 bg-white text-primary hover:border-primary"
            aria-label="Next universities"
            onClick={() => scrollToPage((page + 1) % pageCount)}
          >
            ›
          </button>
        </div>
      ) : null}
      <div
        ref={scroller}
        onScroll={() => {
          const node = scroller.current;
          if (!node) return;
          setPage(nearestPage(node.scrollLeft).closest);
        }}
        onScrollEnd={syncPage}
        className={`flex items-stretch gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${canPage ? "" : "overflow-x-hidden"}`}
      >
        {slides.map((slide, slideIndex) => (
          <div key={slideIndex} className="flex w-full shrink-0 md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)]">
            {slide}
          </div>
        ))}
      </div>
      {canPage ? (
        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="University pages">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === page}
              aria-label={`Show page ${index + 1} of ${pageCount}`}
              className={`h-2.5 rounded-full transition-all ${
                index === page ? "w-6 bg-primary" : "w-2.5 bg-primary-200"
              }`}
              onClick={() => scrollToPage(index)}
            />
          ))}
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        Page {page + 1} of {pageCount}
      </p>
    </div>
  );
}
