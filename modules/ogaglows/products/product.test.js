import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../server.js";
import Product from "./product.model.js";

let mongoServer;

beforeAll(async () => {
    // Disconnect from any existing connection (like the one in server.js if it happened)
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
    await Product.deleteMany({});
});

describe("Product API", () => {
    const sampleProduct = {
        name: "Test Product",
        description: "This is a test product description",
        price: 100,
        offerPrice: 80,
        category: "skin-care",
        images: [{ public_id: "test", url: "http://test.com" }],
        countInStock: 10,
    };

    describe("POST /api/ogaglow/products", () => {
        it("should create a new product", async () => {
            const res = await request(app)
                .post("/api/ogaglow/products")
                .send(sampleProduct);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(sampleProduct.name);
        });

        it("should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/ogaglow/products")
                .send({ name: "Incomplete" });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/ogaglow/products", () => {
        it("should get all products", async () => {
            await Product.create(sampleProduct);

            const res = await request(app).get("/api/ogaglow/products");

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.pagination.total).toBe(1);
        });

        it("should filter products by category", async () => {
            await Product.create(sampleProduct);
            await Product.create({ ...sampleProduct, category: "hair-care", name: "Hair Product" });

            const res = await request(app)
                .get("/api/ogaglow/products")
                .query({ category: "skin-care" });

            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].category).toBe("skin-care");
        });
    });

    describe("PUT /api/ogaglow/products/:id", () => {
        it("should update a product", async () => {
            const product = await Product.create(sampleProduct);
            const updatedData = { ...sampleProduct, name: "Updated Name" };

            const res = await request(app)
                .put(`/api/ogaglow/products/${product._id}`)
                .send(updatedData);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe("Updated Name");
        });
    });

    describe("PUT /api/ogaglow/products/:id/out-of-stock", () => {
        it("should mark product as out of stock", async () => {
            const product = await Product.create(sampleProduct);

            const res = await request(app)
                .put(`/api/ogaglow/products/${product._id}/out-of-stock`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.countInStock).toBe(0);
        });
    });
});
