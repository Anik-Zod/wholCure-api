import mongoose from "mongoose";

const uiSchema = new mongoose.Schema({
    industries:{
        type:Number,
        default:8
    },
    projectsCompleted:{
        type:Number,
        default:500
    },
    happyClients:{
        type:Number,
        default:1000
    },
    teamMembers:{
        type:Number,
        default:200
    }
})

export default mongoose.model("UI", uiSchema);