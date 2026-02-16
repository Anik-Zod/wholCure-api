import express from "express";
import { adminDeleteReview, createGuestReview, getReviewsByProduct } from "./review.controller.js";
const ReviewRouter = express.Router();

ReviewRouter.post("/create", createGuestReview);
ReviewRouter.delete("/delete/:id", adminDeleteReview);
ReviewRouter.get("/product/:productId", getReviewsByProduct);

export default ReviewRouter