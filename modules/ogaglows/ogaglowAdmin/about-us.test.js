import app from "../../../server.js";
import request from "supertest";
import aboutUsModel from "./about-us.model.js";
import { applyTestDBHooks } from "../../../test/test-setup.js";

// register global hooks and clear the aboutUs collection before each test
applyTestDBHooks([aboutUsModel]);

describe("/api/ogaglow/about-us", () => {
  const sampleAboutUsInput = {
    firstImage: "http://cloudinary.com/test.jpg",
    secondImage: "http://cloudinary.com/test2.jpg",
    FaqImage: "http://cloudinary.com/test3.jpg",
    FAQ: [
      { question: "What is OgaGlow?", answer: "..." },
      { question: "Where are OgaGlow products made?", answer: "..." },
      // …
    ],
    banner: {
      image: "http://cloudinary.com/test4.jpg",
      paragraph: "Discover the science …",
      card1: "Hydration",
      card2: "Rejuvenation",
      card3: "Protection",
      leftButton: "Shop Now",
      rightButton: "Learn More",
    },
  };

  it("creates an about‑us document when all fields are provided", async () => {
    const res = await request(app)
      .post("/api/ogaglow/about-us")
      .send(sampleAboutUsInput);

    expect(res.statusCode).toBe(201);
    expect(res.body.firstImage).toBe(sampleAboutUsInput.firstImage);
    // you can add more assertions on other fields if desired
  });

  it("creates an about‑us document when only a subset of fields are provided", async () => {
    const partial = { firstImage: "http://cloudinary.com/test.jpg" };
    const res = await request(app)
      .post("/api/ogaglow/about-us")
      .send(partial);

    expect(res.statusCode).toBe(201);
    expect(res.body.firstImage).toBe(partial.firstImage);
    // ensure missing fields are handled appropriately (e.g. undefined, defaults, etc.)
  });

  it("updates an existing about‑us document on subsequent POST", async () => {
    // first create
    const createRes = await request(app)
      .post("/api/ogaglow/about-us")
      .send(sampleAboutUsInput);

    expect(createRes.statusCode).toBe(201);

    const updated = { firstImage: "http://cloudinary.com/updated.jpg" };

    const updateRes = await request(app)
      .post("/api/ogaglow/about-us")
      .send(updated);

    // second POST should update existing document (returns 200, not 201)
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.firstImage).toBe(updated.firstImage);
  });
});