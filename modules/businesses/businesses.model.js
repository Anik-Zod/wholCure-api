import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
    {
        // Business Card Tab
        title: { type: String, required: true },
        description: { type: String, required: true },
        tags: [{ type: String }],

        // Business Page Tab
        category: { type: String },
        isVerified: { type: Boolean, default: true },
        location: { type: String, default: "Global / Remote" },
        website: { type: String },
        mainDescription: { type: String },
        mainButtonRewrite: { type: String },
        mainButtonLink: { type: String },
        mainButtonPDF: { type: String },
        serviceHeading: { type: String },
        serviceSubHeading: { type: String },
        features: [{ type: String }],
        industries: [{ type: String }],

        // Media
        logo: { type: String },
        coverPhoto: { type: String },
        images: [{ type: String }],

        // Legacy/Other
        whyWeBest: { type: String },
        partners: [{ type: String }],
        services: [
            {
                title: { type: String },
                description: { type: String },
                bgColour: { type: String },
            },
        ],
    },
    { timestamps: true }
);

export const business = mongoose.model("Business", businessSchema);