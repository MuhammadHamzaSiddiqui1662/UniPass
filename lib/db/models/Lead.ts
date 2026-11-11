import mongoose, { Schema, Model } from "mongoose";
import { formatLeadTrackingId, reserveLeadSequence } from "@/lib/leads/tracking-id";

export interface ILead {
  _id: mongoose.Types.ObjectId;
  /** Public id: yy-mm-dd-sequence, for example 26-11-11-1. */
  trackingId: string;
  /** Daily sequence. Restarts at 1 on each Pakistan calendar day. */
  leadNumber: number;
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
  document?: {
    fileName: string;
    storageKey: string;
    provider: "local" | "cloudinary";
    size: number;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  };
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

const leadDocumentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    storageKey: { type: String, required: true },
    provider: { type: String, enum: ["local", "cloudinary"], required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false }
);

const leadSchema = new Schema<ILead>(
  {
    trackingId: { type: String, unique: true, sparse: true },
    leadNumber: { type: Number },
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
    document: leadDocumentSchema,
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

leadSchema.pre("save", async function () {
  if (!this.isNew && this.trackingId) return;

  const { ensureLeadTrackingIds } = await import("@/lib/leads/backfill-tracking-ids");
  await ensureLeadTrackingIds();

  if (!this.isNew) {
    const existing = await this.collection.findOne(
      { _id: this._id },
      { projection: { trackingId: 1, leadNumber: 1 } }
    );
    if (existing?.trackingId) {
      this.trackingId = String(existing.trackingId);
      this.leadNumber = Number(existing.leadNumber);
      return;
    }
  }

  const createdAt = this.createdAt instanceof Date ? this.createdAt : new Date();
  const sequence = await reserveLeadSequence(createdAt);
  this.leadNumber = sequence;
  this.trackingId = formatLeadTrackingId(createdAt, sequence);
});

if (mongoose.models.Lead) {
  mongoose.deleteModel("Lead");
}
export const Lead: Model<ILead> = mongoose.model<ILead>("Lead", leadSchema);
