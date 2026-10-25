import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Lead } from "../lib/db";

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

describe("Lead Model", () => {
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
