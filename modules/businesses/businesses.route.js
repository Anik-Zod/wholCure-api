import express from "express";
import addBusiness, { 
    deleteBusiness, 
    editBusiness, 
    getAllBusiness, 
    getBusinessById,
    addService,
    editService,
    deleteService
} from "./businesses.controller.js";
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

// Service Management Routes
businessesRoute.post(
    "/:id/services",
    isAdminAuthenticated,
    authorizeRole("superadmin", "admin"),
    addService
);

businessesRoute.put(
    "/:id/services/:serviceId",
    isAdminAuthenticated,
    authorizeRole("superadmin", "admin"),
    editService
);

businessesRoute.delete(
    "/:id/services/:serviceId",
    isAdminAuthenticated,
    authorizeRole("superadmin", "admin"),
    deleteService
);

businessesRoute.delete(
    "/:id",
    isAdminAuthenticated,
    authorizeRole("superadmin"), // Only Super Admin can delete
    deleteBusiness
);

export default businessesRoute;