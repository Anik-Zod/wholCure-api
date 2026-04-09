import ContactForm from "./contactForm.model.js";
import UI from "./ui.model.js";
import Admin from "./admin.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendAdminInvitationEmail, sendOtpEmail } from "../../utils/sendEmail.js";
import cloudinary from "../../config/cloudinary.js";

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
        // Created with isEmailVerified default to false
        const newAdmin = await Admin.create({ name, email, password: hashedPassword, role, phone });
        
        // Generate a confirmation token
        const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1d' });

        // Dispatch invitation email with confirmation links
        await sendAdminInvitationEmail(email, name, role, password, token);

        return res.status(201).json({ success: true, data: { name: newAdmin.name, email: newAdmin.email, role: newAdmin.role, isActive: newAdmin.isActive } });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function confirmPromotion(req, res) {
    const { token, action } = req.query;
    if (!token || !action) return res.status(400).send("Missing parameters");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
             return res.status(404).send("Admin account not found. It may have been deleted.");
        }

        if (action === 'confirm') {
            await Admin.findByIdAndUpdate(admin._id, { isEmailVerified: true, isActive: true });
            return res.send(`
              <html><body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                <h1 style="color: #10B981;">Promotion Confirmed!</h1>
                <p>Your email is verified. You may now log in to the dashboard.</p>
                <a href="${process.env.ADMIN_URL_LOCAL || "http://localhost:4000/auth/login"}" style="display:inline-block; margin-top:20px; padding: 10px 20px; background: #FC5524; color: white; border-radius: 5px; text-decoration: none; font-weight: bold;">Go to Login</a>
              </body></html>
            `);
        } else if (action === 'cancel') {
            await Admin.findByIdAndDelete(admin._id);
            return res.send(`
              <html><body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                <h1 style="color: #4B5563;">Promotion Cancelled</h1>
                <p>The pending admin account has been deleted successfully.</p>
              </body></html>
            `);
        } else {
             return res.status(400).send("Invalid action");
        }
    } catch (error) {
        return res.status(400).send("Invalid or expired token.");
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

        if (admin.isActive === false) {
            return res.status(403).json({ success: false, message: "Your access has been revoked. Contact a Super Admin." });
        }

        if (admin.isEmailVerified === false) {
            return res.status(403).json({ success: false, message: "Please verify your email before logging in." });
        }

        const token = jwt.sign({ id: admin._id, role: admin.role, email: admin.email }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1d' });

        return res.status(200).json({ success: true, token, admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, image: admin.image } });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function getAdminProfile(req, res) {
    try {
        const admin = await Admin.findById(req.admin.id).select("-password -resetPasswordOtp -resetPasswordOtpExpires");
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        return res.status(200).json({ success: true, admin });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function updateAdminProfile(req, res) {
    const { name, phone, currentPassword, newPassword } = req.body;
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        if (name) admin.name = name;
        if (phone !== undefined) admin.phone = phone;

        // Image upload handling
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "wholcare/admins",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            admin.image = result.secure_url;
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to set a new password." });
            }
            const isMatch = await bcrypt.compare(currentPassword, admin.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Incorrect current password." });
            }
            admin.password = await bcrypt.hash(newPassword, 12);
        }

        await admin.save();
        return res.status(200).json({ success: true, message: "Profile updated successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function forgotPassword(req, res) {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "No account found with this email." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.resetPasswordOtp = otp;
        admin.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await admin.save();

        await sendOtpEmail(admin.email, admin.name, otp);

        return res.status(200).json({ success: true, message: "OTP sent to your email." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    try {
        const admin = await Admin.findOne({ 
            email, 
            resetPasswordOtp: otp,
            resetPasswordOtpExpires: { $gt: Date.now() } 
        });

        if (!admin) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        admin.password = await bcrypt.hash(newPassword, 12);
        admin.resetPasswordOtp = undefined;
        admin.resetPasswordOtpExpires = undefined;
        await admin.save();

        return res.status(200).json({ success: true, message: "Password reset successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// ── Role Management (Super Admin only) ──────────────────────────────────────

export async function getAllAdmins(req, res) {
    try {
        const admins = await Admin.find({}).select("-password").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: admins });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch admins" });
    }
}

export async function updateAdmin(req, res) {
    const { id } = req.params;
    const { name, role, phone } = req.body;
    try {
        // Prevent super admin from downgrading themselves
        if (req.admin.id === id && role === 'admin') {
            return res.status(400).json({ success: false, message: "Super admin cannot downgrade their own role" });
        }

        const updated = await Admin.findByIdAndUpdate(
            id,
            { ...(name && { name }), ...(role && { role }), ...(phone !== undefined && { phone }) },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updated) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update admin" });
    }
}

export async function deleteAdmin(req, res) {
    const { id } = req.params;
    try {
        if (req.admin.id === id) {
            return res.status(400).json({ success: false, message: "You cannot delete your own account" });
        }
        const deleted = await Admin.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        return res.status(200).json({ success: true, message: "Admin deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete admin" });
    }
}

export async function toggleAdminAccess(req, res) {
    const { id } = req.params;
    try {
        if (req.admin.id === id) {
            return res.status(400).json({ success: false, message: "You cannot revoke your own access" });
        }
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        admin.isActive = !admin.isActive;
        await admin.save();
        return res.status(200).json({ success: true, isActive: admin.isActive, message: `Access ${admin.isActive ? 'restored' : 'revoked'} successfully` });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to toggle admin access" });
    }
}
