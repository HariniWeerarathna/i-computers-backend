import express from 'express' 
import mongoose from 'mongoose'   
import userRouter from './routes/userRouter.js'
import authenticateUser from './middlewares/authenticate.js'
import productRouter from './routes/productRouter.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config() // load .env file and add the variables to process.env


const app = express() 
const mongourl = process.env.MONGO_URI

mongoose.connect(mongourl).then(
    () => {
        console.log("Connected to MongoDB")    
    }
).catch(
    () => {
        console.log("Error connecting to MongoDB")    
    }   
)



app.use(express.json()) // stop request - make Inorder(piliwelata haduwa) ---> to read json data from request body.

app.use( authenticateUser)
app.use("/users",userRouter)
app.use("/products", productRouter)

// 1-1023 not used
app.listen(3000,
    () => {
        console.log("Server is running")
    }
)