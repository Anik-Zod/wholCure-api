import { round } from "../../../../lib/round.js";
import Product from "../../products/product.model.js";

export const calculateCartItems = async (orderItems) => {
  if (!orderItems || orderItems.length === 0) {
    throw new Error("Cart is empty");
  }

  let validatedItems = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.countInStock < item.quantity) {
      throw new Error(`${product.name} is out of stock`);
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

  return {
    validatedItems,
    itemsPrice: round(itemsPrice)
  };
};