import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Lead } from "../lib/db";
import {
  ensureLeadTrackingIds,
  resetLeadTrackingIdBackfillForTests,
} from "../lib/leads/backfill-tracking-ids";
import { formatLeadTrackingId } from "../lib/leads/tracking-id";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Lead tracking id", () => {
  it("formats the id as yy-mm-dd-sequence in Pakistan time", () => {
    expect(formatLeadTrackingId(new Date("2026-11-10T20:00:00.000Z"), 7)).toBe("26-11-11-7");
    expect(formatLeadTrackingId(new Date("2026-11-10T18:30:00.000Z"), 7)).toBe("26-11-10-7");
    expect(formatLeadTrackingId(new Date("2026-01-05T00:00:00.000Z"), 12)).toBe("26-01-05-12");
  });
});

describe("Lead Model", () => {
  it("should create a lead with a unique incremental tracking id", async () => {
    const first = await Lead.create({
      fullName: "Test User",
      whatsappNumber: "+92 300 1234567",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
      source: "test",
      sourcePage: "/test",
      status: "new",
    });
    const second = await Lead.create({
      fullName: "Second User",
      whatsappNumber: "+92 300 7654321",
      city: "Lahore",
      levelOfStudy: "Master's",
      source: "test",
      sourcePage: "/test",
      status: "new",
    });

    expect(first.trackingId).toBe(formatLeadTrackingId(first.createdAt, first.leadNumber));
    expect(second.trackingId).toBe(formatLeadTrackingId(second.createdAt, second.leadNumber));
    expect(second.leadNumber).toBe(first.leadNumber + 1);
    expect(first.trackingId).not.toBe(second.trackingId);
    expect(first.trackingId).toMatch(/^\d{2}-\d{2}-\d{2}-\d+$/);
  });

  it("restarts the tracking number on each Pakistan calendar day", async () => {
    const firstDay = new Date("2026-11-10T18:30:00.000Z");
    const nextDay = new Date("2026-11-10T20:00:00.000Z");
    const base = {
      whatsappNumber: "+92 300 1234567",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
      source: "test",
      sourcePage: "/test",
      status: "new" as const,
    };

    const first = await Lead.create({ ...base, fullName: "Day One A", createdAt: firstDay });
    const second = await Lead.create({
      ...base,
      fullName: "Day One B",
      whatsappNumber: "+92 300 0000002",
      createdAt: new Date(firstDay.getTime() + 60_000),
    });
    const third = await Lead.create({
      ...base,
      fullName: "Day Two",
      whatsappNumber: "+92 300 0000003",
      createdAt: nextDay,
    });

    expect(first.trackingId).toBe("26-11-10-1");
    expect(second.trackingId).toBe("26-11-10-2");
    expect(third.trackingId).toBe("26-11-11-1");
  });

  it("should backfill tracking ids for leads created before the field existed", async () => {
    const dayOne = new Date("2026-11-10T18:30:00.000Z");
    const dayTwo = new Date("2026-11-10T20:00:00.000Z");
    const base = {
      whatsappNumber: "+92 300 1234567",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
      source: "test",
      sourcePage: "/test",
      status: "new",
      notes: "",
      activity: [],
      notificationSent: false,
    };
    await Lead.collection.insertMany([
      { ...base, fullName: "Day One", createdAt: dayOne, updatedAt: dayOne },
      { ...base, fullName: "Day Two", whatsappNumber: "+92 300 0000002", createdAt: dayTwo, updatedAt: dayTwo },
    ]);

    resetLeadTrackingIdBackfillForTests();
    await ensureLeadTrackingIds();

    const first = await Lead.findOne({ fullName: "Day One" });
    const second = await Lead.findOne({ fullName: "Day Two" });
    expect(first?.trackingId).toBe("26-11-10-1");
    expect(second?.trackingId).toBe("26-11-11-1");
  });

  it("should create a lead with valid data", async () => {
    const leadData = {
      fullName: "Test User",
      whatsappNumber: "+92 300 1234567",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
      source: "test",
      sourcePage: "/test",
      status: "new",
      notes: "",
      activity: [],
    };

    const lead = await Lead.create(leadData);

    expect(lead._id).toBeDefined();
    expect(lead.fullName).toBe("Test User");
    expect(lead.status).toBe("new");
  });

  it("should require mandatory fields", async () => {
    const invalidLead = new Lead({});

    await expect(invalidLead.save()).rejects.toThrow();
  });

  it("should update lead status", async () => {
    const lead = await Lead.create({
      fullName: "Test User",
      whatsappNumber: "+92 300 1234567",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
      source: "test",
      sourcePage: "/test",
      status: "new",
    });

    lead.status = "contacted";
    await lead.save();

    const updated = await Lead.findById(lead._id);
    expect(updated?.status).toBe("contacted");
  });

  it("should store one client document on the lead", async () => {
    const lead = await Lead.create({
      fullName: "Test User",
      whatsappNumber: "+92 300 1234567",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
      source: "test",
      sourcePage: "/test",
      status: "new",
    });

    lead.document = {
      fileName: "packet.pdf",
      storageKey: "local-key",
      provider: "local",
      size: 12,
      uploadedBy: new mongoose.Types.ObjectId(),
      uploadedAt: new Date("2026-11-11T00:00:00.000Z"),
    };
    await lead.save();

    const updated = await Lead.findById(lead._id);
    expect(updated?.document?.fileName).toBe("packet.pdf");
    expect(updated?.document?.provider).toBe("local");
    expect(updated?.document?.size).toBe(12);
  });

  it("should add activity to lead", async () => {
    const lead = await Lead.create({
      fullName: "Test User",
      whatsappNumber: "+92 300 1234567",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
      source: "test",
      sourcePage: "/test",
      status: "new",
      activity: [],
    });

    lead.activity.push({
      action: "Status changed",
      note: "Changed to contacted",
      user: new mongoose.Types.ObjectId(),
      timestamp: new Date(),
    } as any);

    await lead.save();

    const updated = await Lead.findById(lead._id);
    expect(updated?.activity.length).toBe(1);
    expect(updated?.activity[0].action).toBe("Status changed");
  });
});
