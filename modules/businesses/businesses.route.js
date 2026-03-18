import express from "express";
import addBusiness, { deleteBusiness, editBusiness, getAllBusiness, getBusinessById } from "./businesses.controller.js";
import upload from "../../middleware/upload.js";

const businessesRoute = express.Router();

businessesRoute.get("/",getAllBusiness)
businessesRoute.get("/:id",getBusinessById)

// NOTE: These endpoints are currently public. Add authentication/authorization middleware to protect create/edit/delete operations.
businessesRoute.post("/", upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }, { name: 'images', maxCount: 10 }]), addBusiness)
businessesRoute.put("/:id", upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }, { name: 'images', maxCount: 10 }]), editBusiness)
businessesRoute.delete("/:id",deleteBusiness)


export default businessesRoute;