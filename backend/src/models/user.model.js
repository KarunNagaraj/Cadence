import mongose from 'mongoose'

const userSchema = new mongose.Schema({
    fullName:{
        type: String,
        required: true,
    },

    ImageUrl:{
        type: String,
        required: true,
    },

    clerkId:{
        type: String,
        required: true,
        unique:true
    }

},{timestamps:true})