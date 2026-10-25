import mongoose, { Schema, Model } from "mongoose";

export interface IProgram {
  _id: mongoose.Types.ObjectId;
  university: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  level: string;
  field: string;
  duration: string;
  language: string;
  tuition?: number;
  tuitionCurrency: string;
  requirements: string;
  description?: string;
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    level: { type: String, required: true },
    field: { type: String, required: true },
    duration: { type: String, required: true },
    language: { type: String, required: true },
    tuition: Number,
    tuitionCurrency: { type: String, default: "USD" },
    requirements: { type: String, required: true },
    description: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

programSchema.index({ status: 1, level: 1, field: 1 });

export const Program: Model<IProgram> =
  mongoose.models.Program ||
  mongoose.model<IProgram>("Program", programSchema);
