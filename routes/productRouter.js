import express from "express";
import {createProduct,getAllProducts,deleteProduct,updateProduct,getProductById} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/", createProduct);
productRouter.get("/", getAllProducts);

productRouter.delete("/:Id", deleteProduct);// x is a param for productId
//Delete request ----> localhost:3000/products/LAP001
//EX:LAP001 - productId

productRouter.put("/:Id", updateProduct);
productRouter.get("/:Id", getProductById);

export default productRouter;



//CRUD:create-post, read-get, update-put, delete-delete