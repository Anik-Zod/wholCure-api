import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    job_title: { type: String, required: true, trim: true },

    employment_type: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Intern", "Contract"],
      required: true,
    },

    work_mode: {
      type: String,
      enum: ["On-site", "Hybrid", "Remote"],
      required: true,
    },

    industry: {
      type: String,
      enum: ["Technology", "Construction", "Motors", "Real Estate","Marketing","Solar Electronics","Electronics","Packaging","Legal Services","Business Development","MedHIPPA","Institute","Ogaglow"],
      required: true,
    },

    job_description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },

    experience_level: {
      type: String,
      enum: ["Entry", "Mid", "Senior"],
      required: true,
    },

    salary_range: {          
      min: { type: Number },
      max: { type: Number },
    },

    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for filtering & performance
jobSchema.index({ industry: 1, employment_type: 1, work_mode: 1, is_active: 1 });

export const Job = mongoose.model("Job", jobSchema);
