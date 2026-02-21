import { calculateCartItems } from "./pricing.service.js";
import { applyCoupon } from "./coupon.service.js";

export const checkoutPreviewService = async (data) => {
  const { orderItems, couponCode, shippingPrice = 0, taxPrice = 0 } = data;

  if (!orderItems || orderItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const { validatedItems, itemsPrice } = await calculateCartItems(orderItems);

  const { discountAmount, couponInfo } =
    await applyCoupon(couponCode, itemsPrice, validatedItems);

  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

  if (totalPrice < 0) {
    throw new Error("Invalid price calculation");
  }

  return {
    items: validatedItems,
    priceBreakdown: {
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      totalPrice,
    },
    coupon: couponInfo,
  };
};