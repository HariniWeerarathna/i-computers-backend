import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
        return res.json({ message: "Internal server error" });
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

            const token = jwt.sign(userInfo , "comp99#12@")
            res.json({ token : token })

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






//checking admin or not
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