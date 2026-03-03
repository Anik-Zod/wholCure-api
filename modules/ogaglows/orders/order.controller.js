import Order from "./order.model.js";
import { checkoutPreviewService } from "./services/checkout.service.js";
import { placeOrderService } from "./services/order.service.js";

// float rounding helper
const round = (num) => Math.round(num * 100) / 100;


// price calculation 
export const checkoutPreview = async (req, res) => {
  const result = await checkoutPreviewService({ ...req.body });

  res.status(200).json({
    success: true,
    ...result
  })
};

// Place Order — works for both guests and logged-in users
export const placeOrder = async (req, res, next) => {
  // userId comes from session if the user happens to be logged in; guests get null
  const userId = req.user?.id ?? null;
  const result = await placeOrderService({ ...req.body, userId });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    ...result,
  });
};

export const getAllOrders = async (req, res) => {
  const response = await Order.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    orders: response
  });
}
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const response = await Order.findById(id);
  res.status(200).json({
    success: true,
    order: response
  });
}

export const getMyOrders = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: "Login required to view your orders" });
  }
  const response = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    orders: response
  });
}

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;
  const response = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
  res.status(200).json({
    success: true,
    order: response
  });
}