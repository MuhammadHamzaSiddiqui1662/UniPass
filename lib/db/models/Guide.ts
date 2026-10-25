import mongoose, { Schema, Model } from "mongoose";

export interface IGuide {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  coverImage?: string;
  readTime: number;
  featured: boolean;
  order: number;
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const guideSchema = new Schema<IGuide>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: String,
    readTime: { type: Number, required: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    metaTitle: String,
    metaDescription: String,
    ogImage: String,
  },
  { timestamps: true }
);

guideSchema.index({ status: 1, category: 1, order: 1 });

export const Guide: Model<IGuide> =
  mongoose.models.Guide || mongoose.model<IGuide>("Guide", guideSchema);
