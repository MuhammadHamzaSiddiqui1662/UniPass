import mongoose, { Schema, Model } from "mongoose";
import type { HeroButton } from "@/lib/home/hero-content";

export interface IHeroSlide {
  _id: mongoose.Types.ObjectId;
  backgroundImage: string;
  imageAlt: string;
  title: string;
  description: string;
  buttons: HeroButton[];
  showTrustPoints: boolean;
  order: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const heroButtonSchema = new Schema<HeroButton>(
  {
    label: { type: String, required: true, trim: true, maxlength: 40 },
    href: { type: String, required: true, trim: true, maxlength: 500 },
    style: { type: String, enum: ["solid", "outline"], default: "solid" },
  },
  { _id: false }
);

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    backgroundImage: { type: String, required: true, trim: true },
    imageAlt: { type: String, default: "", trim: true, maxlength: 200 },
    title: { type: String, default: "", trim: true, maxlength: 180 },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    buttons: { type: [heroButtonSchema], default: [] },
    showTrustPoints: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

heroSlideSchema.index({ status: 1, order: 1 });

export const HeroSlide: Model<IHeroSlide> =
  mongoose.models.HeroSlide || mongoose.model<IHeroSlide>("HeroSlide", heroSlideSchema);
