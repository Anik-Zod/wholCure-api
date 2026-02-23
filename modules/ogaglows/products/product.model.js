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

    // Base price (always required)
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
    },
    howToUse: {
      type: String,
      // required: [true, "Please enter instructions on how to use the product"],
      trim: true,
    },
    ingredients: {
      type: String,
      // required: [true, "Please enter ingredients for the product"],
      trim: true,
    },
    benefits: {
      type: String,
      // required: [true, "Please enter benefits of the product"],
      trim: true,
    },

    // ⭐ Structured discount system
    discount: {
      type: {
        type: String,
        enum: ["percentage", "fixed"], // percentage or fixed amount discount
      },
      value: {
        type: Number,
        min: 0,
      },
      startDate: Date,   // optional discount start date
      endDate: Date,     // optional discount end date
      isActive: {
        type: Boolean,
        default: false,
      },
    },

    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

    category: {
      type: String,
      enum: ["skin-care", "hair-care", "body-care"], // add more categories as needed
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

// 🔹 Virtual → Calculate discounted price automatically
productSchema.virtual("finalPrice").get(function () {
  if (!this.discount?.isActive) return this.price;

  const now = new Date();

  if (
    this.discount.startDate &&
    this.discount.endDate &&
    (now < this.discount.startDate || now > this.discount.endDate)
  ) {
    return this.price;
  }

  if (this.discount.type === "percentage") {
    return this.price - (this.price * this.discount.value) / 100;
  }

  if (this.discount.type === "fixed") {
    return Math.max(0, this.price - this.discount.value);
  }

  return this.price;
});

// 🔹 Virtual populate (approved reviews)
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
  match: { isApproved: true },
});

// Index for faster queries
productSchema.index({ category: 1, price: 1 });

// Model
const Product = mongoose.model("Product", productSchema);
export default Product;
