import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Snapshot of customer info at order time
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerCity: { type: String, trim: true },
    customerAddress: { type: String, trim: true },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],

    totalAmount: { type: Number, required: true, min: 0 },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      required: true,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // Optional: store transaction id if online payment
    transactionId: { type: String },
  },
  { timestamps: true }
);

// Index for faster queries
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
