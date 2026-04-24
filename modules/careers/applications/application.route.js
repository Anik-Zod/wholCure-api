import express from "express";
import addApplication, { deleteApplication, getAllApplications, getApplicationById } from "./application.controller.js";
import upload from "../../../middleware/upload.js";
import { isAdminAuthenticated, authorizeRole } from "../../../middleware/adminAuth.js";

const applicationRoute = express.Router();

// Public: Submit an application
applicationRoute.post("/:job_id", upload.single("resume"), addApplication);

// Protected: Management
applicationRoute.get("/", getAllApplications);
applicationRoute.get("/:id", isAdminAuthenticated, authorizeRole("superadmin", "admin"), getApplicationById);
applicationRoute.delete("/:id", isAdminAuthenticated, authorizeRole("superadmin"), deleteApplication);

export default applicationRoute;
