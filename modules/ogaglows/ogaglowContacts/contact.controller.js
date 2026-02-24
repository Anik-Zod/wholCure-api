import Contact from "./contact.model.js";

// save contact_us form
export const saveContactForm = async (req, res) => {
    const { name, email, message,subject } = req.body || {};
    if (!name || !email || !message || !subject) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const contact = await Contact.create({ name, email, message, subject });

    if (!contact) {
        return res.status(500).json({ success: false, message: "Failed to save contact form" });
    }

    return res.status(201).json({ success: true, data: contact });
}


// get all contact_us form message 
export const getAllContactForm = async (req, res) => {
    const contacts = await Contact.find();

    if (!contacts) {
        return res.status(500).json({ success: false, message: "Failed to get contact form" });
    }

    return res.status(200).json({ success: true, data: contacts });
}

//delete message by id
export const deleteMessage = async (req, res) => {
    const { id } = req.params || {};
    if (!id) {
        return res.status(400).json({ success: false, message: "Message id is required" });
    }

    const message = await Contact.findByIdAndDelete(id);

    if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
    }

    return res.status(200).json({ success: true, message: "Message deleted successfully" });
}

