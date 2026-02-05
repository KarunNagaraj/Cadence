import mongoose from "mongoose";

export const conn = async()=>{
    try{
        const conn = await mongoose.connect({$MONGODB_URI});
        console.log(`Connection successfully ${conn.connection.host}`)
    }
    catch(error) 
    {
        console.log("Error while connecting to the server",error)
        process.exit(1) // 1 is fail, 0 is true
    }
    
}