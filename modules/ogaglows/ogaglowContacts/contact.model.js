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
            unique: true,
            lowercase: true,
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

// Index for fast login check
contactSchema.index({ email: 1 });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
