import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    photo: {
        type: String,
    },
    role: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    socialMedia:[{
        name: String,
        url: String
    }],
    description: {
        type: String,
    },
    
})

const Member = mongoose.model("Member", memberSchema);

export default Member;
