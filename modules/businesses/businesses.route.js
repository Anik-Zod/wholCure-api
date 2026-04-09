import express from "express";
import addBusiness, { deleteBusiness, editBusiness, getAllBusiness, getBusinessById } from "./businesses.controller.js";
import upload from "../../middleware/upload.js";
import { isAdminAuthenticated, authorizeRole } from "../../middleware/adminAuth.js";

const businessesRoute = express.Router();

businessesRoute.get("/", getAllBusiness);
businessesRoute.get("/:id", getBusinessById);

// Protected routes (Admin & Super Admin)
businessesRoute.post(
    "/",
    isAdminAuthenticated,
    authorizeRole("superadmin", "admin"),
    upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }, { name: 'images', maxCount: 10 }]),
    addBusiness
);

businessesRoute.put(
    "/:id",
    isAdminAuthenticated,
    authorizeRole("superadmin", "admin"),
    upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }, { name: 'images', maxCount: 10 }]),
    editBusiness
);

businessesRoute.delete(
    "/:id",
    isAdminAuthenticated,
    authorizeRole("superadmin"), // Only Super Admin can delete
    deleteBusiness
);


export default businessesRoute;