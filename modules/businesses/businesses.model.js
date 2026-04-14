import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
    {
        title : {type:String, required:true},
        description : {type:String, required:true},
        category: {type:String},
        tags: [{type:String}],
        logo: {type:String},
        coverPhoto: {type:String},
        location: {type:String, default: "Global / Remote"},
        isVerified: {type:Boolean, default: true},
        whyWeBest: {type:String},
        partners: [{type:String}],
        website: {type:String},
        images: [{type:String}],
        services: [
            {
                title: { type: String },
                description: { type: String },
                bgColour: { type: String },
            },
        ],
        details: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const business = mongoose.model("Business", businessSchema);