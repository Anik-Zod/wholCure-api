import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail", // Assuming it's gmail given it's @gmail.com
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendAdminInvitationEmail = async (email, name, role, temporaryPassword, token) => {
    try {
        const loginUrl = process.env.ADMIN_URL_LOCAL || "http://localhost:4000/auth/login"; // Adjust default as needed
        const mailOptions = {
            from: `"WholCure Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to WholCure Admin Dashboard",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #FC5524;">Action Required: Admin Promotion</h2>
                    <p>Hi <b>${name}</b>,</p>
                    <p>You have been promoted to the role of <b><span style="text-transform: capitalize;">${role}</span></b> on the WholCure Admin Dashboard.</p>
                    
                    <p>Please confirm this promotion via the button below. If you did not want this, you can safely cancel.</p>

                    <div style="margin: 25px 0;">
                        <a href="http://localhost:5000/api/admin/confirm-promotion?token=${token}&action=confirm" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: white; background-color: #10B981; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">
                            Confirm Promotion
                        </a>
                        <a href="http://localhost:5000/api/admin/confirm-promotion?token=${token}&action=cancel" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #4B5563; background-color: #F3F4F6; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
                            Cancel
                        </a>
                    </div>

                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your initial login credentials (valid after confirmation):</p>
                        <p style="margin: 0; font-size: 16px;"><b>Email:</b> ${email}</p>
                        <p style="margin: 5px 0 0 0; font-size: 16px;"><b>Password:</b> ${temporaryPassword}</p>
                    </div>

                    <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
                        If you believe you received this by mistake, please click Cancel or ignore this email.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const sendOtpEmail = async (email, name, otp) => {
    try {
        const mailOptions = {
            from: `"WholCure Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your WholCure Admin Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #FC5524;">Password Reset Request</h2>
                    <p>Hi <b>${name}</b>,</p>
                    <p>We received a request to reset your WholCure admin password.</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h1 style="margin: 0; letter-spacing: 5px; color: #111827;">${otp}</h1>
                    </div>

                    <p>This code will expire in 10 minutes.</p>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
                        If you did not request a password reset, please ignore this email or contact a Super Admin immediately.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("OTP Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false;
    }
};
