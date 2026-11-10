import { Lead } from "@/lib/db/models/Lead";
import {
  formatLeadTrackingId,
  reserveLeadSequence,
  retireGlobalLeadCounter,
  syncLeadSequenceFloor,
} from "./tracking-id";

let backfill: Promise<void> | null = null;

/** Test helper. Production callers should use ensureLeadTrackingIds(). */
export function resetLeadTrackingIdBackfillForTests(): void {
  backfill = null;
}

/**
 * Assigns tracking ids to leads created before this field existed.
 * Safe to call more than once; later calls reuse the finished run.
 */
export function ensureLeadTrackingIds(): Promise<void> {
  if (!backfill) {
    backfill = assignMissingTrackingIds().catch((error) => {
      backfill = null;
      throw error;
    });
  }
  return backfill;
}

async function assignMissingTrackingIds(): Promise<void> {
  try {
    await Lead.collection.dropIndex("leadNumber_1");
  } catch {
    // The daily number repeats, so this unique index must not exist.
  }

  await retireGlobalLeadCounter();

  const numbered = await Lead.find({ trackingId: { $type: "string", $ne: "" } })
    .select("trackingId")
    .lean();
  const maxByDay = new Map<string, number>();
  for (const lead of numbered) {
    const match = /^(\d{2}-\d{2}-\d{2})-(\d+)$/.exec(lead.trackingId ?? "");
    if (!match) continue;
    const day = match[1];
    const sequence = Number(match[2]);
    maxByDay.set(day, Math.max(maxByDay.get(day) ?? 0, sequence));
  }
  for (const [day, maximum] of maxByDay) {
    await syncLeadSequenceFloor(day, maximum);
  }

  const missing = await Lead.find({
    $or: [{ trackingId: { $exists: false } }, { trackingId: null }, { trackingId: "" }],
  })
    .sort({ createdAt: 1, _id: 1 })
    .select("_id createdAt")
    .lean();

  for (const lead of missing) {
    const createdAt = lead.createdAt instanceof Date ? lead.createdAt : new Date();
    const sequence = await reserveLeadSequence(createdAt);
    const trackingId = formatLeadTrackingId(createdAt, sequence);
    await Lead.updateOne(
      {
        _id: lead._id,
        $or: [{ trackingId: { $exists: false } }, { trackingId: null }, { trackingId: "" }],
      },
      { $set: { trackingId, leadNumber: sequence } }
    );
  }
}
