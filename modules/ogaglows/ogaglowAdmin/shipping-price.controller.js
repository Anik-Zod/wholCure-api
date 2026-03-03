import ShippingPriceModel from "./shipping-price.model.js";

// GET shipping price
export const getShippingPrice = async (req, res) => {
  try {
    let shippingPrice = await ShippingPriceModel.findOne();

    // If no record exists, create one with default price
    if (!shippingPrice) {
      shippingPrice = await ShippingPriceModel.create({ price: 0 });
    }

    res.json(shippingPrice);
  } catch (error) {
    console.error("Get shipping price error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

// CREATE / UPDATE shipping price
export const createOrUpdateShippingPrice = async (req, res) => {
  try {
    const { price } = req.body;

    // Validate price
    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Price is required"
      });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number"
      });
    }

    let shippingPrice = await ShippingPriceModel.findOne();

    if (shippingPrice) {
      // Update existing record
      shippingPrice.price = price;
      await shippingPrice.save();
    } else {
      // Create new record
      shippingPrice = await ShippingPriceModel.create({ price });
    }

    res.json(shippingPrice);
  } catch (error) {
    console.error("Create/Update shipping price error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};
