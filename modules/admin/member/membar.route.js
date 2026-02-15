import express from "express";
import { createMember, deleteMember, getAllMembers, getMemberById, updateMember } from "./membar.controller.js";
import upload from "../../../middleware/upload.js";
const MembarRouter = express.Router();

MembarRouter.post("/",upload.single("photo"), createMember);
MembarRouter.put("/:id",upload.single("photo"), updateMember);
MembarRouter.delete("/:id", deleteMember);
MembarRouter.get("/", getAllMembers);
MembarRouter.get("/:id", getMemberById);

export default MembarRouter;
