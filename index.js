import express from 'express' 
import mongoose from 'mongoose'   
import userRouter from './routes/userRouter.js'
import authenticateUser from './middlewares/authenticate.js'
import productRouter from './routes/productRouter.js'
import jwt from 'jsonwebtoken'

const app = express() 
const mongourl = "mongodb://admin:1234@ac-cwrme5v-shard-00-00.pm0ksjd.mongodb.net:27017,ac-cwrme5v-shard-00-01.pm0ksjd.mongodb.net:27017,ac-cwrme5v-shard-00-02.pm0ksjd.mongodb.net:27017/?ssl=true&replicaSet=atlas-14h5x5-shard-0&authSource=admin&appName=Cluster0"

mongoose.connect(mongourl).then(
    () => {
        console.log("Connected to MongoDB")    
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