import mongoose, { Schema, Model } from "mongoose";

export interface ILead {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  whatsappNumber: string;
  city: string;
  levelOfStudy: string;
  bestTimeToReach?: string;
  source: string;
  sourcePage: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  university?: mongoose.Types.ObjectId;
  program?: mongoose.Types.ObjectId;
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "applied"
    | "enrolled"
    | "lost";
  assignedTo?: mongoose.Types.ObjectId;
  notes: string;
  activity: {
    action: string;
    note?: string;
    user: mongoose.Types.ObjectId;
    timestamp: Date;
  }[];
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    fullName: { type: String, required: true },
    whatsappNumber: { type: String, required: true, index: true },
    city: { type: String, required: true },
    levelOfStudy: { type: String, required: true },
    bestTimeToReach: String,
    source: { type: String, required: true },
    sourcePage: { type: String, required: true },
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    university: { type: Schema.Types.ObjectId, ref: "University" },
    program: { type: Schema.Types.ObjectId, ref: "Program" },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "applied", "enrolled", "lost"],
      default: "new",
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "" },
    activity: [
      {
        action: { type: String, required: true },
        note: String,
        user: { type: Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1, createdAt: -1 });

export const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", leadSchema);
