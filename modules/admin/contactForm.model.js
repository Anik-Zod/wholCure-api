import mongoose from "mongoose";

const contactFormSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    message: {
        type: String,
        required: true,
    },
    business: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const ContactForm = mongoose.model("ContactForm", contactFormSchema);

export default ContactForm;
