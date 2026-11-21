import mongoose, { Schema, Model } from "mongoose";

export interface ICountryOutlook {
  _id: mongoose.Types.ObjectId;
  order: number;
  country: string;
  summary: string;
  tier1Share: number;
  tier2Share: number;
  tier3Share: number;
  accessFactor: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const countryOutlookSchema = new Schema<ICountryOutlook>(
  {
    order: { type: Number, default: 0 },
    country: { type: String, required: true },
    summary: { type: String, default: "" },
    tier1Share: { type: Number, required: true },
    tier2Share: { type: Number, required: true },
    tier3Share: { type: Number, required: true },
    accessFactor: { type: Number, required: true },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

countryOutlookSchema.index({ status: 1, order: 1 });

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.CountryOutlook;
}

export const CountryOutlook: Model<ICountryOutlook> =
  mongoose.models.CountryOutlook ||
  mongoose.model<ICountryOutlook>("CountryOutlook", countryOutlookSchema);
