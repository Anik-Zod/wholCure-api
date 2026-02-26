import express from "express";
import { createOrUpdateAboutUs, getAboutUs } from "./about-us.controller.js";
import upload from "../../../middleware/upload.js";

const AboutUsRouter = express.Router();

AboutUsRouter.get("/", getAboutUs);
// accept files for image fields; multer will ignore if no multipart data is sent
AboutUsRouter.post(
  "/",
  upload.fields([
    { name: "firstImage", maxCount: 1 },
    { name: "secondImage", maxCount: 1 },
    { name: "FaqImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  createOrUpdateAboutUs
);

export default AboutUsRouter;  