import mongoose from "mongoose";
import { Job } from "./job.model.js";

// add job
export default async function addJob(req, res) {
    const {
        job_title,
        employment_type,
        work_mode,
        industry,
        job_description,
        location,
        experience_level,
        salary_range,
        company_name,
        is_active
    } = req.body || {};

    if (!job_title || !employment_type || !work_mode || !industry || !job_description || !location || !experience_level || !company_name) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    const response = await Job.create({
        job_title,
        employment_type,
        work_mode,
        industry,
        job_description,
        location,
        experience_level,
        salary_range,
        company_name,
        is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ message: "Job created successfully", data: response });
}

// edit job
export async function editJob(req, res) {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Job ID" });
    }

    // Allow updating fields passed in body
    const updateFields = { ...(req.body || {}) };
    delete updateFields._id;
    delete updateFields.created_at;
    delete updateFields.updated_at;

    const response = await Job.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!response) {
        return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ message: "Job updated successfully", data: response });
}

// delete job
export async function deleteJob(req, res) {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Job ID" });
    }

    const response = await Job.findByIdAndDelete(id);

    if (!response) {
        return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
}

// get all jobs
export async function getAllJobs(req, res) {
    const response = await Job.find({});
    res.status(200).json({ data: response });
}

// get job by id
export async function getJobById(req, res) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Job ID" });
    }
    const response = await Job.findById(id);
    if (!response) {
        return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ data: response });
}
