import { beforeAll, afterEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Fake env values so JWT signing/verifying works in tests without the real .env.
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";

let mongo; // holds the in-memory MongoDB instance

// Runs ONCE before all tests: start a fresh in-memory MongoDB and connect to it.
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

// Runs AFTER EACH test: wipe every collection so tests can't affect each other.
afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Runs ONCE after all tests: disconnect and shut the in-memory DB down.
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});