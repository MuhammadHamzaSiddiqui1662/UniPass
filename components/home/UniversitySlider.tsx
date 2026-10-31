"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export default function UniversitySlider({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const syncIndex = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    const slide = node.firstElementChild as HTMLElement | null;
    const width = slide?.offsetWidth || 1;
    setIndex(Math.round(node.scrollLeft / width));
  }, []);

  const goTo = useCallback((next: number) => {
    const node = scroller.current;
    if (!node || slides.length === 0) return;
    const count = slides.length;
    const wrapped = (next + count) % count;
    const slide = node.children[wrapped] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setIndex(wrapped);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => goTo(index + 1), 6500);
    return () => window.clearInterval(timer);
  }, [paused, index, slides.length, goTo]);

  if (slides.length === 0) return null;

  return (
    <div
      className="mt-10"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured universities"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goTo(index + 1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goTo(index - 1);
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-primary-200 bg-white text-primary hover:border-primary"
          aria-label="Previous university"
          onClick={() => goTo(index - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-primary-200 bg-white text-primary hover:border-primary"
          aria-label="Next university"
          onClick={() => goTo(index + 1)}
        >
          ›
        </button>
      </div>
      <div
        ref={scroller}
        onScroll={syncIndex}
        className="mt-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className="w-full shrink-0 snap-start md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)]"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${slides.length}`}
          >
            {slide}
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="University slides">
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            type="button"
            role="tab"
            aria-selected={slideIndex === index}
            aria-label={`Show university ${slideIndex + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              slideIndex === index ? "w-6 bg-primary" : "w-2.5 bg-primary-200"
            }`}
            onClick={() => goTo(slideIndex)}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        University {index + 1} of {slides.length}
      </p>
    </div>
  );
}
