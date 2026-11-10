"use client";

import { useState } from "react";
import { FIELDS_OF_STUDY } from "@/lib/utils/constants";
import { sanitizeKnownFor } from "@/lib/universities/known-for";

export default function StudyFieldFields({
  fields = [],
  knownFor = [],
}: {
  fields?: string[];
  knownFor?: string[];
}) {
  const options = Array.from(new Set([...FIELDS_OF_STUDY, ...fields.map((field) => field.trim()).filter(Boolean)]));
  const [selected, setSelected] = useState(() => fields.filter((field) => options.includes(field)));
  const [highlights, setHighlights] = useState(() => sanitizeKnownFor(fields, knownFor));

  const toggleField = (field: string) => {
    setSelected((current) =>
      current.includes(field) ? current.filter((item) => item !== field) : [...current, field],
    );
    setHighlights((current) => current.filter((item) => item !== field));
  };

  const toggleHighlight = (field: string) => {
    setHighlights((current) => {
      if (current.includes(field)) return current.filter((item) => item !== field);
      if (current.length >= 3) return current;
      return [...current, field];
    });
  };

  return (
    <>
      {highlights.map((field) => (
        <input key={field} type="hidden" name="knownFor" value={field} />
      ))}

      <div>
        <label className="block text-sm font-bold mb-2">Fields of Study *</label>
        <div className="grid grid-cols-2 gap-2">
          {options.map((field) => (
            <label key={field} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="fields"
                value={field}
                checked={selected.includes(field)}
                onChange={() => toggleField(field)}
              />
              <span className="text-sm">{field}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Best known for</label>
        <p className="mb-2 text-sm text-slate-600">
          Shown on preview cards so students see the fields worth highlighting. Choose up to 3, in the order they should appear.
        </p>
        {selected.length === 0 ? (
          <p className="text-sm text-slate-600">Select fields of study first.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {options.filter((field) => selected.includes(field)).map((field) => {
              const checked = highlights.includes(field);
              const disabled = !checked && highlights.length >= 3;
              return (
                <label key={field} className={`flex items-center gap-2 ${disabled ? "opacity-50" : ""}`}>
                  <input
                    type="checkbox"
                    value={field}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleHighlight(field)}
                  />
                  <span className="text-sm">{field}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
