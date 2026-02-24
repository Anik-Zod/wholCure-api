import { calculateCartItems } from "./pricing.service.js";
import { applyCoupon } from "./coupon.service.js";
import { fetchShippingCost } from "../shipping.service.js";

export const checkoutPreviewService = async (data) => {
  let { orderItems, couponCode, shippingPrice, taxPrice = 0 } = data;

  // if shippingPrice not explicitly passed, use global default
  if (shippingPrice == null) {
    shippingPrice = await fetchShippingCost();
  }

  if (!orderItems || orderItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const { validatedItems, itemsPrice, totalDiscount } = await calculateCartItems(orderItems);

  const { discountAmount, couponInfo } =
    await applyCoupon(couponCode, itemsPrice, validatedItems);

  const totalPrice = itemsPrice + (shippingPrice ?? 0) + taxPrice - discountAmount;

  if (totalPrice < 0) {
    throw new Error("Invalid price calculation");
  }

  return {
    items: validatedItems,
    priceBreakdown: {
      itemsPrice,
      productDiscount: totalDiscount,
      shippingPrice,
      taxPrice,
      discountAmount,
      totalPrice,
    },
    coupon: couponInfo,
  };
};