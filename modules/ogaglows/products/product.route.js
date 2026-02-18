import express from "express"
import { getAllProducts, getProductById, addProduct, updateProduct, markOutOfStock } from "./product.controller.js";

import upload from "../../../middleware/upload.js";
const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.post("/", upload.array("images", 5), addProduct);
productRouter.put("/:id", upload.array("images", 5), updateProduct);
productRouter.put("/:id/out-of-stock", markOutOfStock);

export default productRouter;