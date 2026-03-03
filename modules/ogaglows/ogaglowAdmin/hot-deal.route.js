import express from "express";
import {
  getHotDeals,
  getHotDeal,
  createHotDeal,
  updateHotDeal,
  deleteHotDeal,
} from "./hot-deal.controller.js";

const HotDealRouter = express.Router();

HotDealRouter.get("/", getHotDeals);
HotDealRouter.get("/:id", getHotDeal);
HotDealRouter.post("/", createHotDeal);
HotDealRouter.put("/:id", updateHotDeal);
HotDealRouter.delete("/:id", deleteHotDeal);

export default HotDealRouter;