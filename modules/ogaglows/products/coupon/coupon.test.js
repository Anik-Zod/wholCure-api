import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../../server.js"; // your Express app
import Coupon from "./coupon.model.js";

let mongoServer;

beforeAll(async () => {
  // Disconnect any existing connection
  await mongoose.disconnect();

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Coupon.deleteMany({});
});

describe("Coupon API", () => {
  const sampleCoupon = {
    code: "NEWUSER10",
    discountType: "percentage",
    value: 10,
    minPurchase: 100,
    isActive: true,
    usageLimit: 5
  };

  describe("POST /api/ogaglow/coupons", () => {
    it("should create a new coupon", async () => {
      const res = await request(app)
        .post("/api/ogaglow/coupons")
        .send(sampleCoupon);

      expect(res.statusCode).toBe(201);
      expect(res.body.coupon.code).toBe(sampleCoupon.code);
      expect(res.body.coupon.value).toBe(sampleCoupon.value);
    });

    it("should return 400 if coupon code already exists", async () => {
      await Coupon.create(sampleCoupon);

      const res = await request(app)
        .post("/api/ogaglow/coupons")
        .send(sampleCoupon);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Coupon code already exists");
    });
  });

  describe("GET /api/ogaglow/coupons", () => {
    it("should get all coupons", async () => {
      await Coupon.create(sampleCoupon);
      await Coupon.create({ code: "WELCOME50", discountType: "fixed", value: 50 });

      const res = await request(app).get("/api/ogaglow/coupons");

      expect(res.statusCode).toBe(200);
      expect(res.body.coupons.length).toBe(2);
    });
  });

  describe("GET /api/ogaglow/coupons/:code", () => {
    it("should get a coupon by code", async () => {
      await Coupon.create(sampleCoupon);

      const res = await request(app).get(`/api/ogaglow/coupons/${sampleCoupon.code}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.coupon.code).toBe(sampleCoupon.code);
    });

    it("should return 404 if coupon not found", async () => {
      const res = await request(app).get("/api/ogaglow/coupons/NONEXISTENT");
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Coupon not found or inactive");
    });
  });

  describe("POST /api/ogaglow/coupons/apply", () => {
    it("should apply a valid coupon", async () => {
      await Coupon.create(sampleCoupon);

      const res = await request(app)
        .post("/api/ogaglow/coupons/apply")
        .send({ code: sampleCoupon.code, subtotal: 500 });

      expect(res.statusCode).toBe(200);
      expect(res.body.discountAmount).toBe(50); // 10% of 500
      expect(res.body.totalAfterDiscount).toBe(450);
    });

    it("should fail if coupon expired", async () => {
      const expired = { ...sampleCoupon, code: "EXPIRED", expiresAt: new Date(Date.now() - 1000) };
      await Coupon.create(expired);

      const res = await request(app)
        .post("/api/ogaglow/coupons/apply")
        .send({ code: expired.code, subtotal: 500 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/expired/i);
    });
  });

  describe("PATCH /api/ogaglow/coupons/:id", () => {
    it("should update a coupon", async () => {
      const coupon = await Coupon.create(sampleCoupon);

      const res = await request(app)
        .patch(`/api/ogaglow/coupons/${coupon._id}`)
        .send({ value: 20 });

      expect(res.statusCode).toBe(200);
      expect(res.body.coupon.value).toBe(20);
    });
  });

  describe("DELETE /api/ogaglow/coupons/:id", () => {
    it("should delete a coupon", async () => {
      const coupon = await Coupon.create(sampleCoupon);

      const res = await request(app).delete(`/api/ogaglow/coupons/${coupon._id}`);
      expect(res.statusCode).toBe(200);

      const found = await Coupon.findById(coupon._id);
      expect(found).toBeNull();
    });
  });
});
