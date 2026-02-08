import mongoose from "mongoose";
import { Application } from "./application.model.js";
import { Job } from "../jobs/job.model.js";
import cloudinary from "../../../config/cloudinary.js";

// add application
export default async function addApplication(req, res) {
    const { job_id } = req.params;

    // 1. Immediate Validation
    if (!mongoose.Types.ObjectId.isValid(job_id)) {
        return res.status(400).json({ message: "Invalid Job ID format" });
    }

    const {
        full_name,
        email,
        phone,
        linkedin,
        years_of_experience,
        bio,
        portfolio_url,
    } = req.body;

    // job_id comes from params, others from body
    if (!full_name || !email || !phone) {
        return res.status(400).json({ message: "Name, Email, and Phone are required" });
    }

    // 2. Check File
    if (!req.file) {
        return res.status(400).json({ message: "Resume PDF is required" });
    }

    // 3. Database Check
    const job = await Job.findById(job_id);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }

    // 4. Cloudinary Upload
    let uploadResult;
    try {
        uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "resumes",
                    resource_type: "auto",
                    format: "pdf",
                    access_mode: "public",
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ message: "Failed to upload resume to Cloudinary" });
    }

    // 5. Save to Database
    const response = await Application.create({
        job_id,
        full_name,
        email,
        phone,
        linkedin,
        years_of_experience,
        bio,
        resume_url: uploadResult.secure_url,
        portfolio_url,
    });

    res.status(201).json({
        message: "Application submitted successfully",
        data: response
    });
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
