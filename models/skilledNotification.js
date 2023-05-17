const mongoose = require('mongoose') 

const Schema = mongoose.Schema  

const skilledNotificationSchema = new Schema({
    messageReason:{
        type: String,
        required: true,
    },
    // url:{
    //     type: String,
    //     required: true,
    // },
    urlReact:{
        type: String,
        required: true,
    },
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SkilledInfo'
    }, 
    isRead:{
        type: Number,
        default: 0,
    },
    isDeleted:{
        type: Number,
        default: 0,
    }
},{timestamps: true})

module.exports = mongoose.model('SkilledNotification',skilledNotificationSchema)