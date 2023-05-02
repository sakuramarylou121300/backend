const mongoose = require('mongoose') 

const Schema = mongoose.Schema  

const notificationSchema = new Schema({
    message:{
        type: String,
        required: true,
    },
    isRead:{
        type: Number,
        default: 0,
    },
    isDeleted:{
        type: Number,
        default: 0,
    },
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SkilledInfo'
    }, 
},{timestamps: true})

module.exports = mongoose.model('Notification',notificationSchema)