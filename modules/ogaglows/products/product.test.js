import { jest } from '@jest/globals';
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// ESM Dynamic Imports
const { default: app } = await import("../../../server.js");
const { default: Product } = await import("./product.model.js");
const { default: request } = await import("supertest");

let mongoServer;

beforeAll(async () => {
  await mongoose.disconnect(); // Ensure no zombie connections
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe("Product API", () => {
  const sampleProductInput = {
    name: "OgaGlow Serum",
    description: "Premium skin hydration",
    price: 100,
    discountValue: 20,
    discountType: "percentage",
    category: "skin-care",
    images: [{ public_id: "test_id", url: "http://cloudinary.com/test.jpg" }],
    countInStock: 15,
  };

  describe("POST /api/ogaglow/products", () => {
    it("should create a product and verify virtual finalPrice", async () => {
      const res = await request(app)
        .post("/api/ogaglow/products")
        .send(sampleProductInput);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      // Calculation: 100 - (20% of 100) = 80
      expect(res.body.data.finalPrice).toBe(80);
      expect(res.body.data.discount.isActive).toBe(true);
    });

    it("should fail (400) if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/ogaglow/products")
        .send({ name: "Missing Price" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/ogaglow/products", () => {
    it("should fetch all products with pagination data", async () => {
      // Manually seeding data (matching Schema structure)
      await Product.create({
        ...sampleProductInput,
        discount: { value: 20, type: "percentage", isActive: true }
      });

      const res = await request(app).get("/api/ogaglow/products");

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.data[0].finalPrice).toBe(80);
    });

    it("should filter products by keyword", async () => {
      await Product.create({ ...sampleProductInput, name: "Alpha" });
      await Product.create({ ...sampleProductInput, name: "Beta" });

      const res = await request(app)
        .get("/api/ogaglow/products")
        .query({ keyword: "Alpha" });

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Alpha");
    });
  });

  describe("PUT /api/ogaglow/products/:id", () => {
    it("should update flat fields and recalculate nested discount virtuals", async () => {
      const product = await Product.create({
        ...sampleProductInput,
        discount: { value: 20, type: "percentage", isActive: true }
      });

      const updateData = {
        price: 200,
        discountValue: 50,
        discountType: "fixed"
      };

      const res = await request(app)
        .put(`/api/ogaglow/products/${product._id}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      // New calculation: 200 - 50 = 150
      expect(res.body.data.finalPrice).toBe(150);
      expect(res.body.data.discount.type).toBe("fixed");
    });

    it("should revert to base price when discountIsActive is false", async () => {
      const product = await Product.create({
        ...sampleProductInput,
        discount: { value: 20, type: "percentage", isActive: true }
      });

      const res = await request(app)
        .put(`/api/ogaglow/products/${product._id}`)
        .send({ discountIsActive: false });

      expect(res.body.data.finalPrice).toBe(100);
      expect(res.body.data.discount.isActive).toBe(false);
    });
  });

  describe("PUT /api/ogaglow/products/:id/out-of-stock", () => {
    it("should mark product as out of stock successfully", async () => {
      const product = await Product.create(sampleProductInput);

      const res = await request(app)
        .put(`/api/ogaglow/products/${product._id}/out-of-stock`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.countInStock).toBe(0);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/ogaglow/products/${fakeId}/out-of-stock`);

      expect(res.statusCode).toBe(404);
    });
  });
});