import express from "express";
import { checkoutPreview, getAllOrders, getOrderById, placeOrder, updateOrderStatus, getMyOrders } from "./order.controller.js";
import { isAuthenticated } from "../../../middleware/authMiddleware.js";

const OrderRoute = express.Router();

OrderRoute.post("/checkout/preview", isAuthenticated, checkoutPreview)
OrderRoute.post("/placeOrder", isAuthenticated, placeOrder)
OrderRoute.get("/getAllOrders", isAuthenticated, getAllOrders)
OrderRoute.get("/getOrderById/:id", getOrderById)
OrderRoute.get("/my-orders", isAuthenticated, getMyOrders)
OrderRoute.put("/updateOrderStatus/:id", updateOrderStatus)

export default OrderRoute;