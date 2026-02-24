import mongoose from "mongoose";

const shippingCostSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
      default: 250,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// static helper to get or create the single cost document
shippingCostSchema.statics.getCurrent = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({}); // default 250
  }
  return doc.value;
};

// static to update
shippingCostSchema.statics.setCurrent = async function (newValue) {
  if (newValue == null || newValue < 0) {
    throw new Error("Invalid shipping cost");
  }
  const doc = await this.findOneAndUpdate({}, { value: newValue }, { new: true, upsert: true });
  return doc.value;
};

const ShippingCost = mongoose.model("ShippingCost", shippingCostSchema);
export default ShippingCost;