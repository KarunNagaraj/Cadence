import { Router } from "express";
import { User } from "../models/user.model";    

const router = Router();

router.post('/callback',async (req,res)=>{
    try{
    const {id, firstName, lastName, imageUrl} = req.body;
    const user = User.findOne({clerkId:id})
    if(!user){
        //signup
        await User.create({
            fullName:`${firstName} ${lastName}`,
            ImageUrl:imageUrl,
            clerkId:id
        })
    }
    res.status(200).json({message:"success"})
    }
    catch(error){
        console.log("error in auth callback",error);
        res.status(500).json({message:"Internal server error"})
    }

});
export default router;