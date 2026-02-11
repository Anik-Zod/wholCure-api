import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      trim: true,
    },

    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One review per customer per product
reviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

// Fast admin filtering
reviewSchema.index({ productId: 1, isApproved: 1 });

export default mongoose.model("Review", reviewSchema);
