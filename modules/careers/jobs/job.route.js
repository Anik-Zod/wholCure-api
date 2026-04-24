import express from "express";
import addJob, { deleteJob, editJob, getAllJobs, getJobById } from "./job.controller.js";
import { isAdminAuthenticated, authorizeRole } from "../../../middleware/adminAuth.js";

const jobRoute = express.Router();

jobRoute.get("/", getAllJobs);
jobRoute.get("/:id", getJobById);

// Protected routes
jobRoute.post("/", isAdminAuthenticated, authorizeRole("superadmin", "admin"), addJob);
jobRoute.put("/:id",
    //  isAdminAuthenticated, authorizeRole("superadmin", "admin"),
     
     editJob);
jobRoute.delete("/:id", isAdminAuthenticated, authorizeRole("superadmin"), deleteJob);

export default jobRoute;
