import express from "express";
import { checkoutPreview, getAllOrders, getOrderById, placeOrder, updateOrderStatus, getMyOrders } from "./order.controller.js";
import { isAuthenticated } from "../../../middleware/authMiddleware.js";

const OrderRoute = express.Router();

OrderRoute.post("/checkout/preview", checkoutPreview)
OrderRoute.post("/placeOrder", placeOrder)
OrderRoute.get("/getAllOrders", getAllOrders)
OrderRoute.get("/getOrderById/:id", getOrderById)
OrderRoute.get("/my-orders", getMyOrders)
OrderRoute.put("/updateOrderStatus/:id", updateOrderStatus)

export default OrderRoute;