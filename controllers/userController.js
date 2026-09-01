import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config()

export async function createUser(req, res) {

    try{  

        const password = req.body.password;

        const passwordHash = bcrypt.hashSync(password, 10);
        //hashed password can not be reversed. 
        //salt is after . ---> "$2b$10$0FLTKLFUQQPdva1h/hhghf.yKH3kxl9VRaRd83u"

        const user = new User(
            {
                email : req.body.email,
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                password : passwordHash,
            }
        );

        await user.save();
        res.json({ message: "User created successfully" });


    }catch(error){
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};




export async function loginUser(req, res) {
   
    try {

        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email : email});

        if(user == null){
            res.status(404).json({ message: "User does not exist" });
            return
            //404 - no user in given email address
        }

        if(user.isBlocked){
            res.status(403).json({ message: "User is blocked" });
            return
        }


        const isPasswordMatching = bcrypt.compareSync(password, user.password);
        
        if(isPasswordMatching){

            const userInfo = {
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                image : user.image,
                emailVerified : user.isEmailVerified,
                isAdmin : user.isAdmin,
                isBlocked : user.isBlocked
            }

            const token = jwt.sign(userInfo , process.env.JWT_SECRET)
            res.json({ token : token , isAdmin : user.isAdmin , user : user});

        } else{
            res.status(401).json({ message: "Invalid password" });
            // 401 unauthorized user - wrong password
        }

    }
    catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });
        // 500 - internal server error 
    }
}






export async function getAllUsers(req,res){

    if(!isAdmin(req)){
        res.status(403).json({ message: "You are not authorized to view all users" });
        return
    }

    const pageSizeInString  = req.params.pageSize||"10" //"3"
    const pageNumberInString = req.params.pageNumber||"1" //"2"

    const pageSize = parseInt(pageSizeInString) //10
    const pageNumber = parseInt(pageNumberInString) //1


    try{    

        const totalUserCount = await User.countDocuments();
        const totalPages = Math.ceil(totalUserCount / pageSize)
        const pagesNeededToBeSkipped = pageNumber - 1
        const itemsNeededtoBeSkipped = pagesNeededToBeSkipped * pageSize
        const users = await User.find().skip(itemsNeededtoBeSkipped).limit(pageSize)

        return res.json({ users : users , totalPages : totalPages , currentPage : pageNumber , totalCount : totalUserCount });

    }catch(error){
        console.error("Error getting all users:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}




export async function updateUserStatus(req,res){

    if(!isAdmin(req)){
        res.status(403).json({ message: "You are not authorized to update user status" });
        return
    }

    const email = req.body.email;
    const isBlocked = req.body.isBlocked;

    try{

        if(email == req.user.email){
            res.status(400).json({ message: "You cannot update your own status" });
            return
        }

        const user = await User.findOne({email : email})
        if(user == null){
            res.status(404).json({ message: "User does not exist" });
            return
        }

        await User.findOneAndUpdate({email : email} , {isBlocked : isBlocked})
        res.json({ message: "User status updated successfully" });

    }catch(error){
        console.error("Error updating user status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}





export async function updateUserRole(req,res){

    if(!isAdmin(req)){
        res.status(403).json({ message: "You are not authorized to update user role" });
        return
    }

    const email = req.body.email;
    const isAdminRole = req.body.isAdmin;

    try{

        if(email == req.user.email){
            res.status(400).json({ message: "You cannot update your own role" });
            return
        }


        const user = await User.findOne({email : email})
        if(user == null){
            res.status(404).json({ message: "User does not exist" });
            return
        }

        await User.findOneAndUpdate({email : email} , {isAdmin : isAdminRole})
        res.json({ message: "User role updated successfully" });
        
    }catch(error){
        console.error("Error updating user role:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}






export async function getCurrentUser(req,res){

    if(req.user == null){
        res.status(401).json({ message: "You are not logged in" });
        return
    }

    try{
        const user = await User.findOne({email : req.user.email})

        if(user == null){
            res.status(404).json({ message: "User does not exist" });
            return
        }
        res.json({ user : user });

    }catch(error){
        console.error("Error getting current user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}






export async function updateUserProfile(req,res){

    if(req.user == null){
        res.status(401).json({ message: "You are not logged in" });
        return
    }

    try{
        const user = await User.findOne({email : req.user.email})
        if(user == null){
            res.status(404).json({ message: "User does not exist" });
            return
        }

        await User.findOneAndUpdate({email : req.user.email} , {
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            image : req.body.image
        })
        res.json({ message: "User profile updated successfully" });

    }catch(error){
        console.error("Error updating user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}





export async function updateUserPassword(req,res){

    if(req.user == null){
        res.status(401).json({ message: "You are not logged in" });
        return
    }

    try{
        const user = await User.findOne({email : req.user.email})
        if(user == null){
            res.status(404).json({ message: "User does not exist" });
            return
        }

        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        await User.findOneAndUpdate({email : req.user.email} , {
            password : hashedPassword
        })
        res.json({ message: "User profile updated successfully" });

    }catch(error){
        console.error("Error updating user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}







//*checking admin or not
// Important - Authorization and Authentication

export function isAdmin(req, res) {
     if(req.user == null){
		return false
	}

	if(!req.user.isAdmin){
		return false
	}
    return true
}


/*if(req.user == null){
    res.status(401).json({ message: "You need to login first before creating a student" });
    return
    }

  if(!req.user.isAdmin){
    res.status(403).json({ message: "You are not authorized to create a student" });
    return
    }
*/




export async function googleLogin(req,res){

    const accessToken = req.body.accessToken;

    try{

        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
            headers : {
                Authorization : `Bearer ${accessToken}`
            }
        })


        const user = await User.findOne({email : googleResponse.data.email})

        if(user == null){

            const randomPassword = Math.random().toString(36).slice(-8);

            const passwordHash = bcrypt.hashSync(randomPassword, 10);

            const newUser = new User({
                email : googleResponse.data.email,
                firstName : googleResponse.data.given_name,
                lastName : googleResponse.data.family_name || "User",
                password : passwordHash,
                image : googleResponse.data.picture,
                isEmailVerified : googleResponse.data.email_verified
            })

            const savedUser = await newUser.save();

            const userInfo = {
                email : savedUser.email,
                firstName : savedUser.firstName,
                lastName : savedUser.lastName,
                image : savedUser.image,
                emailVerified : savedUser.isEmailVerified,
                isAdmin : savedUser.isAdmin,
                isBlocked : savedUser.isBlocked
            }

            const token = jwt.sign(userInfo , process.env.JWT_SECRET)

            res.json({ token : token , isAdmin : savedUser.isAdmin , user : savedUser });


        }else{

            if(user.isBlocked){
                res.status(403).json({ message: "User is blocked" });
                return
            }

            const userInfo = {
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                image : user.image,
                emailVerified : user.isEmailVerified,
                isAdmin : user.isAdmin,
                isBlocked : user.isBlocked
            }

            const token = jwt.sign(userInfo , process.env.JWT_SECRET)

            res.json({ token : token , isAdmin : user.isAdmin , user : user });

        }

    }catch(error){
        console.error("Error logging in with Google:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}