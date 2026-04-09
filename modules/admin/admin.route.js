import express from "express";
import { 
    contactFormSend, 
    getAllContactForms, 
    deleteContactForm, 
    updateUI, 
    getUI, 
    loginAdmin, 
    registerAdmin, 
    getAdminProfile,
    updateAdminProfile,
    forgotPassword,
    resetPassword,
    getAllAdmins,
    updateAdmin,
    deleteAdmin,
    toggleAdminAccess,
    confirmPromotion
} from "./admin.controller.js";
import { isAdminAuthenticated, authorizeRole } from "../../middleware/adminAuth.js";
import upload from "../../middleware/upload.js";

const AdminRouter = express.Router();

AdminRouter.post("/login", loginAdmin);

// Only Super Admin can register new admin users
AdminRouter.post("/register", isAdminAuthenticated, authorizeRole("superadmin"), registerAdmin);

// Email Confirmation endpoint (publicly accessible because token provides auth)
AdminRouter.get("/confirm-promotion", confirmPromotion);

AdminRouter.get("/me", isAdminAuthenticated, getAdminProfile);
AdminRouter.put("/me", isAdminAuthenticated, upload.single("image"), updateAdminProfile);

// ── Auth & Password Recovery ───────────────────────────────────────────────
AdminRouter.post("/forgot-password", forgotPassword);
AdminRouter.post("/reset-password", resetPassword);

// ── Role Management Routes (Super Admin only) ─────────────────────────────
AdminRouter.get("/roles", isAdminAuthenticated, authorizeRole("superadmin"), getAllAdmins);
AdminRouter.put("/roles/:id", isAdminAuthenticated, authorizeRole("superadmin"), updateAdmin);
AdminRouter.delete("/roles/:id", isAdminAuthenticated, authorizeRole("superadmin"), deleteAdmin);
AdminRouter.patch("/roles/:id/toggle-access", isAdminAuthenticated, authorizeRole("superadmin"), toggleAdminAccess);

// ── Contact Forms ──────────────────────────────────────────────────────────
AdminRouter.post("/contactFormSend", contactFormSend);
AdminRouter.get("/getAllContactForms", isAdminAuthenticated, authorizeRole("superadmin", "admin"), getAllContactForms);
AdminRouter.delete("/deleteContactForm/:id", isAdminAuthenticated, authorizeRole("superadmin"), deleteContactForm);

// ── UI Settings ────────────────────────────────────────────────────────────
AdminRouter.put("/updateUI", isAdminAuthenticated, authorizeRole("superadmin"), updateUI);
AdminRouter.get("/getUI", getUI);

export default AdminRouter;
