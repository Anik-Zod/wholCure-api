import mongoose, { Schema } from 'mongoose';

const shippingPriceSchema = new Schema(
  {
    price: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Shipping price cannot be negative'],
    },
  },
  { timestamps: true }
);

const ShippingPriceModel = mongoose.model('ShippingPrice', shippingPriceSchema);

export default ShippingPriceModel;
