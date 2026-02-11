import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Please enter product description"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
    },

    offerPrice: {
      type: Number,
      min: [0, "Offer price cannot be negative"],
    },

    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

    category: {
      type: String,
      enum: ["skin-care", "hair-care"],
      required: [true, "Please select a category"],
    },

    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔹 Virtual populate (BEFORE model)
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
  match: { isApproved: true },
});

// Index
productSchema.index({ category: 1, price: 1 });

// Model (LAST)
const Product = mongoose.model("Product", productSchema);
export default Product;
