"use client";

import { cloneElement, isValidElement, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import WhatsAppContact from "@/components/public/WhatsAppContact";
import { evaluateScorecard } from "@/lib/scholarships/scorecard";
import type { CandidateInput, CountryOutlookInput, FundingRouteInput, ScorecardConfigInput } from "@/lib/scholarships/types";

const STEPS = ["Profile", "Academics", "Research", "Language", "Supervisor", "Documents", "Compliance", "Results"];

function blankCandidate(config: ScorecardConfigInput): CandidateInput {
  return {
    name: "",
    fileId: "",
    age: null,
    targetDegree: config.targetDegrees[0]?.label ?? "PhD",
    discipline: config.disciplines[0]?.label ?? "",
    field: "",
    preferredCountries: ["", "", ""],
    undergraduateMarks: null,
    undergraduateScale: config.gpaScales[0]?.label ?? "",
    mastersMarks: null,
    mastersScale: config.gpaScales[0]?.label ?? "",
    degreeStatus: "",
    relevance: "",
    institution: "",
    q1Papers: 0,
    otherPapers: 0,
    conferencePapers: 0,
    proposalRating: 3,
    experienceYears: 0,
    awards: 0,
    englishTest: config.englishTests[0]?.label ?? "IELTS",
    englishScore: null,
    standardisedTest: config.standardisedTests.at(-1)?.label ?? "None / Not taken",
    standardisedScore: null,
    supervisor: "",
    referees: "",
    sopRating: 3,
    documents: Object.fromEntries(config.documents.map((item) => [item.key, false])),
    visaRefusals: config.refusals[0]?.label ?? "None",
    gap: config.gaps[0]?.label ?? "0 years",
  };
}

export default function ScorecardCalculator({
  config,
  routes,
  countries,
}: {
  config: ScorecardConfigInput;
  routes: FundingRouteInput[];
  countries: CountryOutlookInput[];
}) {
  const [step, setStep] = useState(0);
  const [planLevel, setPlanLevel] = useState(2);
  const [input, setInput] = useState<CandidateInput>(() => blankCandidate(config));
  const [countryFilter, setCountryFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [fitFilter, setFitFilter] = useState("All");
  const panelRef = useRef<HTMLDivElement>(null);
  const skipFirstScroll = useRef(true);

  useEffect(() => {
    if (skipFirstScroll.current) {
      skipFirstScroll.current = false;
      return;
    }
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const result = useMemo(
    () => evaluateScorecard(input, config, routes, countries, planLevel),
    [input, config, routes, countries, planLevel]
  );

  function patch(partial: Partial<CandidateInput>) {
    setInput((current) => ({ ...current, ...partial }));
  }

  const filteredRoutes = result.routes.filter((route) => {
    if (countryFilter !== "All" && route.country !== countryFilter) return false;
    if (levelFilter !== "All" && String(route.stringency) !== levelFilter) return false;
    if (fitFilter !== "All" && route.rating !== fitFilter) return false;
    return true;
  });
  const routeCountries = Array.from(new Set(result.routes.map((route) => route.country))).sort();
  const fitOptions = Array.from(new Set(result.routes.map((route) => route.rating)));
  const englishKind = config.englishTests.find((item) => item.label === input.englishTest)?.kind;
  const missing = [
    input.age === null ? "age" : "",
    input.undergraduateMarks === null ? "undergraduate marks" : "",
    !input.degreeStatus ? "highest degree" : "",
    !input.relevance ? "field relevance" : "",
    !input.institution ? "institution standing" : "",
    englishKind !== "moi" && englishKind !== "none" && input.englishScore === null ? "English score" : "",
    !input.supervisor ? "supervisor status" : "",
    !input.referees ? "referees" : "",
  ].filter(Boolean);

  return (
    <div>
      <ol className="flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(index)}
              aria-current={index === step ? "step" : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-bold ${
                index === step ? "bg-primary text-white" : "bg-white text-primary-900 ring-1 ring-slate-200"
              }`}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      <div ref={panelRef} className="mt-5 scroll-mt-28 rounded-[20px] border border-slate-200 bg-white px-5 py-6 sm:px-8">
        <h2 className="font-display text-[22px] font-bold text-primary-900">{STEPS[step]}</h2>
        <p className="mb-5 mt-1 text-[14px] text-slate-600">Step {step + 1} of {STEPS.length}</p>
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name">
              <input className={control} value={input.name} onChange={(event) => patch({ name: event.target.value })} />
            </Field>
            <Field label="Age">
              <input className={control} type="number" min={16} max={70} value={input.age ?? ""} onChange={(event) => patch({ age: event.target.value === "" ? null : Number(event.target.value) })} />
            </Field>
            <SelectField label="Target degree" value={input.targetDegree} options={config.targetDegrees.map((item) => item.label)} onChange={(targetDegree) => patch({ targetDegree })} />
            <SelectField label="Discipline" value={input.discipline} options={config.disciplines.map((item) => item.label)} onChange={(discipline) => patch({ discipline })} />
            <Field label="Specific field">
              <input className={control} value={input.field} onChange={(event) => patch({ field: event.target.value })} />
            </Field>
            {[0, 1, 2].map((index) => (
              <SelectField
                key={index}
                label={`Preferred country ${index + 1}`}
                value={input.preferredCountries[index]}
                options={["", ...countries.map((country) => country.country)]}
                onChange={(value) => {
                  const preferredCountries = [...input.preferredCountries] as [string, string, string];
                  preferredCountries[index] = value;
                  patch({ preferredCountries });
                }}
              />
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Undergraduate CGPA or marks">
              <input className={control} type="number" step="0.01" value={input.undergraduateMarks ?? ""} onChange={(event) => patch({ undergraduateMarks: event.target.value === "" ? null : Number(event.target.value) })} />
            </Field>
            <SelectField label="Undergraduate scale" value={input.undergraduateScale} options={config.gpaScales.map((item) => item.label)} onChange={(undergraduateScale) => patch({ undergraduateScale })} />
            <Field label="Master's CGPA or marks (leave blank if none)">
              <input className={control} type="number" step="0.01" value={input.mastersMarks ?? ""} onChange={(event) => patch({ mastersMarks: event.target.value === "" ? null : Number(event.target.value) })} />
            </Field>
            <SelectField label="Master's scale" value={input.mastersScale} options={config.gpaScales.map((item) => item.label)} onChange={(mastersScale) => patch({ mastersScale })} />
            <SelectField label="Highest degree and status" value={input.degreeStatus} options={["", ...config.degreeStatuses.map((item) => item.label)]} placeholder="Select" onChange={(degreeStatus) => patch({ degreeStatus })} />
            <SelectField label="Relevance to the target field" value={input.relevance} options={["", ...config.relevance.map((item) => item.label)]} placeholder="Select" onChange={(relevance) => patch({ relevance })} />
            <SelectField label="Institution standing" value={input.institution} options={["", ...config.institutions.map((item) => item.label)]} placeholder="Select" onChange={(institution) => patch({ institution })} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Q1/Q2 journal papers" value={input.q1Papers} onChange={(q1Papers) => patch({ q1Papers })} />
            <NumberField label="Other indexed journal papers" value={input.otherPapers} onChange={(otherPapers) => patch({ otherPapers })} />
            <NumberField label="Indexed conference papers" value={input.conferencePapers} onChange={(conferencePapers) => patch({ conferencePapers })} />
            <RatingField label="Research proposal quality" value={input.proposalRating} scale={config.scoring.ratingScale} onChange={(proposalRating) => patch({ proposalRating })} />
            <NumberField label="Research or professional experience (years)" value={input.experienceYears} onChange={(experienceYears) => patch({ experienceYears })} />
            <NumberField label="Awards, patents, or grants" value={input.awards} onChange={(awards) => patch({ awards })} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="English test" value={input.englishTest} options={config.englishTests.map((item) => item.label)} onChange={(englishTest) => patch({ englishTest })} />
            <Field label="English score">
              <input className={control} type="number" step="0.5" value={input.englishScore ?? ""} onChange={(event) => patch({ englishScore: event.target.value === "" ? null : Number(event.target.value) })} />
            </Field>
            <SelectField label="Standardised test" value={input.standardisedTest} options={config.standardisedTests.map((item) => item.label)} onChange={(standardisedTest) => patch({ standardisedTest })} />
            <Field label="Standardised test score">
              <input className={control} type="number" value={input.standardisedScore ?? ""} onChange={(event) => patch({ standardisedScore: event.target.value === "" ? null : Number(event.target.value) })} />
            </Field>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4">
            <SelectField label="Supervisor or host status" value={input.supervisor} options={["", ...config.supervisors.map((item) => item.label)]} placeholder="Select" onChange={(supervisor) => patch({ supervisor })} />
            <SelectField label="Academic referees" value={input.referees} options={["", ...config.referees.map((item) => item.label)]} placeholder="Select" onChange={(referees) => patch({ referees })} />
            <RatingField label="SOP and CV quality" value={input.sopRating} scale={config.scoring.ratingScale} onChange={(sopRating) => patch({ sopRating })} />
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {config.documents.map((item) => (
              <label key={item.key} className="flex items-center gap-3 rounded-[12px] border border-slate-200 px-4 py-3 text-[15px] text-primary-900">
                <input
                  type="checkbox"
                  checked={Boolean(input.documents[item.key])}
                  onChange={(event) => patch({ documents: { ...input.documents, [item.key]: event.target.checked } })}
                />
                {item.label}
              </label>
            ))}
          </div>
        ) : null}

        {step === 6 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Previous visa refusals" value={input.visaRefusals} options={config.refusals.map((item) => item.label)} onChange={(visaRefusals) => patch({ visaRefusals })} />
            <SelectField label="Unexplained academic or professional gap" value={input.gap} options={config.gaps.map((item) => item.label)} onChange={(gap) => patch({ gap })} />
          </div>
        ) : null}

        {step === 7 ? (
          <Results
            result={result}
            planLevel={planLevel}
            onPlanLevel={setPlanLevel}
            countryFilter={countryFilter}
            levelFilter={levelFilter}
            fitFilter={fitFilter}
            routeCountries={routeCountries}
            fitOptions={fitOptions}
            filteredRoutes={filteredRoutes}
            onCountry={setCountryFilter}
            onLevel={setLevelFilter}
            onFit={setFitFilter}
            missing={missing}
          />
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {step > 0 ? (
            <button type="button" className="btn-outline !px-5 !py-2 !text-[15px]" onClick={() => setStep((current) => current - 1)}>Back</button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-primary !px-5 !py-2 !text-[15px]" onClick={() => setStep((current) => current + 1)}>
              {step === STEPS.length - 2 ? "See my scorecard" : "Continue"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Results({
  result,
  planLevel,
  onPlanLevel,
  countryFilter,
  levelFilter,
  fitFilter,
  routeCountries,
  fitOptions,
  filteredRoutes,
  onCountry,
  onLevel,
  onFit,
  missing,
}: {
  result: ReturnType<typeof evaluateScorecard>;
  planLevel: number;
  onPlanLevel: (level: number) => void;
  countryFilter: string;
  levelFilter: string;
  fitFilter: string;
  routeCountries: string[];
  fitOptions: string[];
  filteredRoutes: ReturnType<typeof evaluateScorecard>["routes"];
  onCountry: (value: string) => void;
  onLevel: (value: string) => void;
  onFit: (value: string) => void;
  missing: string[];
}) {
  const top = result.countries.slice(0, 5);
  return (
    <div className="space-y-8">
      {missing.length ? (
        <p className="rounded-[12px] bg-warning-tint px-4 py-3 text-[15px] leading-relaxed text-primary-900">
          This scorecard is still missing {missing.join(", ")}. The numbers below only count what you have entered.
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        {result.levels.map((level) => (
          <article key={level.level} className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-[13px] font-bold text-slate-600">{level.name}</p>
            <p className="mt-2 font-display text-[32px] font-bold text-primary-900">{level.score.toFixed(1)}</p>
            <p className="text-[14px] text-slate-600">out of 100 · {level.gatesPassed}/{level.gatesTotal} gates</p>
            <p className="mt-3 text-[15px] font-bold text-primary-900">{level.result}</p>
            <p className="mt-1 text-[14px] text-slate-600">Chance at this level: {(level.probability * 100).toFixed(1)}%</p>
            {level.failedGates !== "None" ? <p className="mt-2 text-[14px] text-slate-600">Failed: {level.failedGates}</p> : null}
          </article>
        ))}
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-display text-[20px] font-bold text-primary-900">Criteria</h3>
          <label className="text-[13px] font-bold text-slate-600">
            Plan for
            <select className={`${control} ml-2 !w-auto`} value={planLevel} onChange={(event) => onPlanLevel(Number(event.target.value))}>
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
              <option value={3}>Level 3</option>
            </select>
          </label>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-[14px]">
            <thead className="text-slate-600">
              <tr>
                <th className="py-2 pr-3">Criterion</th>
                <th className="py-2 pr-3">What you entered</th>
                <th className="py-2 pr-3">Score</th>
                <th className="py-2">Points at this plan level</th>
              </tr>
            </thead>
            <tbody>
              {result.criteria.map((row) => (
                <tr key={row.key} className="border-t border-slate-200">
                  <td className="py-2 pr-3 font-bold text-primary-900">{row.label}</td>
                  <td className="py-2 pr-3 text-slate-600">{row.captured}</td>
                  <td className="py-2 pr-3">{row.score.toFixed(0)}</td>
                  <td className="py-2">{row.points[(planLevel - 1) as 0 | 1 | 2].toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-display text-[20px] font-bold text-primary-900">Mandatory gates</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-[14px]">
            <thead className="text-slate-600">
              <tr>
                <th className="py-2 pr-3">Gate</th>
                <th className="py-2 pr-3">Your value</th>
                {result.levels.map((level) => <th key={level.level} className="py-2 pr-3">Level {level.level}</th>)}
              </tr>
            </thead>
            <tbody>
              {result.gates.map((gate) => (
                <tr key={gate.key} className="border-t border-slate-200">
                  <td className="py-2 pr-3 font-bold text-primary-900">{gate.label}</td>
                  <td className="py-2 pr-3">{formatGate(gate.value)}</td>
                  {gate.passed.map((passed, index) => (
                    <td key={index} className="py-2 pr-3">{passed ? "Pass" : `Fail (min ${formatGate(gate.minimums[index])})`}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-display text-[20px] font-bold text-primary-900">What to improve first</h3>
        <ol className="mt-3 space-y-3">
          {result.improvements.slice(0, 5).map((item) => (
            <li key={item.label} className="rounded-[12px] bg-slate-50 px-4 py-3">
              <p className="font-bold text-primary-900">{item.rank}. {item.label} <span className="font-normal text-slate-600">· score {item.score.toFixed(0)} · {item.pointsLost.toFixed(1)} points left on the table</span></p>
              <p className="mt-1 text-[15px] text-slate-600">{item.howToImprove}</p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="font-display text-[20px] font-bold text-primary-900">Funding routes</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <SelectField label="Country" value={countryFilter} options={["All", ...routeCountries]} onChange={onCountry} />
          <SelectField label="Stringency" value={levelFilter} options={["All", "1", "2", "3"]} onChange={onLevel} />
          <SelectField label="Fit" value={fitFilter} options={["All", ...fitOptions]} onChange={onFit} />
        </div>
        <div className="mt-4 space-y-3">
          {filteredRoutes.map((route) => (
            <article key={`${route.country}-${route.stringency}-${route.name}`} className="rounded-[14px] border border-slate-200 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-primary-900">{route.name}</p>
                  <p className="text-[14px] text-slate-600">{route.country} · {route.degreeLevel} · Level {route.stringency}</p>
                </div>
                <p className="text-[14px] font-bold text-primary">{route.rating}</p>
              </div>
              <p className="mt-2 text-[14px] text-slate-600">{route.coverage}</p>
              <p className="mt-1 text-[14px] text-primary-900">Gaps: {route.gaps}</p>
              {route.officialUrl ? <p className="mt-1 text-[13px] text-slate-600">Verify at {route.officialUrl}</p> : null}
            </article>
          ))}
          {filteredRoutes.length === 0 ? <p className="text-[15px] text-slate-600">No routes match these filters.</p> : null}
        </div>
      </div>

      <div>
        <h3 className="font-display text-[20px] font-bold text-primary-900">Country outlook</h3>
        <p className="mt-2 text-[15px] text-slate-600">
          Top 5: {top.map((country) => `${country.country} (${(country.probability * 100).toFixed(1)}%)`).join(", ")}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-[14px]">
            <thead className="text-slate-600">
              <tr>
                <th className="py-2 pr-3">Country</th>
                <th className="py-2 pr-3">Probability</th>
                <th className="py-2 pr-3">Rating</th>
                <th className="py-2">Preferred</th>
              </tr>
            </thead>
            <tbody>
              {result.countries.map((country) => (
                <tr key={country.country} className="border-t border-slate-200">
                  <td className="py-2 pr-3">
                    <p className="font-bold text-primary-900">{country.country}</p>
                    <p className="max-w-md text-[13px] text-slate-600">{country.summary}</p>
                  </td>
                  <td className="py-2 pr-3">{(country.probability * 100).toFixed(1)}%</td>
                  <td className="py-2 pr-3">{country.rating}</td>
                  <td className="py-2">{country.preferred ? "Preferred" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[14px] bg-primary-50 px-5 py-4 text-[15px] leading-relaxed text-primary-900">
        These scores are a decision aid, not an offer or a prediction. Weights and country mixes are planning assumptions, and each scholarship changes its rules every cycle. Confirm the route on its official site before you apply.{" "}
        <Link href="/#book" className="font-bold text-primary">Book a free consultation</Link>
        {" "}or{" "}
        <WhatsAppContact className="font-bold text-whatsapp">message on WhatsApp</WhatsAppContact>.
      </div>
    </div>
  );
}

function formatGate(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

const control = "h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[16px] text-primary-900 outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const control = isValidElement(children) ? cloneElement(children, { id } as { id: string }) : children;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-bold text-slate-600">{label}</label>
      {control}
    </div>
  );
}

function SelectField({ label, value, options, onChange, placeholder = "—" }: { label: string; value: string; options: string[]; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <select className={control} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option || "blank"} value={option}>{option || placeholder}</option>
        ))}
      </select>
    </Field>
  );
}

function RatingField({ label, value, scale, onChange }: { label: string; value: number; scale: number; onChange: (value: number) => void }) {
  const options = Array.from({ length: Math.max(1, Math.round(scale)) }, (_, index) => String(index + 1));
  return (
    <SelectField
      label={`${label} (1-${Math.round(scale)})`}
      value={String(value)}
      options={options}
      onChange={(next) => onChange(Number(next))}
    />
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <Field label={label}>
      <input
        className={control}
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(event.target.value === "" || !Number.isFinite(next) ? 0 : Math.max(0, next));
        }}
      />
    </Field>
  );
}
