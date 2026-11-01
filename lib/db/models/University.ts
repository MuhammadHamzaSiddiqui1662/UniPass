import mongoose, { Schema, Model } from "mongoose";

export interface IUniversity {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  type: "public" | "private";
  city: string;
  country: string;
  countryCode: string;
  scholarshipType: "fully_funded" | "partially_funded" | "none";
  aliases: string[];
  featuredOnHome: boolean;
  homeOrder: number;
  ranking?: number;
  tuitionFrom: number;
  tuitionTo?: number;
  tuitionCurrency: string;
  website?: string;
  intake?: string;
  languages: string[];
  description: string;
  whyChoose?: string;
  programsInfo?: string;
  campusLife?: string;
  logo?: string;
  logoAlt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  gallery: string[];
  galleryAlts: string[];
  fields: string[];
  levels: string[];
  hasMeritScholarship: boolean;
  turkiyeBurslariEligible: boolean;
  facts: {
    type?: string;
    city?: string;
    tuitionFrom?: string;
    levels?: string;
    fields?: string;
    scholarships?: string;
  };
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const universitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["public", "private"], required: true },
    city: { type: String, required: true },
    country: { type: String, default: "Türkiye" },
    countryCode: { type: String, default: "TR", uppercase: true },
    scholarshipType: {
      type: String,
      enum: ["fully_funded", "partially_funded", "none"],
      default: "none",
    },
    aliases: { type: [String], default: [] },
    featuredOnHome: { type: Boolean, default: false },
    homeOrder: { type: Number, default: 0 },
    ranking: Number,
    tuitionFrom: { type: Number, required: true },
    tuitionTo: Number,
    tuitionCurrency: { type: String, default: "USD" },
    website: String,
    intake: String,
    languages: [String],
    description: { type: String, required: true },
    whyChoose: String,
    programsInfo: String,
    campusLife: String,
    logo: String,
    logoAlt: String,
    featuredImage: String,
    featuredImageAlt: String,
    gallery: [String],
    galleryAlts: { type: [String], default: [] },
    fields: [String],
    levels: [String],
    hasMeritScholarship: { type: Boolean, default: false },
    turkiyeBurslariEligible: { type: Boolean, default: true },
    facts: {
      type: Object,
      default: {},
    },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    metaTitle: String,
    metaDescription: String,
    ogImage: String,
  },
  { timestamps: true },
);

universitySchema.index({ status: 1, city: 1, type: 1 });
universitySchema.index({ status: 1, featuredOnHome: 1, homeOrder: 1 });
universitySchema.index({ countryCode: 1, scholarshipType: 1 });
universitySchema.index({ fields: 1 });
universitySchema.index({ levels: 1 });

export const University: Model<IUniversity> =
  mongoose.models.University ||
  mongoose.model<IUniversity>("University", universitySchema);
