import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter name"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Please enter email"],
            lowercase: true,
            trim: true,
        },
        subject: {
            type: String,
            required: [true, "Please enter subject"],
            trim: true,
        },

        message: {
            type: String,
            required: [true, "Please enter message"],
            trim: true,
        },
    },
    { timestamps: true }
);



const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
