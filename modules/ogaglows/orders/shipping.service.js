import ShippingCost from "./shipping.model.js";

export const fetchShippingCost = async () => {
  // returns numeric value (default 250 if none exists)
  return await ShippingCost.getCurrent();
};

export const updateShippingCost = async (value) => {
  return await ShippingCost.setCurrent(value);
};