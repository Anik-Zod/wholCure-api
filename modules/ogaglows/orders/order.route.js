import express from "express";
import { checkoutPreview, placeOrder } from "./order.controller.js";

const OrderRoute = express.Router();

OrderRoute.post("/checkout/preview",checkoutPreview)
OrderRoute.post("/placeOrder",placeOrder)

export default OrderRoute;