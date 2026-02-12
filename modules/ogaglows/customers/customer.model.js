import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Please enter phone number"],
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "staff", "admin"],
      default: "customer",
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
