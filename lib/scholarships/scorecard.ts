import type {
  CandidateInput,
  CountryOutlookInput,
  CountryResult,
  CriterionResult,
  FundingRouteInput,
  GateResult,
  ImprovementResult,
  LevelResult,
  LookupStep,
  RouteMatch,
  ScorecardConfigInput,
  ScorecardResult,
} from "./types";

const LEVELS = [0, 1, 2] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function num(value: number | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findLabel<T extends { label: string }>(rows: T[], label: string) {
  return rows.find((row) => row.label === label);
}

function floorLookup(table: LookupStep[], score: number) {
  let found: number | null = null;
  const ordered = [...table].sort((a, b) => a.min - b.min);
  for (const row of ordered) {
    if (row.min <= score) found = row.value;
  }
  return found ?? 0;
}

function linear(value: number, floor: number, ceiling: number) {
  if (ceiling === floor) return 0;
  return clamp(((value - floor) / (ceiling - floor)) * 100, 0, 100);
}

function toCgpa(marks: number | null, scale: string, config: ScorecardConfigInput) {
  if (marks === null || marks === undefined || Number.isNaN(Number(marks)) || !scale) return null;
  const row = findLabel(config.gpaScales, scale);
  if (!row) return null;
  const amount = Number(marks);
  if (!Number.isFinite(amount)) return null;
  if (row.percentage) return floorLookup(config.percentageTable, amount);
  return Math.min(4, amount * row.factor);
}

function ieltsEquivalent(input: CandidateInput, config: ScorecardConfigInput) {
  const kind = findLabel(config.englishTests, input.englishTest)?.kind;
  const score = num(input.englishScore);
  if (kind === "ielts") return Math.min(9, score);
  if (kind === "toefl") return floorLookup(config.toeflTable, score);
  if (kind === "pte") return floorLookup(config.pteTable, score);
  if (kind === "duolingo") return floorLookup(config.duolingoTable, score);
  if (kind === "moi") return config.scoring.moiIelts;
  return 0;
}

function ratingScore(rating: number, scale: number) {
  if (!scale) return 0;
  return clamp((num(rating) / scale) * 100, 0, 100);
}

function includesText(haystack: string, needle: string) {
  if (!needle) return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function bandFor(score: number, levelIndex: number, config: ScorecardConfigInput) {
  const strong = config.bands.find((band) => band.key === "strong");
  const competitive = config.bands.find((band) => band.key === "competitive");
  const borderline = config.bands.find((band) => band.key === "borderline");
  const notReady = config.bands.find((band) => band.key === "notReady");
  if (strong?.thresholds && score >= strong.thresholds[levelIndex]) return strong.label;
  if (competitive?.thresholds && score >= competitive.thresholds[levelIndex]) return competitive.label;
  if (borderline?.thresholds && score >= borderline.thresholds[levelIndex]) return borderline.label;
  return notReady?.label ?? "Not Ready";
}

function formatGapNumber(value: number, digits: number) {
  return value.toFixed(digits);
}

function englishCaptured(input: CandidateInput, config: ScorecardConfigInput, ielts: number) {
  const kind = findLabel(config.englishTests, input.englishTest)?.kind;
  if (kind === "moi") return `${input.englishTest} (IELTS-eq ${ielts.toFixed(1)})`;
  if (kind === "none" || !input.englishTest) return input.englishTest || "Not selected";
  if (input.englishScore === null || input.englishScore === undefined || !Number.isFinite(Number(input.englishScore))) {
    return `${input.englishTest} (not entered)`;
  }
  return `${input.englishTest} ${input.englishScore} (IELTS-eq ${ielts.toFixed(1)})`;
}

export function weightsAreBalanced(config: ScorecardConfigInput) {
  return LEVELS.every((index) => {
    const total = config.criteria.reduce((sum, row) => sum + num(row.weights[index]), 0);
    return Math.abs(total - 100) < 0.001;
  });
}

export function countrySharesBalance(country: Pick<CountryOutlookInput, "tier1Share" | "tier2Share" | "tier3Share">) {
  const total = num(country.tier1Share) + num(country.tier2Share) + num(country.tier3Share);
  return Math.abs(total - 1) < 0.0001;
}

export function evaluateScorecard(
  input: CandidateInput,
  config: ScorecardConfigInput,
  routes: FundingRouteInput[],
  countries: CountryOutlookInput[],
  planLevel = 2
): ScorecardResult {
  const scoring = config.scoring;
  const undergraduateCgpa = toCgpa(input.undergraduateMarks, input.undergraduateScale, config);
  const mastersCgpa = toCgpa(input.mastersMarks, input.mastersScale, config);
  const bestCgpa = mastersCgpa ?? undergraduateCgpa ?? 0;
  const ielts = ieltsEquivalent(input, config);
  const disciplineMultiplier = findLabel(config.disciplines, input.discipline)?.multiplier ?? 1;
  const q1Papers = Math.max(0, num(input.q1Papers));
  const otherPapers = Math.max(0, num(input.otherPapers));
  const conferencePapers = Math.max(0, num(input.conferencePapers));
  const publicationPoints =
    disciplineMultiplier *
    (scoring.publicationQ1 * q1Papers +
      scoring.publicationOther * otherPapers +
      scoring.publicationConference * conferencePapers);
  const documentRows = config.documents;
  const readyCount = documentRows.filter((item) => input.documents[item.key]).length;
  const documentReadiness = documentRows.length ? (readyCount / documentRows.length) * 100 : 0;
  const refusalScore = findLabel(config.refusals, input.visaRefusals)?.score ?? 0;
  const gapFactor = findLabel(config.gaps, input.gap)?.factor ?? 1;
  const compliance = refusalScore * gapFactor;
  const supervisorScore = findLabel(config.supervisors, input.supervisor)?.score ?? 0;
  const mphil = findLabel(config.targetDegrees, input.targetDegree)?.mphil === true;
  const relief = mphil ? num(config.mphilPublicationRelief) : 1;

  const undergraduateScore =
    undergraduateCgpa === null ? 0 : linear(undergraduateCgpa, scoring.cgpaFloor, scoring.cgpaCeiling);
  const mastersScore =
    mastersCgpa === null ? undergraduateScore : linear(mastersCgpa, scoring.cgpaFloor, scoring.cgpaCeiling);
  const degreeScore =
    (findLabel(config.degreeStatuses, input.degreeStatus)?.score ?? 0) *
    (findLabel(config.relevance, input.relevance)?.factor ?? 0);
  const institutionScore = findLabel(config.institutions, input.institution)?.score ?? 0;
  const publicationScore = Math.min(100, publicationPoints);
  const proposalScore = ratingScore(input.proposalRating, scoring.ratingScale);
  const englishScore = linear(ielts, scoring.ieltsFloor, scoring.ieltsCeiling);
  const testKind = findLabel(config.standardisedTests, input.standardisedTest)?.kind;
  const standardisedScore =
    testKind === "gre"
      ? linear(num(input.standardisedScore), scoring.greFloor, scoring.greCeiling)
      : testKind === "gat"
        ? linear(num(input.standardisedScore), scoring.gatFloor, scoring.gatCeiling)
        : 0;
  const experienceScore = Math.min(
    100,
    scoring.experienceYearsForFull ? (num(input.experienceYears) / scoring.experienceYearsForFull) * 100 : 0
  );
  const refereeScore = findLabel(config.referees, input.referees)?.score ?? 0;
  const awardScore = Math.min(100, num(input.awards) * scoring.pointsPerAward);
  const sopScore = ratingScore(input.sopRating, scoring.ratingScale);

  const captured = [
    mastersCgpa === null ? "(none – UG score used)" : `${mastersCgpa.toFixed(2)} / 4.0 eq`,
    undergraduateCgpa === null ? "n/a" : `${undergraduateCgpa.toFixed(2)} / 4.0 eq`,
    `${input.degreeStatus || "Not selected"} | ${input.relevance || "Not selected"}`,
    input.institution || "Not selected",
    `${q1Papers} Q1/Q2, ${otherPapers} other, ${conferencePapers} conf. (${Math.round(publicationPoints)} pts)`,
    `Rating ${num(input.proposalRating)} / ${scoring.ratingScale}`,
    englishCaptured(input, config, ielts),
    `${input.standardisedTest}${input.standardisedScore === null || input.standardisedScore === undefined ? "" : ` ${input.standardisedScore}`}`,
    `${num(input.experienceYears)} yrs`,
    input.supervisor || "Not selected",
    input.referees || "Not selected",
    `${num(input.awards)} item(s)`,
    `Rating ${num(input.sopRating)} / ${scoring.ratingScale}`,
    `${Math.round(documentReadiness)}% of documents ready`,
    `${input.visaRefusals} | Gap: ${input.gap}`,
  ];

  const scores = [
    mastersScore,
    undergraduateScore,
    degreeScore,
    institutionScore,
    publicationScore,
    proposalScore,
    englishScore,
    standardisedScore,
    experienceScore,
    supervisorScore,
    refereeScore,
    awardScore,
    sopScore,
    documentReadiness,
    compliance,
  ];

  const criteria: CriterionResult[] = config.criteria.map((row, index) => {
    const score = scores[index] ?? 0;
    const weights = row.weights.map((weight) => num(weight)) as [number, number, number];
    return {
      key: row.key,
      label: row.label,
      captured: captured[index] ?? "",
      score,
      weights,
      points: weights.map((weight) => (score * weight) / 100) as [number, number, number],
      evidence: row.evidence,
      howToImprove: row.howToImprove,
    };
  });

  const totals = LEVELS.map((level) => criteria.reduce((sum, row) => sum + row.points[level], 0));

  const gateValues = [bestCgpa, ielts, publicationPoints, documentReadiness, supervisorScore, compliance];
  const gates: GateResult[] = config.gates.map((gate, index) => {
    const minimums = gate.minimums.map((minimum, level) => {
      const base = num(minimum);
      return gate.key === "publications" ? base * relief : base;
    }) as [number, number, number];
    const value = gateValues[index] ?? 0;
    return {
      key: gate.key,
      label: gate.label,
      value,
      minimums,
      passed: minimums.map((minimum) => value >= minimum) as [boolean, boolean, boolean],
      why: gate.why,
    };
  });

  const gateLabel = config.bands.find((band) => band.key === "gate")?.label ?? "Gate Not Met – Fix First";
  const levels: LevelResult[] = LEVELS.map((level) => {
    const failed = gates.filter((gate) => !gate.passed[level]);
    const band = bandFor(totals[level], level, config);
    const copy = config.levels[level];
    const probabilityBase =
      config.probability.pmax[level] /
      (1 + Math.exp(-config.probability.steepness[level] * (totals[level] - config.probability.midpoint[level])));
    return {
      level: level + 1,
      name: copy?.name ?? `Level ${level + 1}`,
      score: totals[level],
      gatesPassed: gates.length - failed.length,
      gatesTotal: gates.length,
      band,
      result: failed.length ? gateLabel : band,
      failedGates: failed.length ? `${failed.map((gate) => gate.label).join("; ")}; ` : "None",
      probability: probabilityBase * (failed.length ? config.probability.gateFailMultiplier : 1),
      meaning: copy?.meaning ?? "",
      typicalPrograms: copy?.typicalPrograms ?? "",
    };
  });

  const planIndex = clamp(Math.round(planLevel), 1, 3) - 1;
  const improvements: ImprovementResult[] = criteria
    .map((row, index) => ({
      label: row.label,
      score: row.score,
      pointsLost: Math.round(((row.weights[planIndex] * (100 - row.score)) / 100) * 1e6) / 1e6,
      howToImprove: row.howToImprove,
      index,
    }))
    .sort((a, b) => b.pointsLost - a.pointsLost || b.index - a.index)
    .map((row, rank) => ({
      rank: rank + 1,
      label: row.label,
      score: row.score,
      pointsLost: row.pointsLost,
      howToImprove: row.howToImprove,
    }));

  const routeMatches: RouteMatch[] = routes
    .filter((route) => route.status === "published")
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((route) => {
      const levelIndex = clamp(Math.round(route.stringency), 1, 3) - 1;
      const degreeMatch =
        includesText(route.degreeLevel, input.targetDegree) ||
        (mphil && includesText(route.degreeLevel, "Master"));
      const cgpaShort = bestCgpa < num(route.minCgpa);
      const englishShort = ielts < num(route.minEnglish);
      const publicationMinimum = num(route.minPublicationPoints) * relief;
      const publicationShort = publicationPoints < publicationMinimum;
      const hasAgeLimit = route.maxAge !== null && route.maxAge !== undefined;
      const ageMissing = hasAgeLimit && (input.age === null || input.age === undefined || !Number.isFinite(Number(input.age)));
      const ageLimited = hasAgeLimit && !ageMissing && num(input.age) > Number(route.maxAge);
      const supervisorNeeded =
        route.hostAcceptance === "Yes" && supervisorScore < scoring.hostAcceptanceMinimum;
      let gaps = "None";
      if (!degreeMatch) {
        gaps = "Degree level not offered by this route";
      } else if (cgpaShort || englishShort || publicationShort || ageLimited || ageMissing || supervisorNeeded) {
        gaps =
          (cgpaShort ? `CGPA short by ${formatGapNumber(num(route.minCgpa) - bestCgpa, 2)}; ` : "") +
          (englishShort ? `English short by ${formatGapNumber(num(route.minEnglish) - ielts, 1)} band; ` : "") +
          (publicationShort
            ? `Publications short by ${Math.round(publicationMinimum - publicationPoints)} pts; `
            : "") +
          (ageMissing ? "Age not provided; " : "") +
          (ageLimited ? "Over age limit; " : "") +
          (supervisorNeeded ? "Supervisor acceptance needed; " : "");
      }
      const hardMet = degreeMatch && gaps === "None";
      const rating = !degreeMatch
        ? "Level mismatch"
        : !hardMet
          ? "Hard requirement gap"
          : bandFor(totals[levelIndex], levelIndex, config);
      return {
        name: route.name,
        country: route.country,
        hosts: route.hosts,
        degreeLevel: route.degreeLevel,
        stringency: levelIndex + 1,
        coverage: route.coverage,
        notes: route.notes,
        officialUrl: route.officialUrl,
        score: totals[levelIndex],
        degreeMatch,
        hardMet,
        rating,
        gaps,
      };
    });

  const win = levels.map((level) => level.probability);
  const publishedCountries = countries.filter((country) => country.status === "published");
  const rawCountries = publishedCountries.map((country) => {
    const mixed =
      num(country.tier1Share) * win[0] + num(country.tier2Share) * win[1] + num(country.tier3Share) * win[2];
    return {
      country: country.country,
      summary: country.summary,
      probability: Math.min(config.probability.cap, num(country.accessFactor) * mixed),
      preferred: input.preferredCountries.some((name) => name === country.country),
      order: country.order,
    };
  });
  const probabilities = rawCountries.map((country) => country.probability);
  const countriesRanked: CountryResult[] = rawCountries
    .map((country) => ({
      country: country.country,
      summary: country.summary,
      probability: country.probability,
      rating:
        country.probability >= config.probability.highAt
          ? "High"
          : country.probability >= config.probability.moderateAt
            ? "Moderate"
            : country.probability >= config.probability.lowAt
              ? "Low"
              : "Very Low",
      preferred: country.preferred,
      rank: probabilities.filter((value) => value > country.probability + 1e-12).length + 1,
      order: country.order,
    }))
    .sort((a, b) => a.rank - b.rank || b.probability - a.probability || a.order - b.order)
    .map(({ order: _order, ...country }) => country);

  return {
    criteria,
    gates,
    levels,
    improvements,
    routes: routeMatches,
    countries: countriesRanked,
    workings: {
      undergraduateCgpa,
      mastersCgpa,
      bestCgpa,
      ielts,
      publicationPoints,
      documentReadiness,
      compliance,
      supervisorScore,
      relief,
    },
  };
}
