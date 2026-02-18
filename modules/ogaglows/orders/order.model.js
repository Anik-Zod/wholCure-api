import mongoose from "mongoose";

//
//  Each item inside the order
//
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: String,

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // price at purchase time (important)
    price: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);


//
//  Customer info (guest checkout)
//
const customerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);


//
// Shipping Address
//
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);


//
//  MAIN ORDER SCHEMA
//
const orderSchema = new mongoose.Schema(
  {
    // customer info
    customer: {
      type: customerSchema,
      required: true,
    },

    // products purchased
    orderItems: {
      type: [orderItemSchema],
      required: true,
    },

    // shipping info
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    //
    // 💰 PAYMENT
    //
    paymentMethod: {
      type: String,
      enum: ["COD","ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    //
    // 📦 ORDER STATUS (delivery lifecycle)
    //
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    //
    // 💵 PRICE BREAKDOWN
    //
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    shippingPrice: {
      type: Number,
      default: 0,
    },

    taxPrice: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    //
    // ⏱ ORDER TIMESTAMPS
    //
    paidAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,

    //
    // 📝 OPTIONAL
    //
    notes: String, // customer message
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);


//
// 🚀 Useful Indexes (important for production)
//
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
