import Order from "../order.model.js";
import Product from "../../products/product.model.js";
import Customer from "../../customers/customer.model.js"
import { calculateCartItems } from "./pricing.service.js";
import { applyCoupon }  from "./coupon.service.js"
import { fetchShippingCost } from "../shipping.service.js";
import transporter from "../../../../config/mailer.js"
import { round } from "../../../../lib/round.js";



export const placeOrderService = async (data) => {
  const {
    customer,
    orderItems,
    shippingAddress,
    paymentMethod = "COD",
    couponCode,
    shippingPrice,
    taxPrice = 0,
    notes = "",
  } = data;

  // default shipping cost if not passed
  let appliedShipping = shippingPrice;
  if (appliedShipping == null) {
    appliedShipping = await fetchShippingCost();
  }

  // Validation
  if (!customer || !orderItems?.length || !shippingAddress) {
    throw new Error("Missing required fields");
  }

  // 1. Calculate items (including product-level discounts)
  const { validatedItems, itemsPrice, totalDiscount } = await calculateCartItems(orderItems);

  // 2. Apply coupon
  const { discountAmount, couponInfo } = await applyCoupon(
    couponCode,
    itemsPrice,
    validatedItems
  );

  // 3. Calculate total
  const totalPrice = round(itemsPrice + appliedShipping + taxPrice - discountAmount);
  if (totalPrice < 0) throw new Error("Invalid total price");

  // 4. Create order
  const newOrder = await Order.create({
    customer,
    orderItems: validatedItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === "ONLINE" ? "pending" : "pending",
    orderStatus: "pending",
    itemsPrice,
    shippingPrice: appliedShipping,
    taxPrice,
    discountAmount,
    totalPrice,
    notes,
    paidAt: null,
    // store product-level discount separately if needed (not currently in schema)
    // productDiscount: totalDiscount, // uncomment if added to order model
  });

  // 5. Create customer in DB
  const customerData = await Customer.create({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: shippingAddress.city,
    address: shippingAddress.address,
  });

  // 6. Reduce stock
  for (const item of validatedItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { countInStock: -item.quantity } }
    );
  }

  // 7. Send email (async, don’t await)
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customer.email,
    subject: `Order Confirmation - ${newOrder._id}`,
    text: `Thank you for your order.\nOrder ID: ${newOrder._id}\nTotal: $${totalPrice}`,
  }).catch((err) => console.log("Email error:", err));

  return {
    order: newOrder,
    coupon: couponInfo,
    totalPrice,
  };
};