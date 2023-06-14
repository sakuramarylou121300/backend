const mongoose = require('mongoose') 

const Schema = mongoose.Schema  

const skilledNotificationSchema = new Schema({
    message:{
        type: String,
        default: ''
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
        ref: 'SkilledInfo'
    }, 
    client_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientInfo'
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