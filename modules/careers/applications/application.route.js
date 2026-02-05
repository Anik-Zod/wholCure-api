import express from "express";
import addApplication, { deleteApplication, getAllApplications, getApplicationById } from "./application.controller.js";

const applicationRoute = express.Router();

applicationRoute.post("/", addApplication);
applicationRoute.delete("/:id", deleteApplication);
applicationRoute.get("/", getAllApplications);
applicationRoute.get("/:id", getApplicationById);

export default applicationRoute;
