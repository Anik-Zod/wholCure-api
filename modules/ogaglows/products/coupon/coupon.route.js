import express from "express";
import { applyCoupon, createCoupon, deleteCoupon, getAllCoupons, getCouponByCode, updateCoupon } from "./coupon.controller.js";


const CouponRouter = express.Router();

CouponRouter.post("/", createCoupon);
CouponRouter.get("/", getAllCoupons);
CouponRouter.get("/:code", getCouponByCode);
CouponRouter.put("/:id", updateCoupon);
CouponRouter.delete("/:id", deleteCoupon);
CouponRouter.post("/apply", applyCoupon);

export default CouponRouter;
    