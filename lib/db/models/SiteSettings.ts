import mongoose, { Schema, Model } from "mongoose";

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId;
  brandName: string;
  tagline: string;
  logo: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  officeAddress: string;
  socials: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  notificationRecipients: string[];
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultOgImage?: string;
  turkiyeBurslariCriteria: {
    level: string;
    ageLimit: number;
    minMarks: number;
  }[];
  lastTurkiyeBurslariUpdate?: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    brandName: { type: String, default: "UniPass" },
    tagline: {
      type: String,
      default:
        "Advisors for students applying to universities in Türkiye. UniPass is your bridge to Turkish education.",
    },
    logo: { type: String, default: "/assets/logo.jpeg" },
    whatsappNumber: {
      type: String,
      default: "+92-XXX-XXXXXXX (PLACEHOLDER)",
    },
    phone: { type: String, default: "+92-XXX-XXXXXXX (PLACEHOLDER)" },
    email: {
      type: String,
      default: "hello@unipass.example.com (PLACEHOLDER)",
    },
    officeAddress: {
      type: String,
      default: "[Office address in Pakistan - PLACEHOLDER]",
    },
    socials: {
      facebook: String,
      instagram: String,
      linkedin: String,
      twitter: String,
    },
    notificationRecipients: {
      type: [String],
      default: ["admin@unipass.example.com"],
    },
    defaultMetaTitle: {
      type: String,
      default: "UniPass | Study in Türkiye from Pakistan",
    },
    defaultMetaDescription: {
      type: String,
      default:
        "Expert guidance for Pakistani students applying to Turkish universities. Free consultation, scholarship info, and full application support.",
    },
    defaultOgImage: String,
    turkiyeBurslariCriteria: {
      type: [
        {
          level: { type: String, required: true },
          ageLimit: { type: Number, required: true },
          minMarks: { type: Number, required: true },
        },
      ],
      default: [
        { level: "Bachelor's", ageLimit: 21, minMarks: 70 },
        { level: "Master's", ageLimit: 30, minMarks: 75 },
        { level: "PhD", ageLimit: 35, minMarks: 75 },
      ],
    },
    lastTurkiyeBurslariUpdate: Date,
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);
