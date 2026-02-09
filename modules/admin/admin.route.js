import express from "express";
import { contactFormSend, getAllContactForms, deleteContactForm, updateUI, getUI } from "./admin.controller.js";

const AdminRouter = express.Router();

AdminRouter.post("/contactFormSend", contactFormSend);
AdminRouter.get("/getAllContactForms", getAllContactForms);
AdminRouter.delete("/deleteContactForm/:id", deleteContactForm);
AdminRouter.put("/updateUI", updateUI);
AdminRouter.get("/getUI", getUI);

export default AdminRouter;
