import mongoose from "mongoose";
import { Application } from "./application.model.js";
import { Job } from "../jobs/job.model.js";

// add application
export default async function addApplication(req, res) {
    const {
        job_id,
        full_name,
        email,
        phone,
        linkedin,
        years_of_experience,
        bio,
        resume_url,
        portfolio_url,
        status
    } = req.body || {};

    if (!job_id || !full_name || !email || !phone) {
        return res.status(400).json({ message: "Job ID, Name, Email, and Phone are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(job_id)) {
        return res.status(400).json({ message: "Invalid Job ID" });
    }

    // Check if job exists
    const job = await Job.findById(job_id);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }

    const response = await Application.create({
        job_id,
        full_name,
        email,
        phone,
        linkedin,
        years_of_experience,
        bio,
        resume_url,
        portfolio_url,
        status
    });

    res.status(201).json({ message: "Application submitted successfully", data: response });
}

// delete application
export async function deleteApplication(req, res) {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Application ID" });
    }

    const response = await Application.findByIdAndDelete(id);

    if (!response) {
        return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application deleted successfully" });
}

// get all applications
export async function getAllApplications(req, res) {
    const response = await Application.find({}).populate('job_id', 'job_title');
    res.status(200).json({ data: response });
}

// get application by id
export async function getApplicationById(req, res) {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Application ID" });
    }

    const response = await Application.findById(id).populate('job_id', 'job_title');

    if (!response) {
        return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ data: response });
}
