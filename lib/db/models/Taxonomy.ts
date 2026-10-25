import mongoose, { Schema, Document } from "mongoose";

export interface ITaxonomy extends Document {
  type: "pakistani_city" | "turkish_city" | "study_field" | "study_level" | "best_time";
  value: string;
  label: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaxonomySchema = new Schema<ITaxonomy>(
  {
    type: {
      type: String,
      required: true,
      enum: ["pakistani_city", "turkish_city", "study_field", "study_level", "best_time"],
    },
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

TaxonomySchema.index({ type: 1, order: 1 });
TaxonomySchema.index({ type: 1, value: 1 }, { unique: true });

export const Taxonomy =
  mongoose.models.Taxonomy || mongoose.model<ITaxonomy>("Taxonomy", TaxonomySchema);
