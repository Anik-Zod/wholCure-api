import ContactForm from "./contactForm.model.js";
import UI from "./ui.model.js";
import Admin from "./admin.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function contactFormSend(req, res) {
    const { fullName, email, message, subject,business } = req.body || {};

    // Validate input
    if (!fullName || !email || !message || !subject || !business) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Save to MongoDB
    const result = await ContactForm.create({ fullName, email, message, subject,business });

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



export async function registerAdmin(req, res) {
    const { name, email, password, role, phone } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Admin with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newAdmin = await Admin.create({ name, email, password: hashedPassword, role, phone });
        
        return res.status(201).json({ success: true, data: { name: newAdmin.name, email: newAdmin.email, role: newAdmin.role } });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function loginAdmin(req, res) {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: admin._id, role: admin.role, email: admin.email }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1d' });

        return res.status(200).json({ success: true, token, admin: { name: admin.name, email: admin.email, role: admin.role } });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function getAdminProfile(req, res) {
    try {
        const admin = await Admin.findById(req.admin.id).select("-password");
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        return res.status(200).json({ success: true, admin });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
