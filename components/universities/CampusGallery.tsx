"use client";

import { useState } from "react";

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

export default function CampusGallery({ name }: { name: string }) {
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
