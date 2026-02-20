import Order from "./order.model.js";
import transporter from "../../../config/mailer.js";
import Product from "../products/product.model.js"
import Coupon from "../products/coupon/coupon.model.js";

// float rounding helper
const round = (num) => Math.round(num * 100) / 100;


// price calculation 
export const checkoutPreview = async (req, res) => {
  try {
    const {
      orderItems,
      couponCode,
      shippingPrice = 0,
      taxPrice = 0
    } = req.body;

    // -------------------------
    // 1. VALIDATION
    // -------------------------
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    let validatedItems = [];
    let itemsPrice = 0;

    // -------------------------
    // 2. FETCH PRODUCT + RECALCULATE PRICE
    // -------------------------
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`
        });
      }

      // stock validation
      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      const price = product.price;
      const subtotal = round(price * item.quantity);

      itemsPrice += subtotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price,
        subtotal
      });
    }

    itemsPrice = round(itemsPrice);

    // -------------------------
    // 3. APPLY COUPON (ignore if invalid)
    // -------------------------
    let discountAmount = 0;
    let couponInfo = null;

    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true
        });

        if (coupon) {
          // expiry check
          if (!coupon.expiresAt || coupon.expiresAt >= new Date()) {

            // usage limit check
            if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {

              // minimum purchase
              if (!coupon.minPurchase || itemsPrice >= coupon.minPurchase) {

                // product-specific coupon
                let applicable = true;
                if (coupon.applicableProducts?.length) {
                  applicable = validatedItems.some(item =>
                    coupon.applicableProducts.some(id => id.equals(item.product))
                  );
                }

                if (applicable) {
                  // calculate discount
                  if (coupon.discountType === "percentage") {
                    discountAmount = round((itemsPrice * coupon.value) / 100);
                  } else {
                    discountAmount = coupon.value;
                  }
                  // prevent over-discount
                  discountAmount = Math.min(discountAmount, itemsPrice);

                  couponInfo = {
                    code: coupon.code,
                    discountType: coupon.discountType,
                    value: coupon.value,
                    discountAmount
                  };
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("Coupon check failed, ignoring coupon:", err.message);
        discountAmount = 0;
        couponInfo = null;
      }
    }

    // -------------------------
    // 4. FINAL TOTAL
    // -------------------------
    const totalPrice = round(
      itemsPrice + shippingPrice + taxPrice - discountAmount
    );

    if (totalPrice < 0) {
      return res.status(400).json({
        message: "Invalid price calculation"
      });
    }

    // -------------------------
    // 5. RESPONSE
    // -------------------------
    res.status(200).json({
      success: true,
      priceBreakdown: {
        itemsPrice,
        shippingPrice,
        taxPrice,
        discountAmount,
        totalPrice
      },
      items: validatedItems,
      coupon: couponInfo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Place Order 
export const placeOrder = async (req, res) => {
  try {
    const {
      customer,
      orderItems,
      shippingAddress,
      paymentMethod = "COD",
      couponCode,
      shippingPrice = 0,
      taxPrice = 0,
      notes = ""
    } = req.body;

    // -------------------------
    // 1. BASIC VALIDATION
    // -------------------------
    if (!customer || !orderItems?.length || !shippingAddress) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    let validatedItems = [];
    let itemsPrice = 0;

    // -------------------------
    // 2. FETCH PRODUCT + RE-CALCULATE PRICE
    // -------------------------
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`
        });
      }

      // stock validation
      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      const price = product.price;
      const subtotal = round(price * item.quantity);

      itemsPrice += subtotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price,
        subtotal
      });
    }

    itemsPrice = round(itemsPrice);

    // -------------------------
    // 3. APPLY COUPON
    // -------------------------
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
      });

      if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon" });
      }

      // expiry check
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ message: "Coupon expired" });
      }

      // usage limit check
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          message: "Coupon usage limit reached"
        });
      }

      // minimum purchase check
      if (itemsPrice < coupon.minPurchase) {
        return res.status(400).json({
          message: `Minimum purchase ${coupon.minPurchase} required`
        });
      }

      // product specific coupon check
      if (coupon.applicableProducts?.length) {
        const valid = validatedItems.some(item =>
          coupon.applicableProducts.some(id => id.equals(item.product))
        );

        if (!valid) {
          return res.status(400).json({
            message: "Coupon not applicable to selected products"
          });
        }
      }

      // calculate discount
      if (coupon.discountType === "percentage") {
        discountAmount = round((itemsPrice * coupon.value) / 100);
      } else {
        discountAmount = coupon.value;
      }

      // prevent discount > cart value
      discountAmount = Math.min(discountAmount, itemsPrice);

      appliedCoupon = coupon;
    }

    // -------------------------
    // 4. FINAL TOTAL
    // -------------------------
    const totalPrice = round(
      itemsPrice + shippingPrice + taxPrice - discountAmount
    );

    if (totalPrice < 0) {
      return res.status(400).json({
        message: "Invalid total price"
      });
    }

    // -------------------------
    // 5. CREATE ORDER
    // -------------------------
    const newOrder = await Order.create({
      customer,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "ONLINE" ? "pending" : "pending",
      orderStatus: "pending",
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      totalPrice,
      notes,
      paidAt: null
    });

    // -------------------------
    // 6. UPDATE COUPON USAGE
    // -------------------------
    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    // -------------------------
    // 7. REDUCE STOCK (recommended)
    // -------------------------
    for (const item of validatedItems) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { countInStock: -item.quantity } }
      );
    }

    // -------------------------
    // 8. SEND CONFIRMATION EMAIL (async)
    // -------------------------
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: `Order Confirmation - ${newOrder._id}`,
      text: `Thank you for your order.\nOrder ID: ${newOrder._id}\nTotal: $${totalPrice}`
    }).catch(err => console.log("Email error:", err));

    // -------------------------
    // 9. RESPONSE
    // -------------------------
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


export const getAllOrders = async(req,res)=>{
  const response = await Order.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    orders: response
  });
}
export const getOrderById = async(req,res)=>{
  const {id} = req.params;
  const response = await Order.findById(id);
  res.status(200).json({
    success: true,
    order: response
  });
}

export const updateOrderStatus = async(req,res)=>{
  const {id} = req.params;
  const {orderStatus} = req.body;
  const response = await Order.findByIdAndUpdate(id,{orderStatus},{new: true});
  res.status(200).json({
    success: true,
    order: response
  });
}