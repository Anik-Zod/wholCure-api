import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const ShippingCost = (await import('./shipping.model.js')).default;
const { fetchShippingCost, updateShippingCost } = await import('./shipping.service.js');

let mongoServer;

beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await ShippingCost.deleteMany({});
});

describe('shipping cost model/service', () => {
  it('returns default 250 when no document exists', async () => {
    const cost = await fetchShippingCost();
    expect(cost).toBe(250);

    // underlying document should also be created
    const docs = await ShippingCost.find();
    expect(docs).toHaveLength(1);
    expect(docs[0].value).toBe(250);
  });

  it('allows updating the value and returns new value', async () => {
    await updateShippingCost(300);
    const cost = await fetchShippingCost();
    expect(cost).toBe(300);

    // document should reflect new value
    const doc = await ShippingCost.findOne();
    expect(doc.value).toBe(300);
  });

  it('rejects invalid values', async () => {
    await expect(updateShippingCost(-5)).rejects.toThrow();
    await expect(updateShippingCost(null)).rejects.toThrow();
  });
});