import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
    {
        title : {type:String, required:true},
        description : {type:String, required:true},
        tags: [{type:String}],
        logo: {type:String},
        details: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const business = mongoose.model("Business", businessSchema);