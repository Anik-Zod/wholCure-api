import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Job", 
      required: true 
    },

    // Candidate info (no login needed)
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    linkedin: { type: String, trim: true },
    years_of_experience: { type: Number },
    bio: { type: String, trim: true },           // Why hire me
    resume_url: { type: String, trim: true },
    portfolio_url: { type: String, trim: true },

    status: { 
      type: String, 
      enum: ["Applied", "Shortlisted", "Rejected", "Hired"], 
      default: "Applied" 
    },
  },
  {
    timestamps: { createdAt: "applied_at", updatedAt: "updated_at" },
  }
);

// Indexes for faster filtering
applicationSchema.index({ job_id: 1 });                     // All applications for a job
applicationSchema.index({ email: 1 });                      // All applications by same email
applicationSchema.index({ job_id: 1, email: 1 }, { unique: true }); // Prevent duplicate application to same job

export const Application = mongoose.model("Application", applicationSchema);
