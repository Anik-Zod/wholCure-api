import ContactForm from "./contactForm.model.js";

export async function contactFormSend(req, res) {
    const { fullName, email, message, subject } = req.body || {};

    // Validate input
    if (!fullName || !email || !message || !subject) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Save to MongoDB
    const result = await ContactForm.create({ fullName, email, message, subject });

    // Check if saving failed
    if (!result) {
        return res.status(500).json({ error: "Failed to save contact form" });
    }

    // Success
    return res.status(200).json({ message: "Contact form submitted successfully" });
}

export default ContactForm;