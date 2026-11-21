import { connectDB, CountryOutlook, FundingRoute, ScorecardConfig } from "@/lib/db";
import { defaultCountryOutlooks, defaultFundingRoutes, defaultScorecardConfig } from "./defaults";
import type { CountryOutlookInput, FundingRouteInput, ScorecardConfigInput } from "./types";

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function ensureScorecardDefaults() {
  await connectDB();
  const config = await ScorecardConfig.findOne();
  if (!config) {
    await ScorecardConfig.create({ config: defaultScorecardConfig });
  }
  if ((await FundingRoute.countDocuments()) === 0) {
    await FundingRoute.insertMany(defaultFundingRoutes);
  }
  if ((await CountryOutlook.countDocuments()) === 0) {
    await CountryOutlook.insertMany(defaultCountryOutlooks);
  }
}

export async function loadScorecardAdmin() {
  await ensureScorecardDefaults();
  const [configDoc, routes, countries] = await Promise.all([
    ScorecardConfig.findOne().lean(),
    FundingRoute.find().sort({ order: 1, name: 1 }).lean(),
    CountryOutlook.find().sort({ order: 1, country: 1 }).lean(),
  ]);
  return plain({
    config: (configDoc?.config ?? defaultScorecardConfig) as ScorecardConfigInput,
    routes: routes as unknown as (FundingRouteInput & { _id: string })[],
    countries: countries as unknown as (CountryOutlookInput & { _id: string })[],
  });
}

export async function loadPublishedScorecard() {
  try {
    await ensureScorecardDefaults();
    const [configDoc, routes, countries] = await Promise.all([
      ScorecardConfig.findOne().lean(),
      FundingRoute.find({ status: "published" }).sort({ order: 1, name: 1 }).lean(),
      CountryOutlook.find({ status: "published" }).sort({ order: 1, country: 1 }).lean(),
    ]);
    return plain({
      config: (configDoc?.config ?? defaultScorecardConfig) as ScorecardConfigInput,
      routes: routes.map(stripRoute),
      countries: countries.map(stripCountry),
    });
  } catch (error) {
    console.error("Failed to load scholarship scorecard:", error);
    return {
      config: defaultScorecardConfig,
      routes: defaultFundingRoutes.filter((route) => route.status === "published"),
      countries: defaultCountryOutlooks.filter((country) => country.status === "published"),
    };
  }
}

function stripRoute(route: { _id?: unknown; __v?: unknown; createdAt?: unknown; updatedAt?: unknown }) {
  const { _id, __v, createdAt, updatedAt, ...rest } = route as Record<string, unknown>;
  return rest as FundingRouteInput;
}

function stripCountry(country: { _id?: unknown; __v?: unknown; createdAt?: unknown; updatedAt?: unknown }) {
  const { _id, __v, createdAt, updatedAt, ...rest } = country as Record<string, unknown>;
  return rest as CountryOutlookInput;
}
