import ContactForm from "./contactForm.model.js";
import UI from "./ui.model.js";

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

export async function getAllContactForms(req, res) {
    try {
        const contactForms = await ContactForm.find();
        return res.status(200).json(contactForms);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch contact forms" });
    }
}
export async function deleteContactForm(req, res) {
    const { id } = req.params;
    try {
        const result = await ContactForm.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ error: "Contact form not found" });
        }
        return res.status(200).json({ message: "Contact form deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete contact form" });
    }
}


export async function getUI(req, res) {
    try {
        let ui = await UI.findOne();
        if (!ui) {
            // Create default if none exists
            ui = await UI.create({});
        }
        return res.status(200).json(ui);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch UI settings" });
    }
}

export async function updateUI(req, res) {
    const { industries, projectsCompleted, happyClients, teamMembers } = req.body;
    try {
        let ui = await UI.findOne();
        if (!ui) {
            ui = await UI.create({ industries, projectsCompleted, happyClients, teamMembers });
        } else {
            ui = await UI.findByIdAndUpdate(ui._id, { industries, projectsCompleted, happyClients, teamMembers }, { new: true });
        }
        return res.status(200).json(ui);
    } catch (error) {
        return res.status(500).json({ error: "Failed to update UI" });
    }
}

