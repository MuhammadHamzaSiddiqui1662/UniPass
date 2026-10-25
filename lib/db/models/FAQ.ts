import mongoose, { Schema, Model } from "mongoose";

export interface IFAQ {
  _id: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  order: number;
  category?: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    category: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

faqSchema.index({ status: 1, order: 1 });

export const FAQ: Model<IFAQ> =
  mongoose.models.FAQ || mongoose.model<IFAQ>("FAQ", faqSchema);
