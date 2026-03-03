import ShippingCostModel from "./shipping-price.model.js";

// GET shipping cost
export const getShippingCost = async (req, res) => {
  try {
    let shippingCost = await ShippingCostModel.findOne();

    // If no record exists, create one with default value
    if (!shippingCost) {
      shippingCost = await ShippingCostModel.create({
        value: 0,
      });
    }

    res.json(shippingCost);
  } catch (error) {
    console.error("Get shipping cost error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

// CREATE / UPDATE shipping cost
export const createOrUpdateShippingCost = async (req, res) => {
  try {
    const { value } = req.body;

    // Validate value
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: "Value is required"
      });
    }

    if (isNaN(value) || value < 0) {
      return res.status(400).json({
        success: false,
        message: "Value must be a non-negative number"
      });
    }

    // findOneAndUpdate with upsert ensures atomic update or create
    const shippingCost = await ShippingCostModel.findOneAndUpdate(
      {},
      { 
        value,
        timestamp: new Date()
      },
      { 
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true
      }
    );

    res.json(shippingCost);
  } catch (error) {
    console.error("Create/Update shipping cost error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};
