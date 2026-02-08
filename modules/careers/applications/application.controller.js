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

    // Check required fields
    if (!full_name || !email || !phone) {
        return res.status(400).json({ message: "Name, Email, and Phone are required" });
    }

    // 2. Check File
    if (!req.file) {
        return res.status(400).json({ message: "Resume PDF is required" });
    }

    try {
        // 3. Database Check (Ensure job exists before uploading to Cloudinary)
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
                        resource_type: "auto", // Detects PDF automatically
                        format: "pdf",         // Ensures the file is treated as a PDF
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return res.status(500).json({ message: "Failed to upload resume to Cloudinary" });
        }

        // 5. Save to Database
        try {
            const response = await Application.create({
                job_id,
                full_name,
                email,
                phone,
                linkedin,
                years_of_experience,
                bio,
                resume_url: uploadResult.secure_url, // Using secure_url for HTTPS
                portfolio_url,
            });

            return res.status(201).json({
                message: "Application submitted successfully",
                data: response
            });
        } catch (dbError) {
            // Rollback: Delete file from Cloudinary if DB save fails
            await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'raw' });
            
            console.error("Database save error:", dbError);
            return res.status(500).json({ message: "Failed to save application to database" });
        }

    } catch (globalError) {
        console.error("Server error:", globalError);
        return res.status(500).json({ message: "Internal server error" });
    }
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
