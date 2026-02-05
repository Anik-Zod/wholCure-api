import express from "express";
import addJob, { deleteJob, editJob, getAllJobs, getJobById } from "./job.controller.js";

const jobRoute = express.Router();

jobRoute.get("/", getAllJobs);
jobRoute.get("/:id", getJobById);
jobRoute.post("/", addJob);
jobRoute.put("/:id", editJob);
jobRoute.delete("/:id", deleteJob);

export default jobRoute;
