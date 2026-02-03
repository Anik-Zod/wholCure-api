import express from "express";
import addBusiness, { deleteBusiness, editBusiness, getAllBusiness, getBusinessById } from "./businesses.controller.js";

const businessesRoute = express.Router();

businessesRoute.get("/",getAllBusiness)
businessesRoute.get("/:id",getBusinessById)

// NOTE: These endpoints are currently public. Add authentication/authorization middleware to protect create/edit/delete operations.
businessesRoute.post("/",addBusiness)
businessesRoute.put("/:id",editBusiness)
businessesRoute.delete("/:id",deleteBusiness)


export default businessesRoute;