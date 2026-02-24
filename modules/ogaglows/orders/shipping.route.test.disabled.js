import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const { default: app } = await import("../../../server.js");
const request = (await import("supertest")).default;
const ShippingCost = (await import('./shipping.model.js')).default;

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

describe('shipping route', () => {
  it('GET /api/ogaglow/shipping returns default 250', async () => {
    const res = await request(app).get('/api/ogaglow/shipping');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.value).toBe(250);
  });

  it('PUT /api/ogaglow/shipping updates value', async () => {
    const res1 = await request(app).put('/api/ogaglow/shipping').send({ value: 400 });
    expect(res1.statusCode).toBe(200);
    expect(res1.body.value).toBe(400);

    const res2 = await request(app).get('/api/ogaglow/shipping');
    expect(res2.body.value).toBe(400);
  });

  it('PUT rejects invalid payload', async () => {
    const res = await request(app).put('/api/ogaglow/shipping').send({ value: 'abc' });
    expect(res.statusCode).toBe(400);
  });
});