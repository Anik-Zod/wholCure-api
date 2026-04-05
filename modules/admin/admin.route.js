import express from "express";
import { 
    contactFormSend, 
    getAllContactForms, 
    deleteContactForm, 
    updateUI, 
    getUI, 
    loginAdmin, 
    registerAdmin, 
    getAdminProfile 
} from "./admin.controller.js";
import { isAdminAuthenticated } from "../../middleware/adminAuth.js";

const AdminRouter = express.Router();

AdminRouter.post("/register", registerAdmin);
AdminRouter.post("/login", loginAdmin);
AdminRouter.get("/me", isAdminAuthenticated, getAdminProfile);

AdminRouter.post("/contactFormSend", contactFormSend);
AdminRouter.get("/getAllContactForms", isAdminAuthenticated, getAllContactForms);
AdminRouter.delete("/deleteContactForm/:id", isAdminAuthenticated, deleteContactForm);
AdminRouter.put("/updateUI", isAdminAuthenticated, updateUI);
AdminRouter.get("/getUI", getUI);

export default AdminRouter;
