import { round } from "../../../../lib/round.js";
import Product from "../../products/product.model.js";

export const calculateCartItems = async (orderItems) => {
  if (!orderItems || orderItems.length === 0) {
    throw new Error("Cart is empty");
  }

  let validatedItems = [];
  let itemsPrice = 0;
  let totalDiscount = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.countInStock < item.quantity) {
      throw new Error(`${product.name} is out of stock`);
    }

    // base price and final (discounted) price
    const originalPrice = product.price;
    const finalPrice = product.finalPrice;

    // amount saved per unit (could be 0 if no discount)
    const savedPerUnit = round(originalPrice - finalPrice);
    const discountForLine = round(savedPerUnit * item.quantity);

    const subtotal = round(finalPrice * item.quantity);

    itemsPrice += subtotal;
    totalDiscount += discountForLine;

    validatedItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      quantity: item.quantity,
      price: finalPrice,           // this is what the customer will pay per item
      originalPrice,               // helpful for UI to show "was $X"
      discountAmount: discountForLine,
      subtotal,
      // include raw discount object so callers can display more info if desired
      discount: product.discount || null,
    });
  }

  return {
    validatedItems,
    itemsPrice: round(itemsPrice),
    totalDiscount: round(totalDiscount),
  };
};