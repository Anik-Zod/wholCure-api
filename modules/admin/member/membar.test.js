import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../server.js";
import Member from "./membar.mode.js";

let mongoServer;
let cloudinaryMock;

// Mock Cloudinary before importing
jest.mock("../../../config/cloudinary.js", () => {
    const mockUploadStream = jest.fn();
    return {
        default: {
            uploader: {
                upload_stream: mockUploadStream
            }
        },
        uploader: {
            upload_stream: mockUploadStream
        }
    };
});

beforeAll(async () => {
    // Import cloudinary after mocking
    cloudinaryMock = (await import("../../../config/cloudinary.js")).default;

    // Setup the mock implementation
    cloudinaryMock.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, {
            secure_url: "https://res.cloudinary.com/test/image/upload/v1234567890/wholcare/members/test.jpg",
            public_id: "wholcare/members/test"
        });
        return {
            end: jest.fn()
        };
    });

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
    await Member.deleteMany({});
    jest.clearAllMocks();
});

describe("Member API", () => {
    const sampleMember = {
        name: "John Doe",
        role: "Developer",
        email: "john@example.com",
        phone: "1234567890",
        address: "123 Main St, City",
        description: "A talented developer with 5 years of experience",
        socialMedia: JSON.stringify([
            { name: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
            { name: "GitHub", url: "https://github.com/johndoe" }
        ])
    };

    // Create a test image buffer
    const createTestImageBuffer = () => {
        // Create a minimal valid PNG buffer
        return Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
        ]);
    };

    describe("POST /api/members", () => {
        it("should create a new member with all fields", async () => {
            const res = await request(app)
                .post("/api/members")
                .field("name", sampleMember.name)
                .field("role", sampleMember.role)
                .field("email", sampleMember.email)
                .field("phone", sampleMember.phone)
                .field("address", sampleMember.address)
                .field("description", sampleMember.description)
                .field("socialMedia", sampleMember.socialMedia)
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Member created successfully");
            expect(res.body.data.name).toBe(sampleMember.name);
            expect(res.body.data.role).toBe(sampleMember.role);
            expect(res.body.data.email).toBe(sampleMember.email);
            expect(res.body.data.photo).toContain("cloudinary.com");
            expect(res.body.data.socialMedia).toHaveLength(2);
            expect(res.body.data.socialMedia[0].name).toBe("LinkedIn");
        });

        it("should create a member with minimal required fields", async () => {
            const res = await request(app)
                .post("/api/members")
                .field("name", "Jane Doe")
                .field("role", "Designer")
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe("Jane Doe");
            expect(res.body.data.role).toBe("Designer");
        });

        it("should return 400 if name is missing", async () => {
            const res = await request(app)
                .post("/api/members")
                .field("role", "Developer")
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("Name and role are required");
        });

        it("should return 400 if role is missing", async () => {
            const res = await request(app)
                .post("/api/members")
                .field("name", "John Doe")
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("Name and role are required");
        });

        it("should return 400 if photo is missing", async () => {
            const res = await request(app)
                .post("/api/members")
                .field("name", "John Doe")
                .field("role", "Developer");

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("Image is required");
        });

        it("should handle empty socialMedia array", async () => {
            const res = await request(app)
                .post("/api/members")
                .field("name", "John Doe")
                .field("role", "Developer")
                .field("socialMedia", JSON.stringify([]))
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(201);
            expect(res.body.data.socialMedia).toEqual([]);
        });

        it("should handle invalid JSON in socialMedia gracefully", async () => {
            const res = await request(app)
                .post("/api/members")
                .field("name", "John Doe")
                .field("role", "Developer")
                .field("socialMedia", "invalid-json")
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(201);
            expect(res.body.data.socialMedia).toEqual([]);
        });

        it("should handle Cloudinary upload error", async () => {
            // Mock Cloudinary error
            cloudinaryMock.uploader.upload_stream.mockImplementationOnce((options, callback) => {
                callback(new Error("Cloudinary upload failed"), null);
                return { end: jest.fn() };
            });

            const res = await request(app)
                .post("/api/members")
                .field("name", "John Doe")
                .field("role", "Developer")
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("Failed to create member");
            expect(res.body.details).toContain("Cloudinary upload failed");
        });
    });

    describe("GET /api/members", () => {
        it("should get all members", async () => {
            await Member.create({
                name: "John Doe",
                role: "Developer",
                photo: "https://example.com/photo1.jpg",
                email: "john@example.com"
            });
            await Member.create({
                name: "Jane Smith",
                role: "Designer",
                photo: "https://example.com/photo2.jpg",
                email: "jane@example.com"
            });

            const res = await request(app).get("/api/members");

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].name).toBe("John Doe");
            expect(res.body[1].name).toBe("Jane Smith");
        });

        it("should return empty array if no members exist", async () => {
            const res = await request(app).get("/api/members");

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });

        it("should handle database errors gracefully", async () => {
            // Mock database error
            jest.spyOn(Member, "find").mockRejectedValueOnce(new Error("Database error"));

            const res = await request(app).get("/api/members");

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("Failed to fetch members");
        });
    });

    describe("GET /api/members/:id", () => {
        it("should get a single member by id", async () => {
            const member = await Member.create({
                name: "John Doe",
                role: "Developer",
                photo: "https://example.com/photo.jpg",
                email: "john@example.com",
                phone: "1234567890",
                socialMedia: [
                    { name: "LinkedIn", url: "https://linkedin.com/in/johndoe" }
                ]
            });

            const res = await request(app).get(`/api/members/${member._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe("John Doe");
            expect(res.body.role).toBe("Developer");
            expect(res.body._id.toString()).toBe(member._id.toString());
            expect(res.body.socialMedia).toHaveLength(1);
        });

        it("should return null if member not found", async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/members/${id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toBeNull();
        });

        it("should handle invalid ObjectId", async () => {
            const res = await request(app).get("/api/members/invalid-id");

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("Failed to fetch member");
        });
    });

    describe("PUT /api/members/:id", () => {
        it("should update a member with new photo", async () => {
            const member = await Member.create({
                name: "John Doe",
                role: "Developer",
                photo: "https://example.com/old-photo.jpg",
                email: "john@example.com"
            });

            const res = await request(app)
                .put(`/api/members/${member._id}`)
                .field("name", "John Updated")
                .field("role", "Senior Developer")
                .field("email", "john.updated@example.com")
                .attach("photo", createTestImageBuffer(), "new-photo.png");

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Member updated successfully");
            expect(res.body.data.name).toBe("John Updated");
            expect(res.body.data.role).toBe("Senior Developer");
            expect(res.body.data.photo).toContain("cloudinary.com");
        });

        it("should update a member without changing photo", async () => {
            const member = await Member.create({
                name: "John Doe",
                role: "Developer",
                photo: "https://example.com/photo.jpg",
                email: "john@example.com"
            });

            const res = await request(app)
                .put(`/api/members/${member._id}`)
                .send({
                    name: "John Updated",
                    role: "Senior Developer",
                    email: "john.updated@example.com"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe("John Updated");
            expect(res.body.data.photo).toBe("https://example.com/photo.jpg");
        });

        it("should update socialMedia field", async () => {
            const member = await Member.create({
                name: "John Doe",
                role: "Developer",
                photo: "https://example.com/photo.jpg",
                socialMedia: []
            });

            const newSocialMedia = JSON.stringify([
                { name: "Twitter", url: "https://twitter.com/johndoe" }
            ]);

            const res = await request(app)
                .put(`/api/members/${member._id}`)
                .field("name", "John Doe")
                .field("role", "Developer")
                .field("socialMedia", newSocialMedia);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.socialMedia).toHaveLength(1);
            expect(res.body.data.socialMedia[0].name).toBe("Twitter");
        });

        it("should return 404 if member not found", async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/members/${id}`)
                .send({ name: "Updated Name", role: "Updated Role" });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("Member not found");
        });

        it("should handle Cloudinary upload error during update", async () => {
            const member = await Member.create({
                name: "John Doe",
                role: "Developer",
                photo: "https://example.com/photo.jpg"
            });

            cloudinaryMock.uploader.upload_stream.mockImplementationOnce((options, callback) => {
                callback(new Error("Upload failed"), null);
                return { end: jest.fn() };
            });

            const res = await request(app)
                .put(`/api/members/${member._id}`)
                .field("name", "John Updated")
                .attach("photo", createTestImageBuffer(), "new-photo.png");

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("Failed to update member");
        });
    });

    describe("DELETE /api/members/:id", () => {
        it("should delete a member", async () => {
            const member = await Member.create({
                name: "John Doe",
                role: "Developer",
                photo: "https://example.com/photo.jpg"
            });

            const res = await request(app).delete(`/api/members/${member._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Member deleted successfully");
            expect(res.body.data.name).toBe("John Doe");

            // Verify member is actually deleted
            const deletedMember = await Member.findById(member._id);
            expect(deletedMember).toBeNull();
        });

        it("should return 404 if member not found", async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app).delete(`/api/members/${id}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("Member not found");
        });

        it("should handle database errors", async () => {
            const member = await Member.create({
                name: "John Doe",
                role: "Developer",
                photo: "https://example.com/photo.jpg"
            });

            jest.spyOn(Member, "findByIdAndDelete").mockRejectedValueOnce(new Error("Database error"));

            const res = await request(app).delete(`/api/members/${member._id}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("Failed to delete member");
        });
    });

    describe("Edge Cases and Data Validation", () => {
        it("should handle very long text fields", async () => {
            const longDescription = "A".repeat(1000);

            const res = await request(app)
                .post("/api/members")
                .field("name", "John Doe")
                .field("role", "Developer")
                .field("description", longDescription)
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(201);
            expect(res.body.data.description).toBe(longDescription);
        });

        it("should handle special characters in fields", async () => {
            const res = await request(app)
                .post("/api/members")
                .field("name", "Jöhn Döe <script>alert('xss')</script>")
                .field("role", "Developer & Designer")
                .field("email", "john+test@example.com")
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(201);
            expect(res.body.data.name).toContain("Jöhn Döe");
        });

        it("should handle multiple social media links", async () => {
            const multipleSocialMedia = JSON.stringify([
                { name: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
                { name: "GitHub", url: "https://github.com/johndoe" },
                { name: "Twitter", url: "https://twitter.com/johndoe" },
                { name: "Portfolio", url: "https://johndoe.com" }
            ]);

            const res = await request(app)
                .post("/api/members")
                .field("name", "John Doe")
                .field("role", "Developer")
                .field("socialMedia", multipleSocialMedia)
                .attach("photo", createTestImageBuffer(), "test.png");

            expect(res.statusCode).toBe(201);
            expect(res.body.data.socialMedia).toHaveLength(4);
        });
    });
});
