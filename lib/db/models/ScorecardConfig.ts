import mongoose, { Schema, Model } from "mongoose";
import type { ScorecardConfigInput } from "@/lib/scholarships/types";

export interface IScorecardConfig {
  _id: mongoose.Types.ObjectId;
  config: ScorecardConfigInput;
  updatedAt: Date;
}

const scorecardConfigSchema = new Schema<IScorecardConfig>(
  {
    config: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.ScorecardConfig;
}

export const ScorecardConfig: Model<IScorecardConfig> =
  mongoose.models.ScorecardConfig ||
  mongoose.model<IScorecardConfig>("ScorecardConfig", scorecardConfigSchema);
