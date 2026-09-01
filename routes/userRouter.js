import express from 'express';
import {createUser, getAllUsers, getCurrentUser, loginUser, updateUserRole, updateUserStatus, googleLogin, updateUserProfile,updateUserPassword} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get("/me", getCurrentUser)
userRouter.post("/",createUser)
userRouter.post("/login", loginUser)
userRouter.get("/:pageSize/:pageNumber", getAllUsers)
userRouter.put("/role", updateUserRole)
userRouter.put("/status", updateUserStatus)
userRouter.put("/update" , updateUserProfile)
userRouter.put("/password" , updateUserPassword)
userRouter.post("/google" , googleLogin)

export default userRouter