import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"], // % off or fixed amount
      required: true
    },

    value: {
      type: Number,
      required: true,
      min: 0
    },

    minPurchase: { // Minimum cart subtotal required
      type: Number,
      default: 0
    },

    expiresAt: { // Expiry date of coupon
      type: Date
    },

    usageLimit: { // Maximum times coupon can be used
      type: Number
    },

    usedCount: { // Times it has been used
      type: Number,
      default: 0
    },

    isActive: { // Enable/disable coupon
      type: Boolean,
      default: true
    },

    applicableCategories: [String], // Optional: apply only to certain product categories
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }] // Optional: apply to specific products
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
