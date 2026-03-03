import mongoose, { Schema } from 'mongoose';

const hotDealSchema = new Schema(
  {
    frequency: { type: String, required: true },
    product: { type: Number, required: true },
    discount: { type: Number, required: true },
    customer: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

const HotDealModel = mongoose.models.HotDeal || mongoose.model('HotDeal', hotDealSchema);
export default HotDealModel;