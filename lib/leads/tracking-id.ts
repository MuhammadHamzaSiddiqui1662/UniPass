import mongoose, { Schema } from "mongoose";

/** Lead dates follow Pakistan local time so the id matches the day the team sees. */
export const LEAD_TIMEZONE = "Asia/Karachi";

interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String },
  seq: { type: Number, required: true, default: 0 },
});

const Counter =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);

export function leadDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LEAD_TIMEZONE,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  const year = value("year");
  const month = value("month");
  const day = value("day");
  if (!year || !month || !day) {
    throw new Error("Could not format lead date");
  }

  return `${year}-${month}-${day}`;
}

export function formatLeadTrackingId(date: Date, sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Lead sequence must be a positive integer");
  }

  return `${leadDateKey(date)}-${sequence}`;
}

function counterId(dateKey: string): string {
  return `lead:${dateKey}`;
}

/** Never moves that day's counter backward. */
export async function syncLeadSequenceFloor(dateKey: string, minimum: number): Promise<void> {
  if (!Number.isInteger(minimum) || minimum < 0) return;
  await Counter.updateOne({ _id: counterId(dateKey) }, { $max: { seq: minimum } }, { upsert: true });
}

/** Reserves the next integer for the lead's Pakistan calendar day. Each day starts at 1. */
export async function reserveLeadSequence(date: Date): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId(leadDateKey(date)) },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  if (!counter || !Number.isInteger(counter.seq) || counter.seq < 1) {
    throw new Error("Failed to reserve lead sequence");
  }
  return counter.seq;
}

/** Removes the old single counter so numbering is stored per day. */
export async function retireGlobalLeadCounter(): Promise<void> {
  await Counter.deleteOne({ _id: "lead" });
}
