import Coupon from "./coupon.model.js";


// CREATE NEW COUPON
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, value, minPurchase, expiresAt, usageLimit, applicableCategories, applicableProducts } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }
    // Check if coupon code already exists
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      value,
      minPurchase,
      expiresAt,
      usageLimit,
      applicableCategories,
      applicableProducts,
    });

    return res.status(201).json({ message: "Coupon created", coupon });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// GET ALL COUPONS
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    return res.status(200).json({ coupons });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// GET SINGLE COUPON BY CODE
export const getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found or inactive" });
    }

    // Optional: check expiration
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    return res.status(200).json({ coupon });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// UPDATE COUPON
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      updates.code = updates.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    return res.status(200).json({ message: "Coupon updated", coupon });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// DELETE COUPON
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    return res.status(200).json({ message: "Coupon deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// APPLY COUPON TO ORDER
export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body; // subtotal = sum of finalPrice*quantity for products

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }
    if (subtotal === undefined || subtotal === null) return res.status(400).json({ message: "Subtotal is required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ message: "Coupon expired" });
    if (coupon.minPurchase && subtotal < coupon.minPurchase) return res.status(400).json({ message: `Minimum purchase ${coupon.minPurchase} required` });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: "Coupon usage limit reached" });

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.value) / 100;
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.value;
    }

    return res.status(200).json({
      couponCode: coupon.code,
      discountAmount,
      subtotal,
      totalAfterDiscount: Math.max(0, subtotal - discountAmount),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
