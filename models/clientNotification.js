const mongoose = require('mongoose') 

const Schema = mongoose.Schema  

const clientNotificationSchema = new Schema({
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
    client_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ClientInfo'
    }, 
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('ClientNotification',clientNotificationSchema)