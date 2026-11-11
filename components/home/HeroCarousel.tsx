"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import Asset from "@/components/home/Asset";
import SmartImage from "@/components/media/SmartImage";
import { currentHeroContent, type PublicHeroSlide } from "@/lib/home/hero-content";

const trustPoints = [
  "Free first consultation",
  "Scholarships explained",
  "Support from application to arrival",
];

const solidButton =
  "inline-flex min-h-[52px] items-center justify-center rounded-input bg-white px-6 py-3 text-center text-[16px] font-bold text-primary-900 transition-colors hover:bg-white/90 sm:min-w-[212px]";

const outlineButton = "btn-outline-dark min-h-[52px] px-6 py-3 text-center text-[16px] sm:min-w-[212px]";

export default function HeroCarousel({ slides }: { slides: PublicHeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = slides.length;
  const canSlide = count > 1;
  const active = count === 0 ? 0 : index % count;
  const headingIndex = slides.findIndex((slide) => slide.title.trim());

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setIndex((current) => (count === 0 ? 0 : current % count));
  }, [count]);

  useEffect(() => {
    if (!canSlide || paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [canSlide, paused, reduceMotion, count, index]);

  if (count === 0) return null;

  const show = (next: number) => setIndex((next + count) % count);

  return (
    <section
      className="relative overflow-hidden bg-primary-900"
      aria-roledescription={canSlide ? "carousel" : undefined}
      aria-label={canSlide ? "Highlights" : undefined}
      tabIndex={canSlide ? 0 : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (!canSlide) return;
        if ((event.target as HTMLElement).closest("a")) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          show(active + 1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          show(active - 1);
        }
      }}
    >
      <div className="grid">
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === active;
          return (
            <div
              key={slide.id}
              className={`col-start-1 row-start-1 min-h-[720px] sm:min-h-[680px] lg:h-[716px] lg:min-h-[716px] ${
                reduceMotion ? "" : "transition-opacity duration-700"
              } ${isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
              aria-hidden={!isActive}
              inert={!isActive}
              role={canSlide ? "group" : undefined}
              aria-roledescription={canSlide ? "slide" : undefined}
              aria-label={canSlide ? `${slideIndex + 1} of ${count}` : undefined}
            >
              <HeroSlideView slide={slide} priority={slideIndex === 0} heading={slideIndex === headingIndex} canSlide={canSlide} />
            </div>
          );
        })}
      </div>

      {canSlide ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20">
          <div className="pointer-events-auto mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-0">
            <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === active}
                  aria-label={`Show slide ${slideIndex + 1} of ${count}`}
                  className={`h-2.5 rounded-full shadow-sm ring-1 ring-primary-900/20 transition-all ${
                    slideIndex === active ? "w-6 bg-white" : "w-2.5 bg-white/70"
                  }`}
                  onClick={() => show(slideIndex)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-xl text-primary-900 shadow-sm transition-colors hover:bg-white"
                aria-label="Previous slide"
                onClick={() => show(active - 1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-xl text-primary-900 shadow-sm transition-colors hover:bg-white"
                aria-label="Next slide"
                onClick={() => show(active + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {canSlide ? `Slide ${active + 1} of ${count}` : ""}
      </p>
    </section>
  );
}

function HeroSlideView({
  slide,
  priority,
  heading,
  canSlide,
}: {
  slide: PublicHeroSlide;
  priority: boolean;
  heading: boolean;
  canSlide: boolean;
}) {
  const titleLines = slide.title
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const hasCopy = titleLines.length > 0 || Boolean(slide.description.trim()) || slide.buttons.length > 0 || slide.showTrustPoints;
  const imageClass =
    slide.backgroundImage === currentHeroContent.backgroundImage
      ? "object-cover object-bottom"
      : "object-cover object-center";

  return (
    <div className="relative h-full min-h-[inherit]">
      <SmartImage
        src={slide.backgroundImage}
        alt={slide.imageAlt.trim() || (hasCopy ? "" : "UniPass")}
        sizes="100vw"
        priority={priority}
        className={imageClass}
      />
      {hasCopy ? (
        <img
          src="/home/imgSharedHeroOverlay.svg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      ) : null}
      {hasCopy ? (
        <div
          className={`relative z-10 mx-auto flex max-w-[1200px] flex-col px-4 pt-36 sm:px-6 sm:pt-40 lg:px-0 lg:pt-[176px] ${
            canSlide ? "pb-24" : "pb-16"
          }`}
        >
          {titleLines.length > 0 ? (
            <Title lines={titleLines} asHeading={heading} />
          ) : null}
          {slide.description.trim() ? (
            <p className="mt-8 max-w-[490px] whitespace-pre-line text-[18px] leading-[28px] text-primary-100 sm:text-[20px] sm:leading-[30px]">
              {slide.description.trim()}
            </p>
          ) : null}
          {slide.buttons.length > 0 ? (
            <div className={`${titleLines.length || slide.description.trim() ? "mt-8" : "mt-0"} flex flex-col gap-4 sm:flex-row`}>
              {slide.buttons.map((button) => (
                <HeroLink
                  key={`${button.href}-${button.label}`}
                  href={button.href}
                  className={button.style === "outline" ? outlineButton : solidButton}
                >
                  {button.label}
                </HeroLink>
              ))}
            </div>
          ) : null}
          {slide.showTrustPoints ? (
            <ul className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
              {trustPoints.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[15px] text-primary-100">
                  <Asset src="/home/imgVector2.svg" width={12.2} height={9.7} />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Title({ lines, asHeading }: { lines: string[]; asHeading: boolean }) {
  const Tag = asHeading ? "h1" : "p";
  return (
    <Tag className="text-h1-hero">
      {lines.map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} className={line.length <= 32 ? "block lg:whitespace-nowrap" : "block"}>
          {line}
        </span>
      ))}
    </Tag>
  );
}

function HeroLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
