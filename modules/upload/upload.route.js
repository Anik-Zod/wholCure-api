import express from "express";
import multer from "multer";
import { uploadImage } from "./upload.controller.js";
import { isAuthenticated } from "../../middleware/authMiddleware.js";

const uploadRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post("/", isAuthenticated, upload.single("image"), uploadImage);

export default uploadRouter;
