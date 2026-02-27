import express from "express";
import { createCustomer, getAllCustomers, getMyProfile } from "./customer.controller.js";
import { isAuthenticated } from "../../../middleware/authMiddleware.js";

const customerRouter = express.Router()

customerRouter.get("/", getAllCustomers)
customerRouter.post("/create", createCustomer)
customerRouter.get("/me", isAuthenticated, getMyProfile)

export default customerRouter;