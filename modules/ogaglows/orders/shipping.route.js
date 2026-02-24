import express from "express";
import { getShippingCost, setShippingCost } from "./shipping.controller.js";

const router = express.Router();

// public read
router.get("/", getShippingCost);

// administrative update (could be protected by auth later)
router.put("/", setShippingCost);

export default router;