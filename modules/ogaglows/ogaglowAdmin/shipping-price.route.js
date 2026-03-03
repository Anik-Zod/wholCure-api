import express from "express";
import { getShippingCost, createOrUpdateShippingCost } from "./shipping-price.controller.js";

const ShippingCostRouter = express.Router();

// Get current shipping cost
ShippingCostRouter.get("/", getShippingCost);

// Create or update shipping cost
ShippingCostRouter.post("/", createOrUpdateShippingCost);

export default ShippingCostRouter;
