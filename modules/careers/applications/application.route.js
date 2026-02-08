import express from "express";
import addApplication, { deleteApplication, getAllApplications, getApplicationById } from "./application.controller.js";
import upload from "../../../middleware/upload.js";

const applicationRoute = express.Router();

applicationRoute.post("/:job_id",upload.single("resume"), addApplication);
applicationRoute.delete("/:id", deleteApplication);
applicationRoute.get("/", getAllApplications);
applicationRoute.get("/:id", getApplicationById);

export default applicationRoute;
