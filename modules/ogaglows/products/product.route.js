import express from "express"
import { getAllProducts, getProductById, addProduct, updateProduct, markOutOfStock } from "./product.controller.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.post("/", addProduct);
productRouter.put("/:id", updateProduct);
productRouter.put("/:id/out-of-stock", markOutOfStock);

export default productRouter;