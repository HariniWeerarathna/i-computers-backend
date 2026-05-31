import Product from "../models/product.js";
import {isAdmin} from "./usercontroller.js";

export async function createProduct(req, res) {
    try {

        if(isAdmin(req)){
            const product = new Product(req.body);
            await product.save();
            res.json({message: "Product created successfully"}) 
        }
        else{
            res.status(403).json({ message: "You need to login as an admin to create a product" });
            return
        }

    }catch (error) {
        console.error("Error creating product:", error);
        return res.json({message: "Internal Server Error"})
    }
}




export async function getAllProducts(req, res) {

    try {
        if(isAdmin(req)){
            const products = await Product.find();
            res.json(products);
        }else{
            const products = await Product.find({isAvailable : true});
            res.json(products);
        }

    } catch (error) {
        console.error("Error fetching products:", error);
        return res.json({message: "Internal Server Error"})
    }
}




export async function deleteProduct(req, res) {

    try{
        const productId = req.params.Id;

        if(isAdmin(req)){

            const product = await Product.findOne({productId : productId});
            
            if(product == null){
                res.status(404).json({message: "Product does not exist"})
                return
            }

            await Product.findOneAndDelete({productId : productId});
            res.json({message: "Product deleted successfully"})

        }else{
            res.status(403).json({ message: "You need to login as an admin to delete a product" });
            return
        }

    }catch(error){
        console.error("Error deleting product:", error);
        return res.status(500).json({message: "Internal Server Error"})
    }   
}





export async function updateProduct(req, res) {

    try{
        const productId = req.params.Id;

        if(isAdmin(req)){
            const product = await Product.findOne({productId : productId});
            if(product == null){
                res.status(404).json({message: "Product does not exist"})
                return
            }
        
            await Product.findOneAndUpdate({productId : productId}, req.body);
            res.json({message: "Product updated successfully"})
        
        }else{
            res.status(403).json({ message: "You need to login as an admin to update a product" });
            return
        }

    }catch(error){
        console.error("Error updating product:", error);
        return res.status(500).json({message: "Internal Server Error"})
    }
}





export async function getProductById(req, res) {
    try{

        const productId = req.params.Id;
        const product = await Product.findOne({productId : productId});

        if(product == null){
            res.status(404).json({message: "Product does not exist"})
            return
        }

        if(product.isAvailable){
            res.json(product)
        }else{        
            if(isAdmin(req)){
                res.json(product)
            }else{
                res.status(403).json({ message: "Product does not exist" });
                return
            }
        }

    }catch(error){
        console.error("Error fetching product:", error);
        return res.status(500).json({message: "Internal Server Error"})
    }
}