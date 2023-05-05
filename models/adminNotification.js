const mongoose = require('mongoose') 

const Schema = mongoose.Schema  

const adminNotificationSchema = new Schema({
    message:{
        type: String,
        required: true,
    },
    url:{
        type: String,
        required: true,
    },
    urlReact:{
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

module.exports = mongoose.model('AdminNotification',adminNotificationSchema)