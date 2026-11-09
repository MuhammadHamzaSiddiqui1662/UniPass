"use client";

import { useState } from "react";
import SmartImage from "@/components/media/SmartImage";

export type CampusShot = {
  src: string;
  alt: string;
};

const SHOTS = [
  {
    id: "main",
    art: "/university-detail/imgGroup1.svg",
    artWidth: 1030,
    artHeight: 481,
    overlay: "/university-detail/imgSharedHeroOverlay.svg",
    overlayWidth: 800,
    overlayHeight: 480,
  },
  {
    id: "campus-2",
    art: "/university-detail/imgGroup3.svg",
    artWidth: 498,
    artHeight: 232,
    overlay: "/university-detail/imgSharedHeroOverlay1.svg",
    overlayWidth: 184,
    overlayHeight: 232,
  },
  {
    id: "campus-3",
    art: "/university-detail/imgGroup4.svg",
    artWidth: 498,
    artHeight: 232,
    overlay: "/university-detail/imgSharedHeroOverlay1.svg",
    overlayWidth: 184,
    overlayHeight: 232,
  },
  {
    id: "campus-4",
    art: "/university-detail/imgGroup5.svg",
    artWidth: 498,
    artHeight: 232,
    overlay: "/university-detail/imgSharedHeroOverlay1.svg",
    overlayWidth: 184,
    overlayHeight: 232,
  },
  {
    id: "campus-5",
    art: "/university-detail/imgGroup6.svg",
    artWidth: 498,
    artHeight: 232,
    overlay: "/university-detail/imgSharedHeroOverlay1.svg",
    overlayWidth: 184,
    overlayHeight: 232,
  },
] as const;

export default function CampusGallery({ name, images = [] }: { name: string; images?: CampusShot[] }) {
  if (images.length > 0) return <PhotoGallery name={name} images={images} />;
  return <PlaceholderGallery name={name} />;
}

function PhotoGallery({ name, images }: { name: string; images: CampusShot[] }) {
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];
  const thumbs = images
    .map((shot, index) => ({ shot, index }))
    .filter((item) => item.index !== active);

  return (
    <div className={images.length > 1 ? "grid grid-cols-2 gap-4 lg:grid-cols-[minmax(0,800px)_184px_184px] lg:grid-rows-2" : ""}>
      <div className="relative col-span-2 h-[240px] overflow-hidden rounded-card bg-primary-900 sm:h-[360px] lg:col-span-1 lg:row-span-2 lg:h-[480px]">
        <SmartImage src={current.src} alt={current.alt || `${name} campus`} sizes="(min-width: 1024px) 800px, 100vw" priority className="object-cover" />
      </div>
      {thumbs.map(({ shot, index }) => (
        <button
          key={`${shot.src}-${index}`}
          type="button"
          onClick={() => setActive(index)}
          className="relative h-[120px] overflow-hidden rounded-[12px] bg-primary-900 sm:h-[160px] lg:h-[232px]"
          aria-label={`Show campus photo ${index + 1}`}
        >
          <SmartImage src={shot.src} alt="" sizes="184px" className="object-cover" />
        </button>
      ))}
    </div>
  );
}

function PlaceholderGallery({ name }: { name: string }) {
  const [active, setActive] = useState(0);
  const current = SHOTS[active];
  const thumbs = SHOTS.filter((_, index) => index !== active);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-[minmax(0,800px)_184px_184px] lg:grid-rows-2">
      <div className="relative col-span-2 h-[240px] overflow-hidden rounded-card bg-primary-900 sm:h-[360px] lg:col-span-1 lg:row-span-2 lg:h-[480px]">
        <img
          src={current.art}
          alt={`${name} campus`}
          width={current.artWidth}
          height={current.artHeight}
          className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2"
        />
        <img
          src={current.overlay}
          alt=""
          width={current.overlayWidth}
          height={current.overlayHeight}
          className="absolute inset-0 h-full w-full max-w-none object-cover"
        />
      </div>
      {thumbs.map((shot) => {
        const index = SHOTS.findIndex((item) => item.id === shot.id);
        return (
          <button
            key={shot.id}
            type="button"
            onClick={() => setActive(index)}
            className="relative h-[120px] overflow-hidden rounded-[12px] bg-primary-900 sm:h-[160px] lg:h-[232px]"
            aria-label={`Show campus photo ${index + 1}`}
          >
            <img
              src={shot.art}
              alt=""
              width={shot.artWidth}
              height={shot.artHeight}
              className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2"
            />
            <img
              src={shot.overlay}
              alt=""
              width={shot.overlayWidth}
              height={shot.overlayHeight}
              className="absolute inset-0 h-full w-full max-w-none object-cover"
            />
          </button>
        );
      })}
    </div>
  );
}
