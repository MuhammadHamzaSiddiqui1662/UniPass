import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { University } from "../lib/db";

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

describe("University CRUD", () => {
  it("should create a university", async () => {
    const universityData = {
      name: "Test University",
      slug: "test-university",
      type: "public",
      city: "Istanbul",
      tuitionFrom: 5000,
      description: "A test university",
      fields: ["Engineering"],
      levels: ["Bachelor's"],
      status: "published",
    };

    const university = await University.create(universityData);

    expect(university._id).toBeDefined();
    expect(university.name).toBe("Test University");
    expect(university.slug).toBe("test-university");
  });

  it("should update a university", async () => {
    const university = await University.create({
      name: "Test University",
      slug: "test-university",
      type: "public",
      city: "Istanbul",
      tuitionFrom: 5000,
      description: "A test university",
      fields: ["Engineering"],
      levels: ["Bachelor's"],
      status: "draft",
    });

    university.status = "published";
    university.description = "Updated description";
    await university.save();

    const updated = await University.findById(university._id);
    expect(updated?.status).toBe("published");
    expect(updated?.description).toBe("Updated description");
  });

  it("should delete a university", async () => {
    const university = await University.create({
      name: "Test University",
      slug: "test-university",
      type: "public",
      city: "Istanbul",
      tuitionFrom: 5000,
      description: "A test university",
      fields: ["Engineering"],
      levels: ["Bachelor's"],
      status: "published",
    });

    await University.findByIdAndDelete(university._id);

    const deleted = await University.findById(university._id);
    expect(deleted).toBeNull();
  });

  it("should find published universities", async () => {
    await University.create({
      name: "Published University",
      slug: "published-uni",
      type: "public",
      city: "Istanbul",
      tuitionFrom: 5000,
      description: "Published",
      fields: ["Engineering"],
      levels: ["Bachelor's"],
      status: "published",
    });

    await University.create({
      name: "Draft University",
      slug: "draft-uni",
      type: "foundation",
      city: "Istanbul",
      tuitionFrom: 5000,
      description: "Draft",
      fields: ["Engineering"],
      levels: ["Bachelor's"],
      status: "draft",
    });

    const published = await University.find({ status: "published" });
    expect(published.length).toBe(1);
    expect(published[0].name).toBe("Published University");
  });
});
