export type WeightedRow = {
  key: string;
  label: string;
  evidence: string;
  howToImprove: string;
  weights: [number, number, number];
};

export type GateRow = {
  key: string;
  label: string;
  why: string;
  minimums: [number, number, number];
};

export type BandRow = {
  key: string;
  label: string;
  meaning: string;
  action: string;
  thresholds?: [number, number, number];
};

export type LevelCopy = {
  level: number;
  name: string;
  meaning: string;
  typicalPrograms: string;
};

export type LabeledScore = { label: string; score: number };
export type LabeledFactor = { label: string; factor: number };
export type LabeledMultiplier = { label: string; multiplier: number };
export type GpaScale = { label: string; factor: number; percentage?: boolean };
export type LookupStep = { min: number; value: number };
export type NamedKind = { label: string; kind: string };
export type TargetDegree = { label: string; mphil: boolean };
export type DocumentItem = { key: string; label: string };

export type ScorecardConfigInput = {
  levels: LevelCopy[];
  bands: BandRow[];
  criteria: WeightedRow[];
  gates: GateRow[];
  mphilPublicationRelief: number;
  probability: {
    pmax: [number, number, number];
    midpoint: [number, number, number];
    steepness: [number, number, number];
    gateFailMultiplier: number;
    cap: number;
    highAt: number;
    moderateAt: number;
    lowAt: number;
  };
  scoring: {
    cgpaFloor: number;
    cgpaCeiling: number;
    ieltsFloor: number;
    ieltsCeiling: number;
    greFloor: number;
    greCeiling: number;
    gatFloor: number;
    gatCeiling: number;
    experienceYearsForFull: number;
    pointsPerAward: number;
    publicationQ1: number;
    publicationOther: number;
    publicationConference: number;
    moiIelts: number;
    ratingScale: number;
    hostAcceptanceMinimum: number;
  };
  gpaScales: GpaScale[];
  percentageTable: LookupStep[];
  degreeStatuses: LabeledScore[];
  relevance: LabeledFactor[];
  institutions: LabeledScore[];
  disciplines: LabeledMultiplier[];
  englishTests: NamedKind[];
  toeflTable: LookupStep[];
  pteTable: LookupStep[];
  duolingoTable: LookupStep[];
  standardisedTests: NamedKind[];
  supervisors: LabeledScore[];
  referees: LabeledScore[];
  refusals: LabeledScore[];
  gaps: LabeledFactor[];
  targetDegrees: TargetDegree[];
  documents: DocumentItem[];
};

export type FundingRouteInput = {
  order: number;
  name: string;
  country: string;
  hosts: string;
  degreeLevel: string;
  stringency: number;
  coverage: string;
  minCgpa: number;
  minEnglish: number;
  minPublicationPoints: number;
  maxAge: number | null;
  hostAcceptance: string;
  notes: string;
  officialUrl: string;
  status: "draft" | "published";
};

export type CountryOutlookInput = {
  order: number;
  country: string;
  summary: string;
  tier1Share: number;
  tier2Share: number;
  tier3Share: number;
  accessFactor: number;
  status: "draft" | "published";
};

export type CandidateInput = {
  name: string;
  fileId: string;
  age: number | null;
  targetDegree: string;
  discipline: string;
  field: string;
  preferredCountries: [string, string, string];
  undergraduateMarks: number | null;
  undergraduateScale: string;
  mastersMarks: number | null;
  mastersScale: string;
  degreeStatus: string;
  relevance: string;
  institution: string;
  q1Papers: number;
  otherPapers: number;
  conferencePapers: number;
  proposalRating: number;
  experienceYears: number;
  awards: number;
  englishTest: string;
  englishScore: number | null;
  standardisedTest: string;
  standardisedScore: number | null;
  supervisor: string;
  referees: string;
  sopRating: number;
  documents: Record<string, boolean>;
  visaRefusals: string;
  gap: string;
};

export type CriterionResult = {
  key: string;
  label: string;
  captured: string;
  score: number;
  weights: [number, number, number];
  points: [number, number, number];
  evidence: string;
  howToImprove: string;
};

export type GateResult = {
  key: string;
  label: string;
  value: number;
  minimums: [number, number, number];
  passed: [boolean, boolean, boolean];
  why: string;
};

export type LevelResult = {
  level: number;
  name: string;
  score: number;
  gatesPassed: number;
  gatesTotal: number;
  band: string;
  result: string;
  failedGates: string;
  probability: number;
  meaning: string;
  typicalPrograms: string;
};

export type ImprovementResult = {
  rank: number;
  label: string;
  score: number;
  pointsLost: number;
  howToImprove: string;
};

export type RouteMatch = {
  name: string;
  country: string;
  hosts: string;
  degreeLevel: string;
  stringency: number;
  coverage: string;
  notes: string;
  officialUrl: string;
  score: number;
  degreeMatch: boolean;
  hardMet: boolean;
  rating: string;
  gaps: string;
};

export type CountryResult = {
  country: string;
  summary: string;
  probability: number;
  rating: string;
  preferred: boolean;
  rank: number;
};

export type ScorecardResult = {
  criteria: CriterionResult[];
  gates: GateResult[];
  levels: LevelResult[];
  improvements: ImprovementResult[];
  routes: RouteMatch[];
  countries: CountryResult[];
  workings: {
    undergraduateCgpa: number | null;
    mastersCgpa: number | null;
    bestCgpa: number;
    ielts: number;
    publicationPoints: number;
    documentReadiness: number;
    compliance: number;
    supervisorScore: number;
    relief: number;
  };
};
