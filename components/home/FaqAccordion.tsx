"use client";

import { useState } from "react";
import Asset from "@/components/home/Asset";
import type { HomeFaq } from "@/lib/home/content";

export default function FaqAccordion({ faqs }: { faqs: HomeFaq[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div key={faq.question}>
            <div className="overflow-hidden">
              <Asset src="/home/imgVector93.svg" width={800} height={1.5} />
            </div>
            <h3>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-6 py-5 text-left"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                <span className="font-display text-[18px] leading-snug text-ink sm:text-[20px]">
                  {faq.question}
                </span>
                <span className="relative mt-1.5 block h-[14px] w-[14px] shrink-0" aria-hidden>
                  <Asset
                    src="/home/imgVector94.svg"
                    width={14.2}
                    height={2.2}
                    className="absolute left-0 top-[6px]"
                  />
                  {!open && (
                    <Asset
                      src="/home/imgVector95.svg"
                      width={2.2}
                      height={14.2}
                      className="absolute left-[6px] top-0"
                    />
                  )}
                </span>
              </button>
            </h3>
            {open && (
              <p className="max-w-[760px] pb-5 text-[16px] leading-[26px] text-body">{faq.answer}</p>
            )}
          </div>
        );
      })}
      <div className="overflow-hidden">
        <Asset src="/home/imgVector93.svg" width={800} height={1.5} />
      </div>
    </div>
  );
}
