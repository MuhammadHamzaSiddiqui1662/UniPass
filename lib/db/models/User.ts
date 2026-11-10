import mongoose, { Schema, Model } from "mongoose";
import { ROLES, type UserRole } from "@/lib/auth/permissions";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "staff" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: "super_admin" } }
);

if (mongoose.models.User) {
  mongoose.deleteModel("User");
}

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
