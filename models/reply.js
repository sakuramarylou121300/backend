const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const replySchema = new Schema({
    reply:{
        type: String,
        required: true,
    },
    client_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ClientInfo"
    },
    skilledId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "SkilledInfo"
    },
    comment_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ClientComment"
    },
    isDeleted:{
        type: Number,
        default: 0,
    }

},{timestamps: true})


module.exports = mongoose.model('Reply',replySchema)