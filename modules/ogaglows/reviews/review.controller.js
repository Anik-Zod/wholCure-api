import Review from "./review.model.js";
import Product  from "../products/product.model.js";
import mongoose from "mongoose";

export const createGuestReview = async (req, res) => {
  const { productId, customerName, customerEmail, rating, comment } = req.body;

  // 1. Basic Validation
  if (!customerEmail || !rating) {
    return res.status(400).json({ message: "Email and Rating are required." });
  }

  // 2. Create the review
  // Note: Your schema unique index { productId, customerEmail } handles duplicates
  const newReview = await Review.create({
    productId,
    customerName,
    customerEmail,
    rating,
    comment,
    isApproved: false // Default to false for guest moderation
  });

  res.status(201).json({ 
    success: true, 
    message: "Review submitted for moderation", 
    review: newReview 
  });
};

export const adminDeleteReview = async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  res.status(200).json({ 
    success: true, 
    message: "Review removed by admin" 
  });
};


export const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  // Convert string ID to MongoDB ObjectId to ensure a perfect match
  const objectId = new mongoose.Types.ObjectId(productId);

  // For debugging: We remove the 'isApproved: true' filter 
  // so you can see your reviews even if they aren't approved yet.
  const reviews = await Review.find({ productId: objectId })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
};