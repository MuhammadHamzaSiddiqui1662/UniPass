import { z } from "zod";
import { countrySharesBalance, weightsAreBalanced } from "@/lib/scholarships/scorecard";
import type { ScorecardConfigInput } from "@/lib/scholarships/types";

const triple = z.tuple([z.number(), z.number(), z.number()]);

const scorecardConfigSchema = z.object({
  levels: z.array(z.object({
    level: z.number(),
    name: z.string().min(1),
    meaning: z.string(),
    typicalPrograms: z.string(),
  })).length(3),
  bands: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    meaning: z.string(),
    action: z.string(),
    thresholds: triple.optional(),
  })).min(4),
  criteria: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    evidence: z.string(),
    howToImprove: z.string(),
    weights: triple,
  })).length(15),
  gates: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    why: z.string(),
    minimums: triple,
  })).length(6),
  mphilPublicationRelief: z.number().min(0).max(1),
  probability: z.object({
    pmax: triple,
    midpoint: triple,
    steepness: triple,
    gateFailMultiplier: z.number().min(0).max(1),
    cap: z.number().min(0).max(1),
    highAt: z.number().min(0).max(1),
    moderateAt: z.number().min(0).max(1),
    lowAt: z.number().min(0).max(1),
  }),
  scoring: z.object({
    cgpaFloor: z.number(),
    cgpaCeiling: z.number(),
    ieltsFloor: z.number(),
    ieltsCeiling: z.number(),
    greFloor: z.number(),
    greCeiling: z.number(),
    gatFloor: z.number(),
    gatCeiling: z.number(),
    experienceYearsForFull: z.number().positive(),
    pointsPerAward: z.number().min(0),
    publicationQ1: z.number().min(0),
    publicationOther: z.number().min(0),
    publicationConference: z.number().min(0),
    moiIelts: z.number().min(0).max(9),
    ratingScale: z.number().positive(),
    hostAcceptanceMinimum: z.number().min(0).max(100),
  }),
  gpaScales: z.array(z.object({
    label: z.string().min(1),
    factor: z.number(),
    percentage: z.boolean().optional(),
  })).min(1),
  percentageTable: z.array(z.object({ min: z.number(), value: z.number() })).min(1),
  degreeStatuses: z.array(z.object({ label: z.string().min(1), score: z.number() })).min(1),
  relevance: z.array(z.object({ label: z.string().min(1), factor: z.number() })).min(1),
  institutions: z.array(z.object({ label: z.string().min(1), score: z.number() })).min(1),
  disciplines: z.array(z.object({ label: z.string().min(1), multiplier: z.number() })).min(1),
  englishTests: z.array(z.object({ label: z.string().min(1), kind: z.string().min(1) })).min(1),
  toeflTable: z.array(z.object({ min: z.number(), value: z.number() })).min(1),
  pteTable: z.array(z.object({ min: z.number(), value: z.number() })).min(1),
  duolingoTable: z.array(z.object({ min: z.number(), value: z.number() })).min(1),
  standardisedTests: z.array(z.object({ label: z.string().min(1), kind: z.string().min(1) })).min(1),
  supervisors: z.array(z.object({ label: z.string().min(1), score: z.number() })).min(1),
  referees: z.array(z.object({ label: z.string().min(1), score: z.number() })).min(1),
  refusals: z.array(z.object({ label: z.string().min(1), score: z.number() })).min(1),
  gaps: z.array(z.object({ label: z.string().min(1), factor: z.number() })).min(1),
  targetDegrees: z.array(z.object({ label: z.string().min(1), mphil: z.boolean() })).min(1),
  documents: z.array(z.object({ key: z.string().min(1), label: z.string().min(1) })).min(1),
});

export function parseScorecardConfig(body: unknown) {
  const parsed = scorecardConfigSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    return { ok: false as const, error: `${where}${issue?.message || "Check the scorecard fields and try again."}` };
  }
  const config = parsed.data as ScorecardConfigInput;
  if (!weightsAreBalanced(config)) {
    return { ok: false as const, error: "Each level's criterion weights must total 100." };
  }
  return { ok: true as const, config };
}

export const fundingRouteSchema = z.object({
  order: z.number().int().min(0),
  name: z.string().min(1),
  country: z.string().min(1),
  hosts: z.string().default(""),
  degreeLevel: z.string().min(1),
  stringency: z.number().int().min(1).max(3),
  coverage: z.string().default(""),
  minCgpa: z.number().min(0).max(4),
  minEnglish: z.number().min(0).max(9),
  minPublicationPoints: z.number().min(0),
  maxAge: z.number().int().min(1).max(80).nullable().default(null),
  hostAcceptance: z.enum(["Yes", "No", "Varies"]),
  notes: z.string().default(""),
  officialUrl: z.string().default(""),
  status: z.enum(["draft", "published"]),
});

export const countryOutlookSchema = z.object({
  order: z.number().int().min(0),
  country: z.string().min(1),
  summary: z.string().default(""),
  tier1Share: z.number().min(0).max(1),
  tier2Share: z.number().min(0).max(1),
  tier3Share: z.number().min(0).max(1),
  accessFactor: z.number().min(0).max(2),
  status: z.enum(["draft", "published"]),
}).superRefine((country, ctx) => {
  if (!countrySharesBalance(country)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tier shares must total 1.",
      path: ["tier1Share"],
    });
  }
});
