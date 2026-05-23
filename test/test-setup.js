import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

/**       
 * Initialize in-memory MongoDB server for testing
 * Call this in beforeAll hook
 */
export const setupTestDB = async () => {
  await mongoose.disconnect(); // ensure no zombie connections
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

/**  
 * Cleanup MongoDB connection and server
 * Call this in afterAll hook
 */
export const teardownTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
};

/**
 * Clear all data from a collection
 * Call this in beforeEach or afterEach hook
 * @param {Model} model - Mongoose model to clear
 */
export const clearCollection = async (model) => {
  await model.deleteMany({});
};

/**
 * Clear multiple collections
 * Call this in beforeEach or afterEach hook
 * @param {Array<Model>} models - Array of Mongoose models to clear
 */
export const clearCollections = async (models) => {
  await Promise.all(models.map(model => model.deleteMany({})));
};
/**
 * Convenience function to register Jest lifecycle hooks for tests.
 *
 * Usage in a test file:
 *   import { applyTestDBHooks } from "../test/test-setup";
 *   applyTestDBHooks([ModelA, ModelB]);
 *
 * The provided array of models will be cleared before each test.  If you
 * don't need any models cleared you can call with an empty array or omit
 * the argument entirely.
 *
 * @param {Array<Model>} models
 */
export const applyTestDBHooks = (models = []) => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    if (models.length) {
      await clearCollections(models);
    }
  });
};
