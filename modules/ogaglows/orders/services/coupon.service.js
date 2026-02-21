import { round } from "../../../../lib/round.js";
import Coupon from "../../products/coupon/coupon.model.js"


export const applyCoupon = async (couponCode, itemsPrice, validatedItems) => {
  if (!couponCode) {
    return { discountAmount: 0, couponInfo: null };
  }

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Invalid coupon");
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error("Coupon expired");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  if (coupon.minPurchase && itemsPrice < coupon.minPurchase) {
    throw new Error(`Minimum purchase ${coupon.minPurchase} required`);
  }

  if (coupon.applicableProducts?.length) {
    const valid = validatedItems.some((item) =>
      coupon.applicableProducts.some((id) => id.equals(item.product)),
    );

    if (!valid) {
      throw new Error("Coupon not applicable to selected products");
    }
  }

  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = round((itemsPrice * coupon.value) / 100);
  } else {
    discountAmount = coupon.value;
  }

  discountAmount = Math.min(discountAmount, itemsPrice);

  return {
    discountAmount,
    couponInfo: coupon,
    coupon,
  };
};
