import express from "express";

import { createCustomer, getAllCustomers } from "./customer.controller.js";

const customerRouter = express.Router()

customerRouter.get("/",getAllCustomers)
customerRouter.post("/create",createCustomer)

export default customerRouter;