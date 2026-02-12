import express from "express";
import { saveContactForm, getAllContactForm, deleteMessage } from "./contact.controller.js";

const contact_us_Router = express.Router();

contact_us_Router.post("/", saveContactForm);
contact_us_Router.get("/", getAllContactForm);
contact_us_Router.delete("/:id", deleteMessage);

export default contact_us_Router;