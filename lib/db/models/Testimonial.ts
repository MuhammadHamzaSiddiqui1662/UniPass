import mongoose, { Schema, Model } from "mongoose";

export interface ITestimonial {
  _id: mongoose.Types.ObjectId;
  studentName: string;
  initials: string;
  quote: string;
  origin: string;
  university: string;
  verified: boolean;
  order: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    studentName: { type: String, required: true },
    initials: { type: String, required: true, maxlength: 2 },
    quote: { type: String, required: true },
    origin: { type: String, required: true },
    university: { type: String, required: true },
    verified: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

testimonialSchema.index({ status: 1, order: 1 });

export const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", testimonialSchema);
