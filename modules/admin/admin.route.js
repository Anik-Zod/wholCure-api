import express from "express";
import { contactFormSend } from "./admin.controller.js";

const AdminRouter = express.Router();

AdminRouter.post("/contactFormSend",contactFormSend);

export default AdminRouter;
