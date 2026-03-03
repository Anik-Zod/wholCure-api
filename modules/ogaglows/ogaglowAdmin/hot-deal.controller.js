import HotDealModel from "./hot-deal.model.js";

// list all hot deals
export const getHotDeals = async (req, res) => {
  try {
    const deals = await HotDealModel.find().sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    console.error("Get hot deals error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get single deal
export const getHotDeal = async (req, res) => {
  try {
    const deal = await HotDealModel.findById(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: "Not found" });
    res.json(deal);
  } catch (error) {
    console.error("Get hot deal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// create deal
export const createHotDeal = async (req, res) => {
  try {
    const deal = await HotDealModel.create(req.body);
    res.status(201).json(deal);
  } catch (error) {
    console.error("Create hot deal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// update deal
export const updateHotDeal = async (req, res) => {
  try {
    const deal = await HotDealModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deal) return res.status(404).json({ success: false, message: "Not found" });
    res.json(deal);
  } catch (error) {
    console.error("Update hot deal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete deal
export const deleteHotDeal = async (req, res) => {
  try {
    const deal = await HotDealModel.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete hot deal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};