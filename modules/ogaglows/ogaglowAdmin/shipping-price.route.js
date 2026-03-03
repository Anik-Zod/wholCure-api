import express from "express";
import { getShippingPrice, createOrUpdateShippingPrice } from "./shipping-price.controller.js";

const ShippingPriceRouter = express.Router();

// Get current shipping price
ShippingPriceRouter.get("/", getShippingPrice);

// Create or update shipping price
ShippingPriceRouter.post("/", createOrUpdateShippingPrice);

export default ShippingPriceRouter;
