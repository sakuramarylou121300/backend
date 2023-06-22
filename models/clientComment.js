const mongoose = require('mongoose')    

const Schema = mongoose.Schema

const commentSchema = new Schema({
    star: {
        type: Number,
        default: 0
    },
    comment:{
        type: String
    },
    skill_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Skill" 
    },
    client_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ClientInfo"
    },
    skilledId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "SkilledInfo"
    },
    cloudinary_id:{
        type: String,
        required: true,
    },
    photo: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    }],
    isDeleted:{
        type: Number,
        default: 0,
    },
},{timestamps: true})


module.exports = mongoose.model('ClientComment',commentSchema)
