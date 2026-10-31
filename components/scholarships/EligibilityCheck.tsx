"use client";

import { useState } from "react";
import Link from "next/link";
import { whatsappHref } from "@/lib/site/contact";

export type BursCriteria = {
  level: string;
  ageLimit: number;
  minMarks: number;
};

const AGES = Array.from({ length: 25 }, (_, index) => String(16 + index));
const MARKS = ["50", "55", "60", "65", "70", "75", "80", "82", "85", "90", "95", "100"];

export default function EligibilityCheck({ criteria }: { criteria: BursCriteria[] }) {
  const [level, setLevel] = useState(criteria[0]?.level ?? "Bachelor's");
  const [age, setAge] = useState("19");
  const [marks, setMarks] = useState("82");
  const [touched, setTouched] = useState(false);
  const rule = criteria.find((item) => item.level === level) ?? criteria[0];
  const ageNum = Number(age);
  const marksNum = Number(marks);
  const inside = Boolean(rule && ageNum <= rule.ageLimit && marksNum >= rule.minMarks);

  function update(next: () => void) {
    next();
    setTouched(true);
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-body">Level</span>
          <select
            value={level}
            onChange={(event) => update(() => setLevel(event.target.value))}
            className="h-11 w-full rounded-[10px] border border-border bg-white px-3 text-[16px] text-ink outline-none"
          >
            {criteria.map((item) => (
              <option key={item.level} value={item.level}>
                {item.level}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-body">Your age</span>
          <select
            value={age}
            onChange={(event) => update(() => setAge(event.target.value))}
            className="h-11 w-full rounded-[10px] border border-border bg-white px-3 text-[16px] text-body outline-none"
          >
            {AGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-body">Marks (%)</span>
          <select
            value={marks}
            onChange={(event) => update(() => setMarks(event.target.value))}
            className="h-11 w-full rounded-[10px] border border-border bg-white px-3 text-[16px] text-body outline-none"
          >
            {MARKS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 rounded-[12px] bg-[#F3F5FA] px-4 py-4 text-[15px] leading-relaxed text-body">
        {touched && rule ? (
          inside ? (
            <p>
              At {age} with {marks}% you are inside the published guide for {level}: {rule.ageLimit} or under, and at least {rule.minMarks}%. Türkiye Bursları still reviews each application.{" "}
              <Link href="/#book" className="font-bold text-navy">
                Book a free consultation
              </Link>{" "}
              if you want help with the window.
            </p>
          ) : (
            <p>
              At {age} with {marks}% you are outside the published guide for {level} ({rule.ageLimit} or under, {rule.minMarks}% or above). Many private universities still reduce tuition for strong marks.{" "}
              <Link href="/#book" className="font-bold text-navy">
                Book a free consultation
              </Link>{" "}
              or{" "}
              <a href={whatsappHref()} className="font-bold text-whatsapp-green" target="_blank" rel="noreferrer">
                message on WhatsApp
              </a>
              .
            </p>
          )
        ) : (
          <p>Enter your age and marks to see where you stand.</p>
        )}
      </div>
    </div>
  );
}
