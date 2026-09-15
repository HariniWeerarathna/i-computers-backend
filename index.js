import express from 'express' 
import mongoose from 'mongoose'   
import userRouter from './routes/userRouter.js'
import authenticateUser from './middlewares/authenticate.js'
import productRouter from './routes/productRouter.js'
import orderRouter from './routes/orderRouter.js'
import reviewRouter from './routes/reviewRouter.js'
import cors from 'cors'
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

app.use(cors()) // middleware to allow cross-origin requests
app.use( authenticateUser)
app.use("/api/users",userRouter)
app.use("/api/products", productRouter)
app.use("/api/orders", orderRouter)
app.use("/api/reviews", reviewRouter)

// 1-1023 not used
app.listen(3000,
    () => {
        console.log("Server is running")
    }
)
