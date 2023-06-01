const mongoose = require('mongoose') 

const Schema = mongoose.Schema  

const messageSchema = new Schema({
    message:{
        type: String,
        ref: 'Reason',
        default: ''
    }
})

const clientBClearance = new Schema({
    photo:{
        type: String,
        required: true,
    },
    cloudinary_id:{
        type: String
    },
    bClearanceExp:{
        type: Date,
        required: true,
    },
    bClearanceIsVerified:{
        type: String,
        default: "pending",
    },
    message:[messageSchema],
    isRead:{
        type: Number,
        default: 0,
    },
    isExpired:{
        type: Number,
        default: 0,
    },
    isDeleted:{
        type: Number,
        default: 0,
    },
    client_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ClientInfo'
    }, 
},{timestamps: true})

module.exports = mongoose.model('ClientBClearance',clientBClearance)