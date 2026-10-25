"use client";

import { useState, FormEvent, useEffect } from "react";
import { CITIES_IN_PAKISTAN, STUDY_LEVELS, BEST_TIME_OPTIONS } from "@/lib/utils/constants";

interface ConsultationFormProps {
  context?: {
    university?: string;
    program?: string;
  };
}

export default function ConsultationForm({
  context,
}: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    whatsappNumber: "+92 ",
    city: "",
    levelOfStudy: "",
    bestTimeToReach: "",
  });

  // Taxonomy state
  const [pakistaniCities, setPakistaniCities] = useState<any[]>([]);
  const [studyLevels, setStudyLevels] = useState<any[]>([]);
  const [bestTimes, setBestTimes] = useState<any[]>([]);

  useEffect(() => {
    // Fetch taxonomies
    Promise.all([
      fetch("/api/taxonomies?type=pakistani_city").then(r => r.json()),
      fetch("/api/taxonomies?type=study_level").then(r => r.json()),
      fetch("/api/taxonomies?type=best_time").then(r => r.json()),
    ]).then(([cities, levels, times]) => {
      setPakistaniCities(cities.taxonomies?.filter((t: any) => t.active) || CITIES_IN_PAKISTAN.map(c => ({ value: c, label: c })));
      setStudyLevels(levels.taxonomies?.filter((t: any) => t.active) || STUDY_LEVELS.map(l => ({ value: l, label: l })));
      setBestTimes(times.taxonomies?.filter((t: any) => t.active) || BEST_TIME_OPTIONS.map(t => ({ value: t, label: t })));
    }).catch(() => {
      // Fallback to constants
      setPakistaniCities(CITIES_IN_PAKISTAN.map(c => ({ value: c, label: c })));
      setStudyLevels(STUDY_LEVELS.map(l => ({ value: l, label: l })));
      setBestTimes(BEST_TIME_OPTIONS.map(t => ({ value: t, label: t })));
    });
  }, []);

  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: context ? "contextual-cta" : "consultation-form",
          sourcePage: typeof window !== "undefined" ? window.location.pathname : "/",
          referrer: typeof window !== "undefined" ? document.referrer : "",
          ...context,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      setStatus("success");
      setFormData({
        fullName: "",
        whatsappNumber: "+92 ",
        city: "",
        levelOfStudy: "",
        bestTimeToReach: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-form-card p-8 lg:p-12 shadow-form-card text-center">
        <div className="w-16 h-16 bg-success-tint rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-success-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-h3 text-ink mb-3">Thank you!</h3>
        <p className="text-body mb-6">
          We've received your consultation request. Our team will reach out to
          you on WhatsApp within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="btn-outline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-form-card p-8 lg:p-12 shadow-form-card"
    >
      <h3 className="text-h3 text-ink mb-8">Book your free consultation</h3>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="fullName"
            className="block text-[13px] font-bold text-body mb-2"
          >
            Full name
          </label>
          <input
            type="text"
            id="fullName"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="Your full name"
            className="input-field"
            disabled={status === "submitting"}
          />
        </div>

        <div>
          <label
            htmlFor="whatsappNumber"
            className="block text-[13px] font-bold text-body mb-2"
          >
            WhatsApp number
          </label>
          <input
            type="tel"
            id="whatsappNumber"
            required
            value={formData.whatsappNumber}
            onChange={(e) =>
              setFormData({ ...formData, whatsappNumber: e.target.value })
            }
            placeholder="+92 300 1234567"
            className="input-field"
            disabled={status === "submitting"}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-[13px] font-bold text-body mb-2"
            >
              City in Pakistan
            </label>
            <select
              id="city"
              required
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="input-field"
              disabled={status === "submitting"}
            >
              <option value="">Select city</option>
              {pakistaniCities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="levelOfStudy"
              className="block text-[13px] font-bold text-body mb-2"
            >
              Level of study
            </label>
            <select
              id="levelOfStudy"
              required
              value={formData.levelOfStudy}
              onChange={(e) =>
                setFormData({ ...formData, levelOfStudy: e.target.value })
              }
              className="input-field"
              disabled={status === "submitting"}
            >
              <option value="">Select level</option>
              {studyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="bestTimeToReach"
            className="block text-[13px] font-bold text-body mb-2"
          >
            Best time to reach you
          </label>
          <select
            id="bestTimeToReach"
            value={formData.bestTimeToReach}
            onChange={(e) =>
              setFormData({ ...formData, bestTimeToReach: e.target.value })
            }
            className="input-field"
            disabled={status === "submitting"}
          >
            <option value="">Select time</option>
            {bestTimes.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-input text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full btn-cta h-[52px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "submitting"
            ? "Submitting..."
            : "Book free consultation"}
        </button>
      </div>
    </form>
  );
}
