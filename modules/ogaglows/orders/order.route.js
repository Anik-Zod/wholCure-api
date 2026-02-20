import express from "express";
import { checkoutPreview, getAllOrders, getOrderById, placeOrder, updateOrderStatus } from "./order.controller.js";

const OrderRoute = express.Router();

OrderRoute.post("/checkout/preview",checkoutPreview)
OrderRoute.post("/placeOrder",placeOrder)
OrderRoute.get("/getAllOrders",getAllOrders)
OrderRoute.get("/getOrderById/:id",getOrderById)
OrderRoute.put("/updateOrderStatus/:id",updateOrderStatus)

export default OrderRoute;