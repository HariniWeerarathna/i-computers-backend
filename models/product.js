import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    altNames: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    price: {
        type: Number,
        required: true  
    },
    labelledPrice: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number, 
        default: 0
    }, 
    isAvailable: {
        type: Boolean,
        default: true   
    },
    category: {
        type: String,
    },
    brand: {
        type: String,
    },
    model: {
        type: String,
    },
})

const Product = mongoose.model("Product", productSchema)
export default Product