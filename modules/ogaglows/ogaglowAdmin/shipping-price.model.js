import mongoose, { Schema } from 'mongoose';

const shippingCostSchema = new Schema(
  {
    value: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Shipping cost cannot be negative'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'shippingcosts' }
);

// create virtual `id` field mapped to _id
shippingCostSchema.virtual('id').get(function () {
  return this._id.toString();
});
shippingCostSchema.set('toJSON', { virtuals: true });
shippingCostSchema.set('toObject', { virtuals: true });

const ShippingCostModel = mongoose.models.ShippingCost || mongoose.model('ShippingCost', shippingCostSchema);

export default ShippingCostModel;
