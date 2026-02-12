import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../server.js";
import request from "supertest";
import mongoose from "mongoose";
import Contact from "./contact.model.js";

let mongoServer;

beforeAll(async () => {
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
    await Contact.deleteMany({});
});

describe("Contact-us Api", () => {
    const sampleMessage = {
        name: "anik",
        email: "anikdas169@gmail.com",
        message: "Hi this is demo message from contact_us form"
    };

    describe("POST /api/ogaglow/contact-us/", () => {
        it("Should Save contact-us form", async () => {
            const res = await request(app)
                .post("/api/ogaglow/contact-us/")
                .send(sampleMessage);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(sampleMessage.name);
        });

        it("Should not Save if all fields are not present", async () => {
            const res = await request(app)
                .post("/api/ogaglow/contact-us/")
                .send({ name: "Anik" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/ogaglow/contact-us/", () => {
        it("Should get All messages", async () => {
            await Contact.create(sampleMessage);

            const res = await request(app)
                .get("/api/ogaglow/contact-us/");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
        });
    });

    describe("DELETE /api/ogaglow/contact-us/:id", () => {
        it("Should delete message", async () => {
            const contact = await Contact.create(sampleMessage);

            const res = await request(app)
                .delete(`/api/ogaglow/contact-us/${contact._id}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Message deleted successfully");

            const check = await Contact.findById(contact._id);
            expect(check).toBeNull();
        });

        it("Should return 404 if message does not exist", async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/ogaglow/contact-us/${id}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});