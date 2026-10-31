"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Asset from "@/components/home/Asset";
import { CITIES_IN_PAKISTAN, STUDY_LEVELS } from "@/lib/utils/constants";

interface ConsultationFormProps {
  context?: {
    university?: string;
    program?: string;
  };
}

type Option = { value: string; label: string };

const TIME_OPTIONS = ["Morning", "Afternoon", "Evening"];
const PHONE_PATTERN = /^\+92\s?\d{3}\s?\d{7}$/;

const cityOptions: Option[] = CITIES_IN_PAKISTAN.map((city) => ({
  value: city,
  label: city,
}));
const levelOptions: Option[] = STUDY_LEVELS.map((level) => ({
  value: level,
  label: level,
}));

export default function ConsultationForm({ context }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    whatsappNumber: "",
    city: "Karachi",
    levelOfStudy: "Bachelor's",
    bestTimeToReach: "Evening",
    website: "",
  });
  const [cities, setCities] = useState<Option[]>(cityOptions);
  const [levels, setLevels] = useState<Option[]>(levelOptions);
  const [times, setTimes] = useState<Option[]>(
    TIME_OPTIONS.map((time) => ({ value: time, label: time })),
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/taxonomies?type=pakistani_city").then((r) => r.json()),
      fetch("/api/taxonomies?type=study_level").then((r) => r.json()),
      fetch("/api/taxonomies?type=best_time").then((r) => r.json()),
    ])
      .then(([cityRes, levelRes, timeRes]) => {
        const active = (payload: { taxonomies?: Option[] }, fallback: Option[]) => {
          const rows = payload.taxonomies?.filter((item) => (item as Option & { active?: boolean }).active !== false);
          return rows && rows.length > 0 ? rows : fallback;
        };
        setCities(active(cityRes, cityOptions));
        setLevels(active(levelRes, levelOptions));
        setTimes(
          active(
            timeRes,
            TIME_OPTIONS.map((time) => ({ value: time, label: time })),
          ),
        );
      })
      .catch(() => {
        setCities(cityOptions);
        setLevels(levelOptions);
        setTimes(TIME_OPTIONS.map((time) => ({ value: time, label: time })));
      });
  }, []);

  const validate = () => {
    const next: Record<string, string> = {};
    if (formData.fullName.trim().length < 2) {
      next.fullName = "Full name must be at least 2 characters.";
    }
    if (!PHONE_PATTERN.test(formData.whatsappNumber.trim())) {
      next.whatsappNumber = "Enter a Pakistani number like +92 300 1234567.";
    }
    if (!formData.city) next.city = "Please select a city.";
    if (!formData.levelOfStudy) next.levelOfStudy = "Please select a level of study.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    if (!validate()) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          whatsappNumber: formData.whatsappNumber.trim(),
          city: formData.city,
          levelOfStudy: formData.levelOfStudy,
          bestTimeToReach: formData.bestTimeToReach,
          _honeypot: formData.website,
          source: context ? "contextual-cta" : "consultation-form",
          sourcePage: window.location.pathname,
          referrer: document.referrer,
          ...context,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form. Please try again.");
      }
      setStatus("success");
      setFormData({
        fullName: "",
        whatsappNumber: "",
        city: "Karachi",
        levelOfStudy: "Bachelor's",
        bestTimeToReach: "Evening",
        website: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-form-card bg-white px-8 py-10 text-center shadow-form-card sm:px-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-tint">
          <svg className="h-8 w-8 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-h3 mb-3">Thank you!</h3>
        <p className="mb-6 text-[16px] leading-6 text-slate-600">
          We&apos;ve received your consultation request. Our team will reach out on WhatsApp
          within 24 hours.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn-outline h-11 px-6 text-[15px]">
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative rounded-form-card bg-white px-6 py-8 shadow-form-card sm:px-9 sm:py-8"
    >
      <h3 className="mb-7 font-display text-[26px] leading-none text-primary-900">
        Book your free consultation
      </h3>

      <div className="space-y-6">
        <Field label="Full name" htmlFor="fullName" error={fieldErrors.fullName}>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
            placeholder="Your full name"
            className="input-field h-[46px]"
            disabled={status === "submitting"}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.fullName)}
          />
        </Field>

        <Field label="WhatsApp number" htmlFor="whatsappNumber" error={fieldErrors.whatsappNumber}>
          <input
            type="tel"
            id="whatsappNumber"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={(event) =>
              setFormData({ ...formData, whatsappNumber: event.target.value })
            }
            placeholder="+92 300 1234567"
            className="input-field h-[46px]"
            disabled={status === "submitting"}
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.whatsappNumber)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
          <Field label="City in Pakistan" htmlFor="city" error={fieldErrors.city}>
            <Select
              id="city"
              name="city"
              value={formData.city}
              disabled={status === "submitting"}
              onChange={(value) => setFormData({ ...formData, city: value })}
              options={cities}
            />
          </Field>
          <Field label="Level of study" htmlFor="levelOfStudy" error={fieldErrors.levelOfStudy}>
            <Select
              id="levelOfStudy"
              name="levelOfStudy"
              value={formData.levelOfStudy}
              disabled={status === "submitting"}
              onChange={(value) => setFormData({ ...formData, levelOfStudy: value })}
              options={levels}
            />
          </Field>
        </div>

        <Field label="Best time to reach you" htmlFor="bestTimeToReach">
          <Select
            id="bestTimeToReach"
            name="bestTimeToReach"
            value={formData.bestTimeToReach}
            disabled={status === "submitting"}
            onChange={(value) => setFormData({ ...formData, bestTimeToReach: value })}
            options={times}
          />
        </Field>

        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(event) => setFormData({ ...formData, website: event.target.value })}
          />
        </div>

        {errorMessage && (
          <p className="rounded-input border border-error/30 bg-error-tint px-4 py-3 text-sm text-error" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-cta h-[52px] w-full text-[16px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting..." : "Book free consultation"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-bold text-slate-600">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-[13px] text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  id,
  name,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  options: Option[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="input-field h-[46px] appearance-none pr-10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" aria-hidden>
        <Asset src="/home/imgVector89.svg" width={12} height={7} />
      </span>
    </div>
  );
}
