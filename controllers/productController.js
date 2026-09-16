import Product from "../models/product.js";
import {isAdmin} from "./userController.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";

export async function createProduct(req, res) {
    try {

        if(isAdmin(req)){
            const product = new Product(req.body);
            await product.save();
            const users = await User.find().select("email");
            if (users.length > 0) {
                await Notification.create({
                    type: "new-product",
                    title: "New product available",
                    message: `${product.name} has just been added to our store.`,
                    link: `/overview/${product.productId}`,
                    recipientEmails: users.map((user) => user.email)
                });
            }
            res.json({message: "Product created successfully"}) 
        }
        else{
            res.status(403).json({ message: "You need to login as an admin to create a product" });
            return
        }

    }catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({message: "Internal Server Error"})
    }
}




export async function getAllProducts(req, res) {
    console.log("Fetching all products");

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
        
            const priceChanged = Number(product.price) !== Number(req.body.price);
            await Product.findOneAndUpdate({productId : productId}, req.body);
            if (priceChanged) {
                const users = await User.find().select("email");
                if (users.length > 0) {
                    await Notification.create({
                        type: "new-product",
                        title: "Price updated",
                        message: `The price of ${product.name} has been updated.`,
                        link: `/overview/${product.productId}`,
                        recipientEmails: users.map((user) => user.email)
                    });
                }
            }
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


//Delay for outer website ones
async function halfsecondsDelay() {
    return new Promise(resolve => setTimeout(resolve, 500));
}







export async function getProductById(req, res) {
    try{
        await halfsecondsDelay(); // simulate a delay for 0.5 second

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





export async function searchProducts(req, res) {

    try{
        const query = req.params.query
         // const category = req.query.category - search by category is not implemented yet, but can be added later if needed
        //if category == all

        const products = await Product.find(
            {
                $or : [
                    { name : { $regex : query , $options : "i" } },
                    { description : { $regex : query , $options : "i" } },
                    { altNames : { $elemMatch : { $regex : query , $options : "i" } } }
                ],
                // category : category === "all" ? { $exists : true } : category                              
            }
        )
        res.json(products);

    }catch(error){
        console.error("Error searching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}
