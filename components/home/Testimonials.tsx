"use client";

import { useState } from "react";
import Asset from "@/components/home/Asset";
import type { HomeTestimonial } from "@/lib/home/content";

export default function Testimonials({
  testimonials,
  total,
}: {
  testimonials: HomeTestimonial[];
  total: number;
}) {
  const [visible, setVisible] = useState(3);
  const shown = testimonials.slice(0, visible);
  const remaining = Math.max(testimonials.length - visible, 0);
  const fraction = total > 0 ? Math.min(shown.length / total, 1) : 1;
  const fills = Math.max(1, Math.round(fraction * 3));

  return (
    <section className="bg-page-bg py-16 lg:pb-[88px] lg:pt-[72px]">
      <div className="container-1200">
        <h2 className="text-h2 max-w-[720px]">Students who made the move</h2>
        <p className="mt-4 max-w-[640px] text-[18px] leading-[28px] text-body">
          Sample stories for layout. Replace with real quotes from students who have
          agreed to share them.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((story, index) => (
            <article
              key={`${story.university}-${index}`}
              className="flex min-h-[300px] flex-col rounded-card border-[1.2px] border-border bg-white px-6 pb-6 pt-2"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-display text-[84px] leading-[0.8] text-teal" aria-hidden>
                  “
                </span>
                {story.sample && <span className="chip-warning mt-4">Sample text</span>}
              </div>
              <p className="mt-3 text-[17px] leading-[26px] text-ink">{story.quote}</p>
              <div className="mt-auto border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center">
                    <Asset
                      src="/home/imgVector50.svg"
                      width={48}
                      height={48}
                      className="absolute inset-0"
                    />
                    <span className="relative text-[15px] font-bold text-navy">{story.initials}</span>
                  </span>
                  <span>
                    <span className="block text-[16px] font-bold leading-5 text-ink">{story.name}</span>
                    <span className="mt-0.5 block text-[14px] leading-5 text-body">
                      From {story.origin}, now at {story.university}
                    </span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[15px] text-body">
          Showing {Math.min(shown.length, total)} of {total} student stories
        </p>
        <div className="relative mx-auto mt-3 h-1 w-[240px]">
          <Asset src="/home/imgVector52.svg" width={240} height={4} className="absolute left-0 top-0" />
          <span className="absolute left-0 top-0 flex">
            {Array.from({ length: fills }).map((_, index) => (
              <Asset key={index} src="/home/imgVector53.svg" width={80} height={4} />
            ))}
          </span>
        </div>

        {remaining > 0 && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible(testimonials.length)}
              className="inline-flex h-[52px] min-w-[280px] items-center justify-center gap-2 rounded-input border-[1.5px] border-navy px-6 text-[16px] font-bold text-navy transition-colors hover:bg-navy/5"
            >
              <span className="relative block h-[14px] w-[14px]" aria-hidden>
                <Asset
                  src="/home/imgVector55.svg"
                  width={14.2}
                  height={2.2}
                  className="absolute left-0 top-[6px]"
                />
                <Asset
                  src="/home/imgVector56.svg"
                  width={2.2}
                  height={14.2}
                  className="absolute left-[6px] top-0"
                />
              </span>
              Show {remaining} more {remaining === 1 ? "story" : "stories"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
