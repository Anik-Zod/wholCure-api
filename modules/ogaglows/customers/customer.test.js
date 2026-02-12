import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../../server.js";
import Customer from "./customer.model.js";

let mongoServer;

beforeAll(async () => {
    // Disconnect from any existing connection
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
    await Customer.deleteMany({});
});

describe("Customer API", () => {
    const sampleBody = {
        name: "Anik",
        email: "anikdas@gmail.com",
        phone: "01996259365",
        city: "chittagong",
        address: "bazalia satkania"
    };

    describe("POST /api/ogaglow/customers/create", () => {
        it("Should save customer if all fields are present", async () => {
            const res = await request(app)
                .post("/api/ogaglow/customers/create")
                .send(sampleBody);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(sampleBody.name);
        });

        it("Should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/ogaglow/customers/create")
                .send({ name: "Anik" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/ogaglow/customers/", () => {
        it("Should return All customer list", async () => {
            // Seed a customer first
            await Customer.create(sampleBody);

            const res = await request(app)
                .get("/api/ogaglow/customers/");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
        });
    });
});