import { describe, expect, test } from "vitest";
import { defaultCountryOutlooks, defaultFundingRoutes, defaultScorecardConfig } from "../lib/scholarships/defaults";
import { countrySharesBalance, evaluateScorecard } from "../lib/scholarships/scorecard";
import type { CandidateInput } from "../lib/scholarships/types";
import { countryOutlookSchema, fundingRouteSchema, parseScorecardConfig } from "../lib/validations/scorecard";

const sample: CandidateInput = {
  name: "SAMPLE – A. Khan",
  fileId: "CAND-001",
  age: 27,
  targetDegree: "PhD",
  discipline: "Engineering & Computer Science",
  field: "Machine learning for medical imaging",
  preferredCountries: ["Germany", "Netherlands", "UK"],
  undergraduateMarks: 3.2,
  undergraduateScale: "GPA out of 4",
  mastersMarks: 3.5,
  mastersScale: "GPA out of 4",
  degreeStatus: "MS/MPhil completed (18 years)",
  relevance: "Closely related field",
  institution: "HEC W-category or QS/THE Top 1000",
  q1Papers: 1,
  otherPapers: 2,
  conferencePapers: 2,
  proposalRating: 4,
  experienceYears: 2,
  awards: 1,
  englishTest: "IELTS",
  englishScore: 7,
  standardisedTest: "GRE General",
  standardisedScore: 318,
  supervisor: "Positive reply – willing to supervise (funding pending)",
  referees: "3 referees committed – letters pending",
  sopRating: 4,
  documents: {
    passport: true,
    attestation: true,
    cv: true,
    sop: true,
    proposal: true,
    references: false,
    englishProof: true,
    identity: false,
  },
  visaRefusals: "None",
  gap: "0 years",
};

function evaluate(input: CandidateInput = sample, planLevel = 2) {
  return evaluateScorecard(input, defaultScorecardConfig, defaultFundingRoutes, defaultCountryOutlooks, planLevel);
}

describe("scholarship scorecard", () => {
  test("matches the workbook sample candidate", () => {
    const result = evaluate();
    expect(result.levels.map((level) => Number(level.score.toFixed(2)))).toEqual([71.91, 70.57, 69.18]);
    expect(result.levels.map((level) => level.gatesPassed)).toEqual([6, 6, 5]);
    expect(result.levels.map((level) => level.result)).toEqual([
      "Competitive",
      "Competitive",
      "Gate Not Met – Fix First",
    ]);
    expect(result.levels[2].failedGates).toContain("Document readiness");
    expect(result.levels.map((level) => level.probability)).toEqual([
      expect.closeTo(0.792837185, 6),
      expect.closeTo(0.441983306, 6),
      expect.closeTo(0.03121174, 6),
    ]);

    const csc = result.routes.find((route) => route.name.startsWith("Chinese Government Scholarship"));
    const knight = result.routes.find((route) => route.name.startsWith("Knight-Hennessy"));
    expect(csc).toMatchObject({ rating: "Competitive", gaps: "None", hardMet: true });
    expect(knight).toMatchObject({
      rating: "Hard requirement gap",
      gaps: "CGPA short by 0.20; ",
      hardMet: false,
    });

    const hungary = result.countries.find((country) => country.country === "Hungary");
    const china = result.countries.find((country) => country.country === "China");
    const germany = result.countries.find((country) => country.country === "Germany");
    const japan = result.countries.find((country) => country.country === "Japan");
    expect(hungary).toMatchObject({ rank: 1, rating: "High", preferred: false });
    expect(hungary?.probability).toBeCloseTo(0.714449724, 6);
    expect(china).toMatchObject({ rank: 2, rating: "High" });
    expect(china?.probability).toBeCloseTo(0.653263361, 6);
    expect(germany).toMatchObject({ rating: "Moderate", preferred: true, rank: japan?.rank });
    expect(germany?.probability).toBeCloseTo(0.352810922, 6);
    expect(result.improvements.slice(0, 3).map((item) => item.label)).toEqual([
      "Research publications (discipline-adjusted)",
      "Supervisor / host engagement",
      "Awards, patents & grants",
    ]);
  });

  test("uses the undergraduate CGPA when a master's score is blank", () => {
    const result = evaluate({ ...sample, mastersMarks: null, mastersScale: "" });
    expect(result.workings.mastersCgpa).toBeNull();
    expect(result.workings.bestCgpa).toBeCloseTo(3.2, 5);
    expect(result.criteria[0].score).toBeCloseTo(result.criteria[1].score, 5);
    expect(result.criteria[0].captured).toBe("(none – UG score used)");
  });

  test("halves the publication gate for an MPhil target and leaves the publication score unchanged", () => {
    const papers = { ...sample, q1Papers: 0, otherPapers: 2, conferencePapers: 1 };
    const phd = evaluate(papers);
    const mphil = evaluate({ ...papers, targetDegree: "MPhil" });
    expect(phd.workings.publicationPoints).toBeCloseTo(mphil.workings.publicationPoints, 5);
    expect(phd.criteria[4].score).toBeCloseTo(mphil.criteria[4].score, 5);
    expect(phd.workings.relief).toBe(1);
    expect(mphil.workings.relief).toBe(0.5);
    const publicationGate = (result: ReturnType<typeof evaluate>) => result.gates.find((gate) => gate.key === "publications");
    expect(publicationGate(phd)?.passed[2]).toBe(false);
    expect(publicationGate(mphil)?.passed[2]).toBe(true);
  });

  test("does not let a missing age pass an age-capped route", () => {
    const result = evaluate({ ...sample, age: null });
    const csc = result.routes.find((route) => route.name.startsWith("Chinese Government Scholarship"));
    const openAge = result.routes.find((route) => route.name.startsWith("Stipendium Hungaricum"));
    expect(csc?.gaps).toContain("Age not provided");
    expect(csc?.hardMet).toBe(false);
    expect(openAge?.gaps).toBe("None");
  });

  test("converts a percentage and a TOEFL score the way the workbook tables do", () => {
    const result = evaluate({
      ...sample,
      undergraduateMarks: 72,
      undergraduateScale: "Percentage (%)",
      mastersMarks: null,
      mastersScale: "",
      englishTest: "TOEFL iBT",
      englishScore: 94,
    });
    expect(result.workings.undergraduateCgpa).toBeCloseTo(3.3, 5);
    expect(result.workings.bestCgpa).toBeCloseTo(3.3, 5);
    expect(result.workings.ielts).toBeCloseTo(7, 5);
  });

  test("ignores negative publication counts", () => {
    const result = evaluate({ ...sample, q1Papers: -3, otherPapers: 0, conferencePapers: 0 });
    expect(result.workings.publicationPoints).toBe(0);
  });

  test("accepts the seeded rules, routes, and country mixes", () => {
    expect(parseScorecardConfig(defaultScorecardConfig).ok).toBe(true);
    for (const route of defaultFundingRoutes) {
      expect(fundingRouteSchema.safeParse(route).success).toBe(true);
    }
    for (const country of defaultCountryOutlooks) {
      expect(countrySharesBalance(country)).toBe(true);
      expect(countryOutlookSchema.safeParse(country).success).toBe(true);
    }
  });

  test("rejects criterion weights that do not total 100", () => {
    const broken = structuredClone(defaultScorecardConfig);
    broken.criteria[0].weights = [0, 10, 10];
    const parsed = parseScorecardConfig(broken);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toMatch(/total 100/);
  });
});
