import mongoose, { Schema, Model } from "mongoose";

export interface IFundingRoute {
  _id: mongoose.Types.ObjectId;
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
  maxAge?: number | null;
  hostAcceptance: "Yes" | "No" | "Varies";
  notes: string;
  officialUrl: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const fundingRouteSchema = new Schema<IFundingRoute>(
  {
    order: { type: Number, default: 0 },
    name: { type: String, required: true },
    country: { type: String, required: true },
    hosts: { type: String, default: "" },
    degreeLevel: { type: String, required: true },
    stringency: { type: Number, required: true, min: 1, max: 3 },
    coverage: { type: String, default: "" },
    minCgpa: { type: Number, required: true },
    minEnglish: { type: Number, required: true },
    minPublicationPoints: { type: Number, default: 0 },
    maxAge: { type: Number, default: null },
    hostAcceptance: { type: String, enum: ["Yes", "No", "Varies"], default: "Varies" },
    notes: { type: String, default: "" },
    officialUrl: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

fundingRouteSchema.index({ status: 1, order: 1 });

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.FundingRoute;
}

export const FundingRoute: Model<IFundingRoute> =
  mongoose.models.FundingRoute || mongoose.model<IFundingRoute>("FundingRoute", fundingRouteSchema);
