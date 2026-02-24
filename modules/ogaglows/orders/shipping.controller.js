import { fetchShippingCost, updateShippingCost } from "./shipping.service.js";

export const getShippingCost = async (req, res) => {
  const value = await fetchShippingCost();
  res.status(200).json({ success: true, value });
};

export const setShippingCost = async (req, res) => {
  const { value } = req.body;
  if (typeof value !== 'number') {
    return res.status(400).json({ success: false, message: 'Value must be a number' });
  }

  const newVal = await updateShippingCost(value);
  res.status(200).json({ success: true, value: newVal });
};