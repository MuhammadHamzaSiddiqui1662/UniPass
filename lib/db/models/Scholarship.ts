import mongoose, { Schema, Model } from "mongoose";

export interface IScholarship {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  type: "turkiye-burslari" | "university-merit" | "other";
  university?: mongoose.Types.ObjectId;
  amount?: string;
  coverage: string[];
  eligibility: {
    level?: string;
    ageLimit?: number;
    minMarks?: number;
  };
  criteria?: string;
  description: string;
  applicationDeadline?: Date;
  externalUrl?: string;
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scholarshipSchema = new Schema<IScholarship>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["turkiye-burslari", "university-merit", "other"],
      required: true,
    },
    university: { type: Schema.Types.ObjectId, ref: "University" },
    amount: String,
    coverage: [String],
    eligibility: {
      level: String,
      ageLimit: Number,
      minMarks: Number,
    },
    criteria: String,
    description: { type: String, required: true },
    applicationDeadline: Date,
    externalUrl: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

scholarshipSchema.index({ status: 1, type: 1 });

export const Scholarship: Model<IScholarship> =
  mongoose.models.Scholarship ||
  mongoose.model<IScholarship>("Scholarship", scholarshipSchema);
